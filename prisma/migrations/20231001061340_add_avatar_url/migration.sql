/*
  Warnings:

  - You are about to drop the `user_to_permission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_to_permission" DROP CONSTRAINT "fk_user_to_permission_role";

-- DropForeignKey
ALTER TABLE "user_to_permission" DROP CONSTRAINT "fk_user_to_permission_user";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "avatar_url" VARCHAR(255);

-- DropTable
DROP TABLE "user_to_permission";
