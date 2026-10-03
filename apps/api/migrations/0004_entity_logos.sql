-- The original images and agency.logo references were retained during migration.
ALTER TABLE entities ADD COLUMN logo TEXT;
UPDATE entities SET logo = (
  SELECT agencies.logo FROM agencies WHERE entities.id = 'federal-' || agencies.id
) WHERE id LIKE 'federal-%';
