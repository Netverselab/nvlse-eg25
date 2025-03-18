CREATE TABLE search_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45),
    device_id VARCHAR(255),
    search_query TEXT,
    search_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    INDEX idx_ip_device (ip_address, device_id)
);