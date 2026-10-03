CREATE TABLE auth_user (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
  email_verified INTEGER NOT NULL DEFAULT 0, image TEXT,
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
);
CREATE TABLE auth_session (
  id TEXT PRIMARY KEY, expires_at INTEGER NOT NULL, token TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, ip_address TEXT, user_agent TEXT,
  user_id TEXT NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE
);
CREATE INDEX auth_session_user ON auth_session(user_id);
CREATE TABLE auth_account (
  id TEXT PRIMARY KEY, account_id TEXT NOT NULL, provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  access_token TEXT, refresh_token TEXT, id_token TEXT,
  access_token_expires_at INTEGER, refresh_token_expires_at INTEGER, scope TEXT, password TEXT,
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
);
CREATE INDEX auth_account_user ON auth_account(user_id);
CREATE TABLE auth_verification (
  id TEXT PRIMARY KEY, identifier TEXT NOT NULL, value TEXT NOT NULL,
  expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
);
CREATE INDEX auth_verification_identifier ON auth_verification(identifier);
CREATE TABLE auth_rate_limit (id TEXT PRIMARY KEY, key TEXT NOT NULL UNIQUE, count INTEGER NOT NULL, last_request INTEGER NOT NULL);
CREATE TABLE email_usage (day TEXT PRIMARY KEY, count INTEGER NOT NULL);
CREATE TABLE dev_mail (id TEXT PRIMARY KEY, email TEXT NOT NULL, url TEXT NOT NULL, expires_at INTEGER NOT NULL);
CREATE INDEX dev_mail_expiry ON dev_mail(expires_at);

CREATE TABLE jurisdictions (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, guidance_version TEXT,
  summary TEXT NOT NULL DEFAULT '', notes_json TEXT NOT NULL DEFAULT '[]', sources_json TEXT NOT NULL DEFAULT '[]'
);
CREATE TABLE entities (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL,
  jurisdiction_id TEXT NOT NULL REFERENCES jurisdictions(id), kind TEXT NOT NULL,
  website TEXT NOT NULL, custodian TEXT, channel TEXT NOT NULL DEFAULT 'unverified',
  filing_url TEXT, filing_email TEXT, instructions TEXT NOT NULL DEFAULT '',
  verification TEXT NOT NULL DEFAULT 'imported', checked_at TEXT, source_url TEXT NOT NULL
);
CREATE INDEX entities_jurisdiction_name ON entities(jurisdiction_id, name);
CREATE TABLE records_requests (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  draft_json TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft', version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, filed_at TEXT,
  reference_number TEXT NOT NULL DEFAULT '', guidance_version TEXT,
  last_mutation TEXT NOT NULL
);
CREATE INDEX requests_user_updated ON records_requests(user_id, updated_at DESC);
CREATE TABLE request_versions (
  request_id TEXT NOT NULL REFERENCES records_requests(id) ON DELETE CASCADE,
  version INTEGER NOT NULL, draft_json TEXT NOT NULL, letter TEXT NOT NULL,
  guidance_json TEXT NOT NULL, created_at TEXT NOT NULL,
  PRIMARY KEY (request_id, version)
);
CREATE TABLE request_events (
  id TEXT PRIMARY KEY, request_id TEXT NOT NULL REFERENCES records_requests(id) ON DELETE CASCADE,
  kind TEXT NOT NULL, note TEXT NOT NULL, occurred_at TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX events_request_date ON request_events(request_id, created_at);
