/*
  Warnings:

  - You are about to drop the column `shipping_type` on the `orders` table. All the data in the column will be lost.
  - Added the required column `etd` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_code` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_description` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `orders` DROP COLUMN `shipping_type`,
    ADD COLUMN `etd` VARCHAR(20) NOT NULL,
    ADD COLUMN `shipping_code` VARCHAR(50) NOT NULL,
    ADD COLUMN `shipping_description` VARCHAR(50) NOT NULL;
