CREATE TABLE `cart_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`quantity` real NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`icon` text DEFAULT '🛒' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`description` text NOT NULL,
	`amount` integer NOT NULL,
	`created_by_admin_id` integer NOT NULL,
	`created_at` text DEFAULT 'datetime(''now'')' NOT NULL,
	FOREIGN KEY (`created_by_admin_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`items` text NOT NULL,
	`subtotal` integer NOT NULL,
	`delivery_fee` integer DEFAULT 0 NOT NULL,
	`total` integer NOT NULL,
	`payment_method` text DEFAULT 'naqd' NOT NULL,
	`delivery_location` text,
	`status` text DEFAULT 'yangi' NOT NULL,
	`cancel_reason` text,
	`created_at` text DEFAULT 'datetime(''now'')' NOT NULL,
	`delivered_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category_id` integer NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`unit` text DEFAULT 'kg' NOT NULL,
	`step` real DEFAULT 0.5 NOT NULL,
	`image` text,
	`stock_qty` real DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`telegram_id` integer NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`phone` text,
	`is_admin` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT 'datetime(''now'')' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_telegram_id_unique` ON `users` (`telegram_id`);