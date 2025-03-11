import { NextResponse } from 'next/server';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  retryAfterMs: number;
  maxRetries: number;
  queueSize?: number;
}

class RateLimiter {
  private requests: Map<string, number[]>;
  private config: RateLimitConfig;
  private queue: Map<string, Array<() => Promise<any>>>;
  private processing: Map<string, boolean>;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.requests = new Map();
    this.queue = new Map();
    this.processing = new Map();
    this.config = {
      maxRequests: 3,
      windowMs: 30000, // 30 seconds
      retryAfterMs: 2000, // Initial retry after 2 seconds
      maxRetries: 5,
      queueSize: 200,
      ...config
    };
  }

  private cleanOldRequests(key: string): void {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(
      timestamp => now - timestamp < this.config.windowMs
    );
    if (validRequests.length > 0) {
      this.requests.set(key, validRequests);
    } else {
      this.requests.delete(key);
    }
  }

  public async checkRateLimit(
    key: string,
    retryCount: number = 0
  ): Promise<{ success: boolean; retryAfter?: number }> {
    this.cleanOldRequests(key);

    const requests = this.requests.get(key) || [];
    if (requests.length >= this.config.maxRequests) {
      const oldestRequest = requests[0];
      const resetTime = oldestRequest + this.config.windowMs;
      const now = Date.now();

      if (now < resetTime) {
        if (retryCount >= this.config.maxRetries) {
          return { success: false };
        }

        // Exponential backoff
        const retryAfter = Math.min(
          this.config.retryAfterMs * Math.pow(2, retryCount),
          this.config.windowMs
        );

        return { success: false, retryAfter };
      }
    }

    requests.push(Date.now());
    this.requests.set(key, requests);
    return { success: true };
  }

  private async addToQueue<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const queue = this.queue.get(key) || [];
    if (queue.length >= (this.config.queueSize || 100)) {
      throw new Error('Queue size limit exceeded');
    }

    return new Promise((resolve, reject) => {
      queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.queue.set(key, queue);
    });
  }

  private async processQueue(key: string): Promise<void> {
    if (this.processing.get(key)) return;
    
    const queue = this.queue.get(key) || [];
    if (queue.length === 0) {
      this.processing.delete(key);
      return;
    }

    this.processing.set(key, true);
    const fn = queue.shift();
    this.queue.set(key, queue);

    if (fn) {
      try {
        await fn();
      } catch (error) {
        console.error(`Error processing queued request for ${key}:`, error);
      }

      if (queue.length > 0) {
        const delay = Math.max(
          this.config.retryAfterMs,
          Math.ceil(this.config.windowMs / this.config.maxRequests)
        );
        setTimeout(() => {
          this.processing.delete(key);
          this.processQueue(key);
        }, delay);
      } else {
        this.processing.delete(key);
      }
    }
  }

  public async executeWithRateLimit<T>(
    key: string,
    fn: () => Promise<T>,
    retryCount: number = 0
  ): Promise<T> {
    const rateLimitCheck = await this.checkRateLimit(key, retryCount);

    if (!rateLimitCheck.success) {
      if (retryCount >= this.config.maxRetries) {
        // If we've exceeded retries, add to queue and start processing
        const queuedResult = await this.addToQueue(key, fn);
        this.processQueue(key);
        return queuedResult;
      }
      
      const retryDelay = rateLimitCheck.retryAfter || this.config.retryAfterMs;
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return this.executeWithRateLimit(key, fn, retryCount + 1);
    }

    try {
      const result = await fn();
      // Process any queued requests after successful execution
      await this.processQueue(key);
      return result;
    } catch (error) {
      if (error instanceof Error && 
          (error.message.includes('429') || error.message.toLowerCase().includes('rate limit'))) {
        if (retryCount < this.config.maxRetries) {
          const backoffDelay = this.config.retryAfterMs * Math.pow(2, retryCount);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          return this.executeWithRateLimit(key, fn, retryCount + 1);
        }
        // If we've exceeded retries, add to queue
        const queuedResult = await this.addToQueue(key, fn);
        this.processQueue(key);
        return queuedResult;
      }
      throw error;
    }
  }
}

// Create a singleton instance
const rateLimiter = new RateLimiter();

export default rateLimiter;