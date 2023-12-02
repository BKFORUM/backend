-- DropForeignKey
ALTER TABLE "reply_comment" DROP CONSTRAINT "reply_comment_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "reply_comment" DROP CONSTRAINT "reply_comment_user_id_fkey";

-- AddForeignKey
ALTER TABLE "reply_comment" ADD CONSTRAINT "reply_comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reply_comment" ADD CONSTRAINT "reply_comment_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
