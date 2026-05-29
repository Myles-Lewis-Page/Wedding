-- Wedding Planner — full schema (safe to run multiple times)

CREATE TABLE IF NOT EXISTS "wedding_settings" (
  "id"              TEXT NOT NULL,
  "brideName"       TEXT NOT NULL DEFAULT 'Jennifer',
  "groomName"       TEXT NOT NULL DEFAULT 'Myles',
  "weddingDate"     TEXT NOT NULL DEFAULT '',
  "selectedVenueId" TEXT,
  "dressCode"       TEXT NOT NULL DEFAULT 'Garden Formal',
  "ourStory"        TEXT NOT NULL DEFAULT '',
  "ceremonyTime"    TEXT NOT NULL DEFAULT '4:00 PM',
  "receptionTime"   TEXT NOT NULL DEFAULT '6:00 PM',
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "wedding_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "venues" (
  "id"          TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "url"         TEXT NOT NULL DEFAULT '',
  "imageUrl"    TEXT NOT NULL DEFAULT '',
  "cost"        DOUBLE PRECISION NOT NULL DEFAULT 0,
  "address"     TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL DEFAULT '',
  "capacity"    INTEGER,
  "phone"       TEXT NOT NULL DEFAULT '',
  "email"       TEXT NOT NULL DEFAULT '',
  "website"     TEXT NOT NULL DEFAULT '',
  "amenities"   TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isSelected"  BOOLEAN NOT NULL DEFAULT false,
  "notes"       TEXT NOT NULL DEFAULT '',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "guests" (
  "id"             TEXT NOT NULL,
  "name"           TEXT NOT NULL,
  "email"          TEXT,
  "side"           TEXT NOT NULL DEFAULT 'bride',
  "hasPlusOne"     BOOLEAN NOT NULL DEFAULT false,
  "plusOneName"    TEXT,
  "plusOneDietary" TEXT,
  "dietary"        TEXT,
  "rsvpStatus"     TEXT NOT NULL DEFAULT 'pending',
  "tableId"        TEXT,
  "seatNumber"     INTEGER,
  "rsvpAt"         TIMESTAMP(3),
  "notes"          TEXT,
  "address"        TEXT DEFAULT '',
  "partyRole"      TEXT DEFAULT '',
  "isInvitee"      BOOLEAN NOT NULL DEFAULT false,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "seating_tables" (
  "id"        TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "shape"     TEXT NOT NULL DEFAULT 'round',
  "seats"     INTEGER NOT NULL DEFAULT 8,
  "x"         DOUBLE PRECISION NOT NULL DEFAULT 100,
  "y"         DOUBLE PRECISION NOT NULL DEFAULT 100,
  "color"     TEXT NOT NULL DEFAULT '#E1F5EE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "seating_tables_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "budget_categories" (
  "id"       TEXT NOT NULL,
  "name"     TEXT NOT NULL,
  "budgeted" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "paid"     DOUBLE PRECISION NOT NULL DEFAULT 0,
  "color"    TEXT NOT NULL DEFAULT '#8FAF7A',
  "order"    INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "budget_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "vendors" (
  "id"          TEXT NOT NULL,
  "category"    TEXT NOT NULL DEFAULT 'Other',
  "name"        TEXT NOT NULL,
  "contactName" TEXT NOT NULL DEFAULT '',
  "phone"       TEXT NOT NULL DEFAULT '',
  "email"       TEXT NOT NULL DEFAULT '',
  "website"     TEXT NOT NULL DEFAULT '',
  "cost"        DOUBLE PRECISION NOT NULL DEFAULT 0,
  "paid"        DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status"      TEXT NOT NULL DEFAULT 'researching',
  "notes"       TEXT NOT NULL DEFAULT '',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tasks" (
  "id"         TEXT NOT NULL,
  "title"      TEXT NOT NULL,
  "category"   TEXT NOT NULL DEFAULT 'General',
  "dueDate"    TIMESTAMP(3),
  "priority"   TEXT NOT NULL DEFAULT 'medium',
  "completed"  BOOLEAN NOT NULL DEFAULT false,
  "assignedTo" TEXT NOT NULL DEFAULT 'Both',
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "gifts" (
  "id"           TEXT NOT NULL,
  "fromName"     TEXT NOT NULL,
  "description"  TEXT NOT NULL DEFAULT '',
  "value"        DOUBLE PRECISION,
  "thankYouSent" BOOLEAN NOT NULL DEFAULT false,
  "receivedAt"   TIMESTAMP(3),
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gifts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "rsvp_settings" (
  "id"               TEXT NOT NULL DEFAULT 'main',
  "brideName"        TEXT NOT NULL DEFAULT '',
  "groomName"        TEXT NOT NULL DEFAULT '',
  "lastName"         TEXT NOT NULL DEFAULT '',
  "heading"          TEXT NOT NULL DEFAULT 'Our Wedding',
  "subheading"       TEXT NOT NULL DEFAULT 'Join us as we celebrate our wedding day',
  "dateText"         TEXT NOT NULL DEFAULT '',
  "venueText"        TEXT NOT NULL DEFAULT '',
  "heroImage"        TEXT NOT NULL DEFAULT '',
  "photo1"           TEXT NOT NULL DEFAULT '',
  "photo2"           TEXT NOT NULL DEFAULT '',
  "photo3"           TEXT NOT NULL DEFAULT '',
  "ourStory"         TEXT NOT NULL DEFAULT '',
  "dressCode"        TEXT NOT NULL DEFAULT 'Garden Formal',
  "dressCodeNote"    TEXT NOT NULL DEFAULT 'We would love for you to celebrate with us in attire that feels elegant and true to your style.',
  "accentColor"      TEXT NOT NULL DEFAULT '#4a7a44',
  "secondaryColor"   TEXT NOT NULL DEFAULT '#8fb882',
  "bgColor"          TEXT NOT NULL DEFAULT '#111714',
  "tertiaryColor"    TEXT NOT NULL DEFAULT '#1a2419',
  "titleColor"       TEXT NOT NULL DEFAULT '#ffffff',
  "subheaderColor"   TEXT NOT NULL DEFAULT '#000000',
  "bodyColor"        TEXT NOT NULL DEFAULT '#9ca3af',
  "swatchBridesmaids" TEXT NOT NULL DEFAULT '#9bb89a',
  "swatchSuits"      TEXT NOT NULL DEFAULT '#4a5568',
  "swatchVenue"      TEXT NOT NULL DEFAULT '#8b7355',
  "swatchFlowers"    TEXT NOT NULL DEFAULT '#e8b4bc',
  "searchLabel"      TEXT NOT NULL DEFAULT 'Enter your name as it appears on your invitation',
  "attendingLabel"   TEXT NOT NULL DEFAULT 'Yes, I''ll be there!',
  "declineLabel"     TEXT NOT NULL DEFAULT 'Regretfully no',
  "confirmedMessage" TEXT NOT NULL DEFAULT 'We can''t wait to celebrate with you!',
  "declinedMessage"  TEXT NOT NULL DEFAULT 'Thank you for letting us know. We''ll be thinking of you!',
  "contactEmail"     TEXT NOT NULL DEFAULT '',
  "weddingDate"      TEXT NOT NULL DEFAULT '',
  CONSTRAINT "rsvp_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "timeline_items" (
  "id"    TEXT NOT NULL,
  "time"  TEXT NOT NULL DEFAULT '',
  "title" TEXT NOT NULL,
  "desc"  TEXT NOT NULL DEFAULT '',
  "who"   TEXT NOT NULL DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "timeline_items_pkey" PRIMARY KEY ("id")
);

-- ── New tables ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "checklist_items" (
  "id"         TEXT NOT NULL,
  "section"    TEXT NOT NULL DEFAULT '',
  "item"       TEXT NOT NULL,
  "completed"  BOOLEAN NOT NULL DEFAULT false,
  "assignedTo" TEXT NOT NULL DEFAULT 'Both',
  "order"      INTEGER NOT NULL DEFAULT 0,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "attire_items" (
  "id"        TEXT NOT NULL,
  "person"    TEXT NOT NULL DEFAULT '',
  "item"      TEXT NOT NULL,
  "shop"      TEXT NOT NULL DEFAULT '',
  "status"    TEXT NOT NULL DEFAULT 'Shopping',
  "notes"     TEXT NOT NULL DEFAULT '',
  "order"     INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "attire_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "decor_items" (
  "id"        TEXT NOT NULL,
  "area"      TEXT NOT NULL DEFAULT '',
  "desc"      TEXT NOT NULL,
  "vendor"    TEXT NOT NULL DEFAULT '',
  "cost"      DOUBLE PRECISION NOT NULL DEFAULT 0,
  "done"      BOOLEAN NOT NULL DEFAULT false,
  "order"     INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "decor_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "playlist_songs" (
  "id"        TEXT NOT NULL,
  "section"   TEXT NOT NULL DEFAULT 'ceremony',
  "title"     TEXT NOT NULL,
  "artist"    TEXT NOT NULL DEFAULT '',
  "note"      TEXT NOT NULL DEFAULT '',
  "order"     INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "playlist_songs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "photoshoot_shots" (
  "id"        TEXT NOT NULL,
  "group"     TEXT NOT NULL DEFAULT 'Couples',
  "desc"      TEXT NOT NULL,
  "mustHave"  BOOLEAN NOT NULL DEFAULT false,
  "done"      BOOLEAN NOT NULL DEFAULT false,
  "order"     INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "photoshoot_shots_pkey" PRIMARY KEY ("id")
);

-- ── Default seeds ──────────────────────────────────────────────────────────

INSERT INTO "budget_categories" ("id","name","color","order") VALUES
  ('cat_venue','Venue','#8FAF7A',1),
  ('cat_catering','Catering','#5DCAA5',2),
  ('cat_photo','Photography','#378ADD',3),
  ('cat_flowers','Flowers & Décor','#EF9F27',4),
  ('cat_music','Music / DJ','#D85A30',5),
  ('cat_attire','Attire','#D4537E',6),
  ('cat_honey','Honeymoon','#7F77DD',7),
  ('cat_stationery','Stationery','#888780',8)
ON CONFLICT DO NOTHING;

INSERT INTO "timeline_items" ("id","time","title","desc","who","order") VALUES
  ('t1','3:30 PM','Guests arrive','','Ushers',1),
  ('t2','4:00 PM','Ceremony begins','Processional starts','Everyone',2),
  ('t3','4:45 PM','Cocktail hour','Couple does portraits','Guests',3),
  ('t4','6:00 PM','Reception opens','','Everyone',4),
  ('t5','6:30 PM','First dances & toasts','','Couple, Best man, MOH',5),
  ('t6','7:00 PM','Dinner service','','Catering',6),
  ('t7','9:00 PM','Cake cutting','','Couple',7),
  ('t8','11:30 PM','Last dance & send-off','Sparkler exit','Everyone',8)
ON CONFLICT DO NOTHING;

INSERT INTO "checklist_items" ("id","section","item","assignedTo","order") VALUES
  ('cl_1','12+ months','Set budget','Both',1),
  ('cl_2','12+ months','Choose date','Both',2),
  ('cl_3','12+ months','Book venue','Both',3),
  ('cl_4','12+ months','Hire photographer','Both',4),
  ('cl_5','12+ months','Start dress shopping','Bride',5),
  ('cl_6','12+ months','Book videographer','Both',6),
  ('cl_7','12+ months','Send save-the-dates','Both',7),
  ('cl_8','8–12 months','Book caterer','Both',8),
  ('cl_9','8–12 months','Hire florist','Both',9),
  ('cl_10','8–12 months','Book hair & makeup','Bride',10),
  ('cl_11','8–12 months','Book officiant','Both',11),
  ('cl_12','8–12 months','Book DJ or band','Both',12),
  ('cl_13','8–12 months','Register for gifts','Both',13),
  ('cl_14','6–8 months','Order wedding dress','Bride',14),
  ('cl_15','6–8 months','Choose wedding party attire','Both',15),
  ('cl_16','6–8 months','Book transportation','Both',16),
  ('cl_17','6–8 months','Book rehearsal dinner venue','Both',17),
  ('cl_18','6–8 months','Order cake','Both',18),
  ('cl_19','4–6 months','Send invitations','Both',19),
  ('cl_20','4–6 months','Finalize menu','Both',20),
  ('cl_21','4–6 months','Purchase wedding rings','Both',21),
  ('cl_22','4–6 months','Schedule dress fittings','Bride',22),
  ('cl_23','4–6 months','Book hotel room blocks','Both',23),
  ('cl_24','1–3 months','Final dress fitting','Bride',24),
  ('cl_25','1–3 months','Confirm all vendors','Both',25),
  ('cl_26','1–3 months','Finalize seating chart','Both',26),
  ('cl_27','1–3 months','Write vows','Both',27),
  ('cl_28','1–3 months','Get marriage license','Both',28),
  ('cl_29','Week of','Pick up dress','Bride',29),
  ('cl_30','Week of','Rehearsal dinner','Both',30),
  ('cl_31','Week of','Pack honeymoon','Both',31),
  ('cl_32','Week of','Confirm headcount','Both',32),
  ('cl_33','Week of','Rest & relax!','Both',33)
ON CONFLICT DO NOTHING;

INSERT INTO "attire_items" ("id","person","item","order") VALUES
  ('at_1','Bride','Wedding gown',1),
  ('at_2','Bride','Veil & accessories',2),
  ('at_3','Groom','Suit / tuxedo',3)
ON CONFLICT DO NOTHING;

INSERT INTO "photoshoot_shots" ("id","group","desc","mustHave","order") VALUES
  ('ps_1','Couples','First look reveal',true,1),
  ('ps_2','Ceremony','Bride walking down the aisle',true,2),
  ('ps_3','Ceremony','First kiss',true,3),
  ('ps_4','Family — Bride','Bride with both parents',true,4),
  ('ps_5','Family — Groom','Groom with both parents',true,5)
ON CONFLICT DO NOTHING;

INSERT INTO "playlist_songs" ("id","section","title","artist","note","order") VALUES
  ('pl_1','ceremony','Canon in D','Pachelbel','Processional',1),
  ('pl_2','ceremony','A Thousand Years','Christina Perri','Bride entrance',2),
  ('pl_3','dancing','Thinking Out Loud','Ed Sheeran','First dance',3),
  ('pl_4','donotplay','YMCA','Village People','',4)
ON CONFLICT DO NOTHING;
