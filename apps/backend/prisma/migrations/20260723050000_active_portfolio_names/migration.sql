-- Portfolio names are unique only among a user's active portfolios.
DROP INDEX IF EXISTS "portfolios_user_id_name_key";

CREATE UNIQUE INDEX "portfolios_user_id_active_name_key"
ON "portfolios" ("user_id", LOWER("name"))
WHERE "archived_at" IS NULL;
