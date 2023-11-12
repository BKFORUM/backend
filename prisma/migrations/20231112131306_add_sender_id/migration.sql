-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "sender_id" UUID;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
