-- Poster templates use immutable version snapshots for each ad creative.
CREATE TABLE IF NOT EXISTS poster_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  layout_json TEXT NOT NULL,
  background_image_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 0 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_poster_templates_single_active
  ON poster_templates(is_active)
  WHERE is_active = 1;

CREATE TABLE IF NOT EXISTS poster_template_versions (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  name TEXT NOT NULL,
  layout_json TEXT NOT NULL,
  background_image_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES poster_templates(id) ON DELETE CASCADE,
  UNIQUE(template_id, version)
);

INSERT INTO poster_templates (
  id, name, version, layout_json, background_image_url, is_active
)
SELECT
  'default-missing-person',
  '기본 실종자 포스터',
  1,
  '{"canvas":{"width":1080,"height":1350},"photo":{"x":36,"y":396,"width":462,"height":558,"objectFit":"cover","borderRadius":0},"qr":{"x":58,"y":1079,"width":236,"height":236,"objectFit":"contain","borderRadius":0},"name":{"x":765,"y":390,"width":270,"height":82,"fontSize":62,"minFontSize":34,"fontWeight":800,"color":"#111111","textAlign":"left","maxLines":1,"lineHeight":1.1},"age":{"x":765,"y":534,"width":270,"height":82,"fontSize":52,"minFontSize":30,"fontWeight":700,"color":"#111111","textAlign":"left","maxLines":1,"lineHeight":1.1},"gender":{"x":765,"y":678,"width":270,"height":82,"fontSize":52,"minFontSize":30,"fontWeight":700,"color":"#111111","textAlign":"left","maxLines":1,"lineHeight":1.1},"memo":{"x":660,"y":842,"width":350,"height":154,"fontSize":35,"minFontSize":22,"fontWeight":700,"color":"#111111","textAlign":"left","maxLines":4,"lineHeight":1.24}}',
  '/assets/missing-ad-template.png',
  1
WHERE NOT EXISTS (SELECT 1 FROM poster_templates WHERE is_active = 1);

ALTER TABLE subject_ad_creatives ADD COLUMN poster_template_id TEXT;
ALTER TABLE subject_ad_creatives ADD COLUMN poster_template_version INTEGER;
ALTER TABLE subject_ad_creatives ADD COLUMN poster_layout_json TEXT;
ALTER TABLE subject_ad_creatives ADD COLUMN poster_background_image_url TEXT;

CREATE INDEX IF NOT EXISTS idx_poster_template_versions_template
  ON poster_template_versions(template_id, version DESC);
