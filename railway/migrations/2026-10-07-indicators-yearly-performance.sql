-- Stores Q1-Q4 and annual actuals for Years 1-6 as JSON text
ALTER TABLE indicators ADD COLUMN yearly_performance TEXT NULL;
