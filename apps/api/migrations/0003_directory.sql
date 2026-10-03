INSERT INTO jurisdictions (id, name) VALUES
('US','Federal'),('US-AL','Alabama'),('US-AK','Alaska'),('US-AZ','Arizona'),('US-AR','Arkansas'),
('US-CA','California'),('US-CO','Colorado'),('US-CT','Connecticut'),('US-DE','Delaware'),('US-DC','District of Columbia'),
('US-FL','Florida'),('US-GA','Georgia'),('US-HI','Hawaii'),('US-ID','Idaho'),('US-IL','Illinois'),('US-IN','Indiana'),
('US-IA','Iowa'),('US-KS','Kansas'),('US-KY','Kentucky'),('US-LA','Louisiana'),('US-ME','Maine'),('US-MD','Maryland'),
('US-MA','Massachusetts'),('US-MI','Michigan'),('US-MN','Minnesota'),('US-MS','Mississippi'),('US-MO','Missouri'),
('US-MT','Montana'),('US-NE','Nebraska'),('US-NV','Nevada'),('US-NH','New Hampshire'),('US-NJ','New Jersey'),
('US-NM','New Mexico'),('US-NY','New York'),('US-NC','North Carolina'),('US-ND','North Dakota'),('US-OH','Ohio'),
('US-OK','Oklahoma'),('US-OR','Oregon'),('US-PA','Pennsylvania'),('US-RI','Rhode Island'),('US-SC','South Carolina'),
('US-SD','South Dakota'),('US-TN','Tennessee'),('US-TX','Texas'),('US-UT','Utah'),('US-VT','Vermont'),('US-VA','Virginia'),
('US-WA','Washington'),('US-WV','West Virginia'),('US-WI','Wisconsin'),('US-WY','Wyoming');

UPDATE jurisdictions SET guidance_version='al-intro-2026-10-02',
summary='Alabama public records requests use state law, rather than federal FOIA. Start with the records custodian and the official filing instructions for your recipient.',
notes_json='["Alabama requester residency matters. The current RCFP guide describes the resident requirement and possible evidence of residency; confirm the applicable requirements before filing.","The law changed in 2024. This introductory profile does not calculate legal deadlines or determine whether a specific record is exempt.","Agency-specific forms and fees may apply. A generated letter may need to be entered into a required form.","Request existing records with a useful date range. Check published records before filing."]',
sources_json='[{"title":"Governor: public records and filing instructions","url":"https://governor.alabama.gov/public-records/","checkedAt":"2026-10-02"},{"title":"Secretary of State: public records policy","url":"https://www.sos.alabama.gov/public-records-request","checkedAt":"2026-10-02"},{"title":"RCFP: Alabama Open Government Guide (secondary reference)","url":"https://www.rcfp.org/open-government-guide/alabama/","checkedAt":"2026-10-02"},{"title":"Code of Alabama: official statute lookup","url":"https://alison.legislature.state.al.us/code-of-alabama","checkedAt":""}]'
WHERE id='US-AL';
UPDATE jurisdictions SET guidance_version='federal-intro-2026-10-02',
summary='Federal FOIA covers federal executive-branch agencies. A government directory listing alone does not establish FOIA eligibility or identify the right processing office.',
notes_json='["Find the appropriate agency component or FOIA office before filing.","Ask for existing records rather than asking an agency to answer questions or create a report.","Fees and exemptions may apply. No automatic response deadline is calculated in this release."]',
sources_json='[{"title":"FOIA.gov: requesting records and frequently asked questions","url":"https://www.foia.gov/faq.html","checkedAt":"2026-10-02"},{"title":"FOIA.gov: agency search","url":"https://www.foia.gov/agency-search.html","checkedAt":"2026-10-02"}]'
WHERE id='US';

INSERT INTO entities (id,name,description,jurisdiction_id,kind,website,custodian,channel,filing_url,filing_email,instructions,verification,checked_at,source_url) VALUES
('al-governor','Office of the Governor of Alabama','Executive-office records. Flight logs and contingency-fund reports are also published online.','US-AL','State office','https://governor.alabama.gov/','Public records coordinator','email','https://governor.alabama.gov/public-records/','openrecords@governor.alabama.gov','Complete the official request form linked on the source page and email it to the public records coordinator. This office only handles its own records. Fees may apply.','source_checked','2026-10-02','https://governor.alabama.gov/public-records/'),
('al-sos','Alabama Secretary of State','Business filings, election-related records, and records maintained by the Secretary of State.','US-AL','State office','https://www.sos.alabama.gov/','Public records office','portal','https://www.sos.alabama.gov/public-records-request-form',NULL,'Use the official Public Records Request Form. Some records are already searchable online, and voter information can follow a separate procedure. Review the published fee policy.','source_checked','2026-10-02','https://www.sos.alabama.gov/public-records-request'),
('al-huntsville','City of Huntsville','Municipal records, city decisions, contracts, and city services. Some police records follow a separate route.','US-AL','City','https://www.huntsvilleal.gov/','City public records office','portal','https://www.huntsvilleal.gov/government/public-records/',NULL,'Follow the Public Records Request Form link on the official page. The city states that its completed form is required and publishes a nonrefundable minimum processing fee of $25. Review the current terms before filing.','source_checked','2026-10-02','https://www.huntsvilleal.gov/government/public-records/');

INSERT OR IGNORE INTO entities (id,name,description,jurisdiction_id,kind,website,source_url,instructions)
SELECT 'federal-' || id,name,description,'US','Federal directory listing',website,
'https://govpeep-api.tech-hhamilton.workers.dev/api/agencies',
'Imported from the demo directory. Confirm legal coverage and the correct FOIA office using official sources before filing.' FROM agencies;
