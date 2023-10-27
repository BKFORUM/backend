-- AlterEnum
ALTER TYPE "ResourceStatus" ADD VALUE 'BLOCKED';

-- CreateTable
CREATE TABLE "friendship" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sender_id" UUID NOT NULL,
    "receiver_id" UUID NOT NULL,
    "status" "ResourceStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "pk_friend" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "friendship_sender_id_receiver_id_key" ON "friendship"("sender_id", "receiver_id");

-- CreateIndex
CREATE UNIQUE INDEX "friendship_receiver_id_sender_id_key" ON "friendship"("receiver_id", "sender_id");

-- AddForeignKey
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
