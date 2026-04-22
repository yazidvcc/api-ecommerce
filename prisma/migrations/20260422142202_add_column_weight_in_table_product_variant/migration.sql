/*
  Warnings:

  - Added the required column `weight` to the `product_variants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product_variants` ADD COLUMN `weight` SMALLINT NOT NULL;
