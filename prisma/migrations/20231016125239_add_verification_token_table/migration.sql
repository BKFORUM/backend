-- AlterEnum
ALTER TYPE "Gender" ADD VALUE 'TBD';

-- CreateTable
CREATE TABLE "verification_token" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pk_verification_token" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "verification_token" ADD CONSTRAINT "fk_verification_token_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
