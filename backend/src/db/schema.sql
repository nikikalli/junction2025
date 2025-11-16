-- Ensure postgres role has login permission
ALTER ROLE postgres WITH LOGIN;

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    canvas_id VARCHAR(255) NOT NULL,
    start_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create campaign_implementations table
CREATE TABLE IF NOT EXISTS campaign_implementations (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create action table
CREATE TABLE IF NOT EXISTS action (
    id SERIAL PRIMARY KEY,
    campaign_implementation_id INTEGER NOT NULL REFERENCES campaign_implementations(id) ON DELETE CASCADE,
    day_of_campaign TIMESTAMP NOT NULL,
    channel VARCHAR(100) NOT NULL,
    message_subject TEXT NOT NULL,
    message_body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_campaign_implementations_campaign_id
    ON campaign_implementations(campaign_id);

CREATE INDEX IF NOT EXISTS idx_action_campaign_implementation_id
    ON action(campaign_implementation_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_implementations_updated_at BEFORE UPDATE ON campaign_implementations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_action_updated_at BEFORE UPDATE ON action
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
