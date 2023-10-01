-- CreateEnum
CREATE TYPE "ResourceStatus" AS ENUM ('PENDING', 'ACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "GroupUserType" AS ENUM ('MEMBER', 'MODERATOR');

-- CreateTable
CREATE TABLE "forum" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(100) NOT NULL,
    "mod_id" UUID NOT NULL,
    "status" "ResourceStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "forum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_to_forum" (
    "user_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "forum_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "userType" "GroupUserType" NOT NULL,

    CONSTRAINT "user_to_forum_pkey" PRIMARY KEY ("user_id","forum_id")
);

-- AddForeignKey
ALTER TABLE "forum" ADD CONSTRAINT "forum_mod_id_fkey" FOREIGN KEY ("mod_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_to_forum" ADD CONSTRAINT "user_to_forum_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_to_forum" ADD CONSTRAINT "user_to_forum_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "forum"("id") ON DELETE CASCADE ON UPDATE CASCADE;
