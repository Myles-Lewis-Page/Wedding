-- Wedding Planner — full schema migration
-- Safe to run multiple times (IF NOT EXISTS / IF NOT EXISTS guards)

CREATE TABLE IF NOT EXISTS "wedding_settings" (
  "id" TEXT NOT NULL, "brideName" TEXT NOT NULL DEFAULT 'Jennifer', "groomName" TEXT NOT NULL DEFAULT 'Myles',
  "weddingDate" TEXT NOT NULL DEFAULT '', "selectedVenueId" TEXT, "dressCode" TEXT NOT NULL DEFAULT 'Garden Formal',
  "ourStory" TEXT NOT NULL DEFAULT '', "ceremonyTime" TEXT NOT NULL DEFAULT '4:00 PM',
  "receptionTime" TEXT NOT NULL DEFAULT '6:00 PM', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "wedding_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "venues" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "url" TEXT NOT NULL DEFAULT '', "imageUrl" TEXT NOT NULL DEFAULT '',
  "cost" DOUBLE PRECISION NOT NULL DEFAULT 0, "address" TEXT NOT NULL DEFAULT '', "description" TEXT NOT NULL DEFAULT '',
  "capacity" INTEGER, "phone" TEXT NOT NULL DEFAULT '', "email" TEXT NOT NULL DEFAULT '',
  "website" TEXT NOT NULL DEFAULT '', "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isSelected" BOOLEAN NOT NULL DEFAULT false, "notes" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "guests" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT, "side" TEXT NOT NULL DEFAULT 'bride',
  "hasPlusOne" BOOLEAN NOT NULL DEFAULT false, "plusOneName" TEXT, "plusOneDietary" TEXT,
  "dietary" TEXT, "rsvpStatus" TEXT NOT NULL DEFAULT 'pending', "tableId" TEXT,
  "seatNumber" INTEGER, "rsvpAt" TIMESTAMP(3), "notes" TEXT, "isInvitee" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "seating_tables" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "shape" TEXT NOT NULL DEFAULT 'round',
  "seats" INTEGER NOT NULL DEFAULT 8, "x" DOUBLE PRECISION NOT NULL DEFAULT 100,
  "y" DOUBLE PRECISION NOT NULL DEFAULT 100, "color" TEXT NOT NULL DEFAULT '#E1F5EE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "seating_tables_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "budget_categories" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "budgeted" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "paid" DOUBLE PRECISION NOT NULL DEFAULT 0, "color" TEXT NOT NULL DEFAULT '#8FAF7A',
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "budget_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "vendors" (
  "id" TEXT NOT NULL, "category" TEXT NOT NULL DEFAULT 'Other', "name" TEXT NOT NULL,
  "contactName" TEXT NOT NULL DEFAULT '', "phone" TEXT NOT NULL DEFAULT '',
  "email" TEXT NOT NULL DEFAULT '', "website" TEXT NOT NULL DEFAULT '',
  "cost" DOUBLE PRECISION NOT NULL DEFAULT 0, "paid" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'researching', "notes" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tasks" (
  "id" TEXT NOT NULL, "title" TEXT NOT NULL, "category" TEXT NOT NULL DEFAULT 'General',
  "dueDate" TIMESTAMP(3), "priority" TEXT NOT NULL DEFAULT 'medium',
  "completed" BOOLEAN NOT NULL DEFAULT false, "assignedTo" TEXT NOT NULL DEFAULT 'Both',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "gifts" (
  "id" TEXT NOT NULL, "fromName" TEXT NOT NULL, "description" TEXT NOT NULL DEFAULT '',
  "value" DOUBLE PRECISION, "thankYouSent" BOOLEAN NOT NULL DEFAULT false,
  "receivedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gifts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "rsvp_settings" (
  "id" TEXT NOT NULL DEFAULT 'main', "heading" TEXT NOT NULL DEFAULT 'Jennifer & Myles',
  "subheading" TEXT NOT NULL DEFAULT 'Join us as we celebrate our wedding day',
  "dateText" TEXT NOT NULL DEFAULT '', "venueText" TEXT NOT NULL DEFAULT '',
  "heroImage" TEXT NOT NULL DEFAULT '', "photo1" TEXT NOT NULL DEFAULT '',
  "photo2" TEXT NOT NULL DEFAULT '', "photo3" TEXT NOT NULL DEFAULT '',
  "accentColor" TEXT NOT NULL DEFAULT '#4a7a44', "secondaryColor" TEXT NOT NULL DEFAULT '#8fb882',
  "bgColor" TEXT NOT NULL DEFAULT '#111714',
  "searchLabel" TEXT NOT NULL DEFAULT 'Enter your name as it appears on your invitation',
  "attendingLabel" TEXT NOT NULL DEFAULT 'Yes, I''ll be there!',
  "declineLabel" TEXT NOT NULL DEFAULT 'Regretfully no',
  "confirmedMessage" TEXT NOT NULL DEFAULT 'We can''t wait to celebrate with you!',
  "declinedMessage" TEXT NOT NULL DEFAULT 'Thank you for letting us know. We''ll be thinking of you!',
  "contactEmail" TEXT NOT NULL DEFAULT '', "weddingDate" TEXT NOT NULL DEFAULT '',
  CONSTRAINT "rsvp_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "timeline_items" (
  "id" TEXT NOT NULL, "time" TEXT NOT NULL DEFAULT '', "title" TEXT NOT NULL,
  "desc" TEXT NOT NULL DEFAULT '', "who" TEXT NOT NULL DEFAULT '', "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "timeline_items_pkey" PRIMARY KEY ("id")
);

-- Add new columns to existing tables (safe, skips if exists)
ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "photo1" TEXT NOT NULL DEFAULT '';
ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "photo2" TEXT NOT NULL DEFAULT '';
ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "photo3" TEXT NOT NULL DEFAULT '';
ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "secondaryColor" TEXT NOT NULL DEFAULT '#8fb882';
ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "bgColor" TEXT NOT NULL DEFAULT '#111714';
ALTER TABLE guests ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS "isInvitee" BOOLEAN NOT NULL DEFAULT false;

-- Seed default budget categories
INSERT INTO "budget_categories" ("id","name","color","order") VALUES
  ('cat_venue','Venue','#8FAF7A',1), ('cat_catering','Catering','#5DCAA5',2),
  ('cat_photo','Photography','#378ADD',3), ('cat_flowers','Flowers & Décor','#EF9F27',4),
  ('cat_music','Music / DJ','#D85A30',5), ('cat_attire','Attire','#D4537E',6),
  ('cat_honey','Honeymoon','#7F77DD',7), ('cat_stationery','Stationery','#888780',8)
ON CONFLICT DO NOTHING;

-- Seed default timeline
INSERT INTO "timeline_items" ("id","time","title","desc","who","order") VALUES
  ('t1','3:30 PM','Guests arrive','','Ushers',1), ('t2','4:00 PM','Ceremony begins','Processional starts','Everyone',2),
  ('t3','4:45 PM','Cocktail hour','Couple does portraits','Guests',3), ('t4','6:00 PM','Reception opens','','Everyone',4),
  ('t5','6:30 PM','First dances & toasts','','Couple, Best man, MOH',5), ('t6','7:00 PM','Dinner service','','Catering',6),
  ('t7','9:00 PM','Cake cutting','','Couple',7), ('t8','11:30 PM','Last dance & send-off','Sparkler exit','Everyone',8)
ON CONFLICT DO NOTHING;

-- Add tertiaryColor column (card/surface color)
ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "tertiaryColor" TEXT NOT NULL DEFAULT '#1a2419';

-- Add address column to guests
ALTER TABLE guests ADD COLUMN IF NOT EXISTS "address" TEXT DEFAULT '';

-- Add partyRole to guests
ALTER TABLE guests ADD COLUMN IF NOT EXISTS "partyRole" TEXT DEFAULT '';

-- Add text color columns
ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "titleColor" TEXT NOT NULL DEFAULT '#ffffff';
ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "subheaderColor" TEXT NOT NULL DEFAULT '#000000';
ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "bodyColor" TEXT NOT NULL DEFAULT '#9ca3af';

-- Add couple name fields
ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "brideName" TEXT NOT NULL DEFAULT '';
ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "groomName" TEXT NOT NULL DEFAULT '';

ALTER TABLE rsvp_settings ADD COLUMN IF NOT EXISTS "lastName" TEXT NOT NULL DEFAULT '';
