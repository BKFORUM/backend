/*
  Warnings:

  - A unique constraint covering the columns `[last_message_id]` on the table `conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "conversation" ADD COLUMN     "last_message_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "conversation_last_message_id_key" ON "conversation"("last_message_id");

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_last_message_id_fkey" FOREIGN KEY ("last_message_id") REFERENCES "message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
