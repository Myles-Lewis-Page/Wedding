CREATE TABLE IF NOT EXISTS "rsvp_settings" (
  "id" TEXT NOT NULL DEFAULT 'main',
  "heading" TEXT NOT NULL DEFAULT 'Jennifer & Myles',
  "subheading" TEXT NOT NULL DEFAULT 'Join us as we celebrate our wedding day',
  "date_text" TEXT NOT NULL DEFAULT '',
  "venue_text" TEXT NOT NULL DEFAULT '',
  "hero_image" TEXT NOT NULL DEFAULT '',
  "accent_color" TEXT NOT NULL DEFAULT '#7A9C6E',
  "search_label" TEXT NOT NULL DEFAULT 'Enter your name as it appears on your invitation',
  "attending_label" TEXT NOT NULL DEFAULT 'Yes, I''ll be there!',
  "decline_label" TEXT NOT NULL DEFAULT 'Regretfully no',
  "confirmed_message" TEXT NOT NULL DEFAULT 'We can''t wait to celebrate with you!',
  "declined_message" TEXT NOT NULL DEFAULT 'Thank you for letting us know. We''ll be thinking of you!',
  "contact_email" TEXT NOT NULL DEFAULT '',
  CONSTRAINT "rsvp_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "rsvp_settings" ("id") VALUES ('main') ON CONFLICT DO NOTHING;
