-- Create extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "full_name" VARCHAR(100) NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "student_id" VARCHAR(255),
    "password" TEXT NOT NULL,
    "refresh_token" TEXT,

    CONSTRAINT "pk_user" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "can_be_updated" BOOLEAN NOT NULL DEFAULT true,
    "can_be_deleted" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "pk_role" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_to_role" (
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_to_role_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "permission" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resource_name" VARCHAR(200) NOT NULL,
    "display_name" VARCHAR(200) NOT NULL,
    "description" VARCHAR(255),
    "can_create" BOOLEAN NOT NULL DEFAULT false,
    "can_read" BOOLEAN NOT NULL DEFAULT false,
    "can_update" BOOLEAN NOT NULL DEFAULT false,
    "can_delete" BOOLEAN NOT NULL DEFAULT false,
    "permission_group_id" INTEGER,

    CONSTRAINT "pk_permission" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_to_permission" (
    "role_id" UUID NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_to_permission_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "user_to_permission" (
    "user_id" UUID NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_to_permission_pkey" PRIMARY KEY ("user_id","permission_id")
);

-- CreateTable
CREATE TABLE "permission_group" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resource_name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(200) NOT NULL,

    CONSTRAINT "pk_permission_info" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ixuq_user_username" ON "user"("username");

-- CreateIndex
CREATE INDEX "ixfk_permission_permission_group_id" ON "permission"("permission_group_id");

-- AddForeignKey
ALTER TABLE "user_to_role" ADD CONSTRAINT "fk_user_to_role_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_to_role" ADD CONSTRAINT "fk_user_to_role_role" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission" ADD CONSTRAINT "fk_permission_permission_group" FOREIGN KEY ("permission_group_id") REFERENCES "permission_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_to_permission" ADD CONSTRAINT "fk_role_to_permission_role" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_to_permission" ADD CONSTRAINT "fk_role_to_permission_permission" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_to_permission" ADD CONSTRAINT "fk_user_to_permission_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_to_permission" ADD CONSTRAINT "fk_user_to_permission_role" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
