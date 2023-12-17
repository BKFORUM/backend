-- AlterTable
ALTER TABLE "user_to_conversation" ADD COLUMN     "last_read_message_id" UUID;

-- AddForeignKey
ALTER TABLE "user_to_conversation" ADD CONSTRAINT "user_to_conversation_last_read_message_id_fkey" FOREIGN KEY ("last_read_message_id") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
