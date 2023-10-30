-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('GROUP_CHAT', 'CHAT');

-- AlterTable
ALTER TABLE "conversation" ADD COLUMN     "type" "ConversationType" NOT NULL DEFAULT 'CHAT';
