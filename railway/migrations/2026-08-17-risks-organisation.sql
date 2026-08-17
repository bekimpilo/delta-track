-- Add organisation to Risk Register
ALTER TABLE risks ADD COLUMN organisation VARCHAR(255) NULL AFTER risk_id;
