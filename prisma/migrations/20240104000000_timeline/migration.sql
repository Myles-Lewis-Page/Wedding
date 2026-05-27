CREATE TABLE IF NOT EXISTS "timeline_items" (
  "id" TEXT NOT NULL,
  "time" TEXT NOT NULL DEFAULT '',
  "title" TEXT NOT NULL,
  "desc" TEXT NOT NULL DEFAULT '',
  "who" TEXT NOT NULL DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "timeline_items_pkey" PRIMARY KEY ("id")
);

-- Default timeline
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

-- Add wedding_date to rsvp_settings if not exists
ALTER TABLE "rsvp_settings" ADD COLUMN IF NOT EXISTS "wedding_date" TEXT NOT NULL DEFAULT '';
