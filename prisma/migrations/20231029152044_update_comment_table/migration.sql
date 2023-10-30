/*
  Warnings:

  - You are about to drop the column `status` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `comment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "comment" DROP COLUMN "status",
DROP COLUMN "title";
