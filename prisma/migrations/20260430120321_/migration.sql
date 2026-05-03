/*
  Warnings:

  - Made the column `payment_method` on table `orders` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `orders` MODIFY `payment_method` VARCHAR(50) NOT NULL DEFAULT 'NOT_PAID';
