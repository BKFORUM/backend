/*
  Warnings:

  - A unique constraint covering the columns `[forum_id]` on the table `conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "conversation" ADD COLUMN     "forum_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "conversation_forum_id_key" ON "conversation"("forum_id");

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "forum"("id") ON DELETE SET NULL ON UPDATE CASCADE;
