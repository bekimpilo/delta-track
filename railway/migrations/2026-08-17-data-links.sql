-- Add data source links (JSON array of {url, source, description}) to trackers
ALTER TABLE projects ADD COLUMN data_links TEXT NULL;
ALTER TABLE indicators ADD COLUMN data_links TEXT NULL;
