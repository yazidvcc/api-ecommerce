/*
  Warnings:

  - You are about to alter the column `role` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `password` VARCHAR(255) NULL,
    MODIFY `phone` VARCHAR(15) NULL,
    MODIFY `role` ENUM('ADMIN', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER';
