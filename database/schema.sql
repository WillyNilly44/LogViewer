-- Sample schema for PostgreSQL
-- Create this table in your AWS RDS instance

CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    level VARCHAR(10) NOT NULL DEFAULT 'INFO',
    message TEXT NOT NULL,
    source VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_source ON logs(source);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);

-- Insert sample data (optional)
INSERT INTO logs (level, message, source) VALUES 
('INFO', 'Application started successfully', 'app-server'),
('WARN', 'Database connection pool is running low', 'db-monitor'),
('ERROR', 'Failed to process user request', 'api-gateway'),
('INFO', 'User logged in', 'auth-service'),
('DEBUG', 'Cache hit for user profile', 'cache-service'),
('ERROR', 'Payment processing failed', 'payment-service'),
('INFO', 'Email sent successfully', 'notification-service'),
('WARN', 'High memory usage detected', 'system-monitor');

-- For MySQL, use this instead:
/*
CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    level VARCHAR(10) NOT NULL DEFAULT 'INFO',
    message TEXT NOT NULL,
    source VARCHAR(100),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_logs_level ON logs(level);
CREATE INDEX idx_logs_source ON logs(source);
CREATE INDEX idx_logs_created_at ON logs(created_at);
*/
