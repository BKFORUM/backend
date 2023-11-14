-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('GENERAL', 'FACULTY', 'FORUM');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('UPCOMING', 'HAPPENING', 'DONE');

-- CreateTable
CREATE TABLE "event" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "forum_id" UUID,
    "faculty_id" UUID,
    "avatar_url" TEXT,
    "display_name" VARCHAR(128) NOT NULL,
    "start_at" TIMESTAMPTZ(6) NOT NULL,
    "end_at" TIMESTAMPTZ(6) NOT NULL,
    "status" "EventStatus" NOT NULL,
    "type" "EventType" NOT NULL,

    CONSTRAINT "pk_event" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_to_event" (
    "user_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "event_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_user_to_event" PRIMARY KEY ("user_id","event_id")
);

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "forum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_to_event" ADD CONSTRAINT "user_to_event_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_to_event" ADD CONSTRAINT "user_to_event_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
