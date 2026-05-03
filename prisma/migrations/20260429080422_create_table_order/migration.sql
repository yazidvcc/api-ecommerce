-- CreateTable
CREATE TABLE `orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `address` TEXT NOT NULL,
    `total_price` INTEGER NOT NULL,
    `total_weight` INTEGER NOT NULL,
    `shipping_cost` INTEGER NOT NULL,
    `shipping_service` VARCHAR(50) NOT NULL,
    `shipping_name` VARCHAR(50) NOT NULL,
    `shipping_type` VARCHAR(50) NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL,
    `payment_status` ENUM('SUCCESS', 'PENDING', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `tracking_number` VARCHAR(50) NULL,
    `status` ENUM('PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `product_variant_id` INTEGER NOT NULL,
    `quantity` SMALLINT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `order_items_order_id_product_variant_id_key`(`order_id`, `product_variant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_variant_id_fkey` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
