-- CreateTable
CREATE TABLE "post_document" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,

    CONSTRAINT "pk_post_document" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "post_document" ADD CONSTRAINT "post_document_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_document" ADD CONSTRAINT "post_document_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
