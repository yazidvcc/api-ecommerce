/*
  Warnings:

  - You are about to drop the column `payment_method` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `orders` DROP COLUMN `payment_method`,
    ADD COLUMN `payment_type` VARCHAR(50) NULL;
