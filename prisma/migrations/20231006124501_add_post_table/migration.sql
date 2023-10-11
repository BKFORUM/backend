-- CreateTable
CREATE TABLE "post" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "forum_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "status" "ResourceStatus" NOT NULL DEFAULT 'PENDING',
    "title" VARCHAR(100) NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "pk_post" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "forum"("id") ON DELETE CASCADE ON UPDATE CASCADE;
