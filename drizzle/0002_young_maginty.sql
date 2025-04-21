CREATE TABLE `ansel-tracker_account_balance` (
	`id` text PRIMARY KEY NOT NULL,
	`plaid_account_id` text NOT NULL,
	`current` real NOT NULL,
	`available` real NOT NULL,
	`limit` real,
	`date` integer NOT NULL,
	FOREIGN KEY (`plaid_account_id`) REFERENCES `ansel-tracker_plaid_account`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ansel-tracker_plaid_account` (
	`id` text PRIMARY KEY NOT NULL,
	`plaid_id` text NOT NULL,
	`name` text NOT NULL,
	`nickname` text,
	`type` text NOT NULL,
	`subtype` text NOT NULL,
	`mask` text,
	`hidden` integer DEFAULT false,
	`plaid_item_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`plaid_item_id`) REFERENCES `ansel-tracker_plaid_item`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ansel-tracker_plaid_account_plaid_id_unique` ON `ansel-tracker_plaid_account` (`plaid_id`);--> statement-breakpoint
CREATE TABLE `ansel-tracker_plaid_item` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`access_token` text NOT NULL,
	`institution_id` text NOT NULL,
	`institution_name` text,
	`institution_logo` text,
	`account_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `ansel-tracker_account`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ansel-tracker_plaid_item_item_id_unique` ON `ansel-tracker_plaid_item` (`item_id`);--> statement-breakpoint
DROP TABLE `ansel-tracker_post`;