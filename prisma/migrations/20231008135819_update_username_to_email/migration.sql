/*
  Warnings:

  - You are about to drop the column `student_id` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date_of_birth` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `faculty_id` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('TEACHER', 'STUDENT');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- DropIndex
DROP INDEX "ixuq_user_username";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "student_id",
DROP COLUMN "username",
ADD COLUMN     "date_of_birth" DATE NOT NULL,
ADD COLUMN     "email" VARCHAR(255) NOT NULL,
ADD COLUMN     "faculty_id" UUID NOT NULL,
ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "type" "UserType" NOT NULL DEFAULT 'STUDENT';

-- CreateTable
CREATE TABLE "faculty" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(50) NOT NULL,
    "displayName" VARCHAR(50) NOT NULL,

    CONSTRAINT "pk_faculty" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "post_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "status" "ResourceStatus" NOT NULL DEFAULT 'PENDING',
    "title" VARCHAR(100) NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "pk_comment" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "like" (
    "user_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "post_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_like" PRIMARY KEY ("user_id","post_id")
);

-- CreateTable
CREATE TABLE "topic" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(50),
    "description" TEXT NOT NULL,

    CONSTRAINT "pk_topic" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_to_topic" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "topic_id" UUID NOT NULL,
    "forum_id" UUID NOT NULL,

    CONSTRAINT "pk_form_to_topic" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ixuq_faculty_name" ON "faculty"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ixuq_topic_name" ON "topic"("name");

-- CreateIndex
CREATE INDEX "forum_to_topic_topic_id_idx" ON "forum_to_topic"("topic_id");

-- CreateIndex
CREATE INDEX "forum_to_topic_forum_id_idx" ON "forum_to_topic"("forum_id");

-- CreateIndex
CREATE UNIQUE INDEX "ixuq_forum_to_topic" ON "forum_to_topic"("topic_id", "forum_id");

-- CreateIndex
CREATE UNIQUE INDEX "ixuq_user_email" ON "user"("email");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "fk_user_faculty" FOREIGN KEY ("faculty_id") REFERENCES "faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "like" ADD CONSTRAINT "like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "like" ADD CONSTRAINT "like_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_to_topic" ADD CONSTRAINT "forum_to_topic_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_to_topic" ADD CONSTRAINT "forum_to_topic_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "forum"("id") ON DELETE CASCADE ON UPDATE CASCADE;
