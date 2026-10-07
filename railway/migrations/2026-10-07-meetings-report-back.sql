-- Event Schedule: report back (attendance, gender split, outcomes, links, review sign-off) stored as JSON text
ALTER TABLE meetings ADD COLUMN report_back TEXT NULL;
