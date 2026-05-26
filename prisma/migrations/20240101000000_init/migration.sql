-- CreateTable
CREATE TABLE "wedding_settings" (
    "id" TEXT NOT NULL,
    "brideName" TEXT NOT NULL DEFAULT 'Bride',
    "groomName" TEXT NOT NULL DEFAULT 'Groom',
    "weddingDate" TEXT NOT NULL DEFAULT '2026-06-14',
    "selectedVenueId" TEXT,
    "dressCode" TEXT NOT NULL DEFAULT 'Garden Formal',
    "ourStory" TEXT NOT NULL DEFAULT '',
    "ceremonyTime" TEXT NOT NULL DEFAULT '4:00 PM',
    "receptionTime" TEXT NOT NULL DEFAULT '6:00 PM',
    "rsvpDeadline" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wedding_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "address" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "capacity" INTEGER,
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "side" TEXT NOT NULL DEFAULT 'bride',
    "hasPlusOne" BOOLEAN NOT NULL DEFAULT false,
    "plusOneName" TEXT,
    "plusOneDietary" TEXT,
    "dietary" TEXT,
    "rsvpStatus" TEXT NOT NULL DEFAULT 'pending',
    "tableId" TEXT,
    "seatNumber" INTEGER,
    "rsvpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seating_tables" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shape" TEXT NOT NULL DEFAULT 'round',
    "seats" INTEGER NOT NULL DEFAULT 8,
    "x" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "y" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "color" TEXT NOT NULL DEFAULT '#E1F5EE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "seating_tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "budgeted" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "color" TEXT NOT NULL DEFAULT '#8FAF7A',
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "budget_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Other',
    "name" TEXT NOT NULL,
    "contactName" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'researching',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "dueDate" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "assignedTo" TEXT NOT NULL DEFAULT 'Both',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gifts" (
    "id" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "value" DOUBLE PRECISION,
    "thankYouSent" BOOLEAN NOT NULL DEFAULT false,
    "receivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "gifts_pkey" PRIMARY KEY ("id")
);

-- Seed default budget categories
INSERT INTO "budget_categories" ("id", "name", "color", "order") VALUES
  ('cat_venue', 'Venue', '#8FAF7A', 1),
  ('cat_catering', 'Catering', '#5DCAA5', 2),
  ('cat_photo', 'Photography', '#378ADD', 3),
  ('cat_flowers', 'Flowers & Décor', '#EF9F27', 4),
  ('cat_music', 'Music / DJ', '#D85A30', 5),
  ('cat_attire', 'Attire', '#D4537E', 6),
  ('cat_honey', 'Honeymoon', '#7F77DD', 7),
  ('cat_stationery', 'Stationery', '#888780', 8);

-- Seed default wedding settings
INSERT INTO "wedding_settings" ("id", "brideName", "groomName", "weddingDate") VALUES
  ('settings_1', 'Bride', 'Groom', '2026-06-14');

-- Add new columns to guests table (safe - won't fail if already exists)
DO $$ BEGIN
  ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "notes" TEXT;
  ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "isInvitee" BOOLEAN NOT NULL DEFAULT false;
END $$;
