CREATE TABLE `achievements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`year` integer NOT NULL,
	`date` text,
	`type` text NOT NULL,
	`medal` text,
	`athlete_id` integer,
	`competition_id` integer,
	`featured` integer DEFAULT false NOT NULL,
	`is_demo` integer DEFAULT false NOT NULL,
	`source_url` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `activity_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`entity_id` integer,
	`label` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `athletes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`name_ar` text,
	`gender` text NOT NULL,
	`category` text DEFAULT 'senior' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`primary_discipline_id` integer,
	`birth_year` integer,
	`club` text,
	`bio` text,
	`headline` text,
	`image_url` text,
	`featured` integer DEFAULT false NOT NULL,
	`is_demo` integer DEFAULT false NOT NULL,
	`source_url` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`primary_discipline_id`) REFERENCES `disciplines`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `athletes_slug_unique` ON `athletes` (`slug`);--> statement-breakpoint
CREATE INDEX `athletes_discipline_idx` ON `athletes` (`primary_discipline_id`);--> statement-breakpoint
CREATE TABLE `board_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`title` text NOT NULL,
	`group` text DEFAULT 'committee' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`image_url` text,
	`is_demo` integer DEFAULT false NOT NULL,
	`source_url` text
);
--> statement-breakpoint
CREATE TABLE `committees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`chair` text,
	`remit` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_demo` integer DEFAULT false NOT NULL,
	`source_url` text
);
--> statement-breakpoint
CREATE TABLE `competitions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`short_name` text,
	`level` text DEFAULT 'meeting' NOT NULL,
	`city` text,
	`country` text,
	`venue` text,
	`start_date` text,
	`end_date` text,
	`status` text DEFAULT 'upcoming' NOT NULL,
	`description` text,
	`image_url` text,
	`is_demo` integer DEFAULT false NOT NULL,
	`source_url` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `competitions_slug_unique` ON `competitions` (`slug`);--> statement-breakpoint
CREATE TABLE `disciplines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`group` text NOT NULL,
	`measure` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `disciplines_slug_unique` ON `disciplines` (`slug`);--> statement-breakpoint
CREATE TABLE `documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` text DEFAULT 'governance' NOT NULL,
	`url` text,
	`file_type` text DEFAULT 'PDF',
	`published_at` text,
	`is_demo` integer DEFAULT false NOT NULL,
	`source_url` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`type` text DEFAULT 'participation' NOT NULL,
	`competition_id` integer,
	`start_at` text,
	`end_at` text,
	`time_note` text,
	`location` text,
	`city` text,
	`country` text,
	`status` text DEFAULT 'upcoming' NOT NULL,
	`description` text,
	`is_demo` integer DEFAULT false NOT NULL,
	`source_url` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_slug_unique` ON `events` (`slug`);--> statement-breakpoint
CREATE TABLE `media` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`alt` text DEFAULT '' NOT NULL,
	`credit` text,
	`kind` text DEFAULT 'image' NOT NULL,
	`tags` text,
	`is_demo` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`topic` text DEFAULT 'general' NOT NULL,
	`body` text NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `news` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text,
	`body` text,
	`category` text DEFAULT 'federation' NOT NULL,
	`image_url` text,
	`author` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`published_at` text,
	`competition_id` integer,
	`created_by_id` integer,
	`is_demo` integer DEFAULT false NOT NULL,
	`source_url` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `news_slug_unique` ON `news` (`slug`);--> statement-breakpoint
CREATE INDEX `news_published_idx` ON `news` (`published_at`);--> statement-breakpoint
CREATE TABLE `news_athletes` (
	`news_id` integer NOT NULL,
	`athlete_id` integer NOT NULL,
	PRIMARY KEY(`news_id`, `athlete_id`),
	FOREIGN KEY (`news_id`) REFERENCES `news`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`athlete_id` integer NOT NULL,
	`competition_id` integer,
	`discipline_id` integer NOT NULL,
	`round` text DEFAULT 'final' NOT NULL,
	`position` integer,
	`mark` text,
	`mark_value` real,
	`wind` text,
	`date` text NOT NULL,
	`record` text,
	`is_sb` integer DEFAULT false NOT NULL,
	`medal` text,
	`notes` text,
	`is_demo` integer DEFAULT false NOT NULL,
	`source_url` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`discipline_id`) REFERENCES `disciplines`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `results_athlete_idx` ON `results` (`athlete_id`);--> statement-breakpoint
CREATE INDEX `results_competition_idx` ON `results` (`competition_id`);--> statement-breakpoint
CREATE INDEX `results_date_idx` ON `results` (`date`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'editor' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`last_login_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);