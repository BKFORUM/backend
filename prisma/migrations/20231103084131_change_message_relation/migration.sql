/*
  Warnings:

  - The primary key for the `user_to_conversation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[conversation_id,user_id]` on the table `user_to_conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_user_id_fkey";

-- AlterTable
ALTER TABLE "user_to_conversation" DROP CONSTRAINT "user_to_conversation_pkey",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
ADD CONSTRAINT "pk_user_to_conversation" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_to_conversation_conversation_id_user_id_key" ON "user_to_conversation"("conversation_id", "user_id");

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_to_conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
