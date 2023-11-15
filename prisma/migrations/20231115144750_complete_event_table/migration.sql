/*
  Warnings:

  - You are about to drop the column `avatar_url` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `faculty_id` on the `event` table. All the data in the column will be lost.
  - Added the required column `content` to the `event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_faculty_id_fkey";

-- AlterTable
ALTER TABLE "event" DROP COLUMN "avatar_url",
DROP COLUMN "faculty_id",
ADD COLUMN     "content" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "event_comment" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "event_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "content" TEXT NOT NULL,

    CONSTRAINT "pk_event_comment" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_document" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,

    CONSTRAINT "pk_event_document" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ixuq_event_file_url" ON "event_document"("file_url");

-- AddForeignKey
ALTER TABLE "event_comment" ADD CONSTRAINT "event_comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_comment" ADD CONSTRAINT "event_comment_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_document" ADD CONSTRAINT "event_document_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_document" ADD CONSTRAINT "event_document_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
