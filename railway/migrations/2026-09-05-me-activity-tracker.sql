-- M&E Activity Tracker (admin-only module)
CREATE TABLE IF NOT EXISTS me_activities (
  id CHAR(36) PRIMARY KEY,
  activity TEXT NULL,
  implementing_entity TEXT NULL,
  delivery_partner TEXT NULL,
  responsible TEXT NULL,
  key_project_activity TEXT NULL,
  sub_activity_no TEXT NULL,
  sub_activities TEXT NULL,
  inputs_resources TEXT NULL,
  task_no TEXT NULL,
  task TEXT NULL,
  status VARCHAR(50) NULL DEFAULT 'Not Yet Started',
  start_date DATE NULL,
  end_date DATE NULL,
  outputs TEXT NULL,
  indicator TEXT NULL,
  baseline TEXT NULL,
  target TEXT NULL,
  achieved TEXT NULL,
  variance TEXT NULL,
  means_of_verification TEXT NULL,
  delivery_partner_responsible TEXT NULL,
  comments TEXT NULL,
  created_by CHAR(36) NULL,
  modified_by CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_me_activities_status ON me_activities(status);
