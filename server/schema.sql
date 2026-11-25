CREATE TABLE IF NOT EXISTS contact_requests (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enquiries (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp_consent BOOLEAN NOT NULL DEFAULT TRUE,
  project_title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blogs (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  author TEXT NOT NULL DEFAULT 'HP Global Infrra',
  snippet TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  published_at DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE blogs ADD COLUMN IF NOT EXISTS author TEXT NOT NULL DEFAULT 'HP Global Infrra';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS snippet TEXT NOT NULL DEFAULT '';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS content TEXT NOT NULL DEFAULT '';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS published_at DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS properties (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_credentials (
  email TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_projects (
  id BIGSERIAL PRIMARY KEY,
  portfolio_category TEXT NOT NULL CHECK (portfolio_category IN ('hpg', 'partner')),
  project_type TEXT NOT NULL CHECK (project_type IN ('commercial', 'residential')),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  price TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS featured_project_settings (
  id SMALLINT PRIMARY KEY CHECK (id = 1),
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pages (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL DEFAULT '',
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS press_clippings (
  id BIGSERIAL PRIMARY KEY,
  media_type TEXT NOT NULL CHECK (media_type IN ('print', 'video', 'online')),
  publication TEXT NOT NULL,
  headline TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  published_on DATE NOT NULL,
  project TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  document_url TEXT NOT NULL DEFAULT '',
  video_url TEXT NOT NULL DEFAULT '',
  article_url TEXT NOT NULL DEFAULT '',
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS press_clippings_project_idx ON press_clippings (lower(project));

ALTER TABLE pages ADD COLUMN IF NOT EXISTS system_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS pages_system_key_idx ON pages (system_key) WHERE system_key IS NOT NULL;
-- Google & sharing settings per page (blank = use the defaults from Site details).
ALTER TABLE pages ADD COLUMN IF NOT EXISTS seo_title TEXT NOT NULL DEFAULT '';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS share_image TEXT NOT NULL DEFAULT '';

-- Project pages: every portfolio project gets its own URL and optional page content.
ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT '';
ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS portfolio_projects_slug_idx ON portfolio_projects (slug) WHERE slug IS NOT NULL;

-- Admin: lead tracking, read state, article drafts.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_requests' AND column_name = 'read_at') THEN
    ALTER TABLE contact_requests ADD COLUMN read_at TIMESTAMPTZ;
    -- Messages received before this change were already seen in the old admin.
    UPDATE contact_requests SET read_at = created_at;
  END IF;
END $$;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT '';
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT '';
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS is_draft BOOLEAN NOT NULL DEFAULT FALSE;
