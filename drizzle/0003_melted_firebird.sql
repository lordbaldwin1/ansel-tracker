DROP INDEX "ansel-tracker_plaid_account_plaid_id_unique";--> statement-breakpoint
DROP INDEX "ansel-tracker_plaid_item_item_id_unique";--> statement-breakpoint
DROP INDEX "ansel-tracker_session_token_unique";--> statement-breakpoint
DROP INDEX "ansel-tracker_user_email_unique";--> statement-breakpoint
ALTER TABLE `ansel-tracker_plaid_account` ALTER COLUMN "subtype" TO "subtype" text;--> statement-breakpoint
CREATE UNIQUE INDEX `ansel-tracker_plaid_account_plaid_id_unique` ON `ansel-tracker_plaid_account` (`plaid_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `ansel-tracker_plaid_item_item_id_unique` ON `ansel-tracker_plaid_item` (`item_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `ansel-tracker_session_token_unique` ON `ansel-tracker_session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `ansel-tracker_user_email_unique` ON `ansel-tracker_user` (`email`);