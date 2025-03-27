export class RateLimiter {
  private timestamps: Map<string, number[]>;
  private readonly limit: number;
  private readonly interval: number;

  constructor(limit: number = 10, interval: number = 1000) {
    this.timestamps = new Map();
    this.limit = limit;
    this.interval = interval;
  }

  async waitForToken(key: string = 'default'): Promise<void> {
    if (!this.timestamps.has(key)) {
      this.timestamps.set(key, []);
    }

    const now = Date.now();
    const keyTimestamps = this.timestamps.get(key)!;
    this.timestamps.set(
      key,
      keyTimestamps.filter(time => now - time < this.interval)
    );

    if (keyTimestamps.length >= this.limit) {
      const oldestTimestamp = keyTimestamps[0];
      const waitTime = this.interval - (now - oldestTimestamp);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    keyTimestamps.push(now);
  }

  async executeWithRateLimit<T>(key: string, fn: () => Promise<T>): Promise<T> {
    await this.waitForToken(key);
    return fn();
  }
}

export const crawlerRateLimiter = new RateLimiter(5, 1000); // 5 requests per second