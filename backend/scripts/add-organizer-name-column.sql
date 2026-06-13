-- DEPRECATED: handled by migration 1740000000000-SchemaCorrectionsBaseline.ts
-- Manual fix if migrations cannot run:
-- psql -U postgres -d eventify_db -f scripts/add-organizer-name-column.sql

ALTER TABLE organizers ADD COLUMN IF NOT EXISTS "organizerName" character varying;

UPDATE organizers
SET "organizerName" = COALESCE(
  NULLIF(TRIM("organizerName"), ''),
  "organizationName",
  'Organizer'
)
WHERE "organizerName" IS NULL;

ALTER TABLE organizers ALTER COLUMN "organizerName" SET NOT NULL;
