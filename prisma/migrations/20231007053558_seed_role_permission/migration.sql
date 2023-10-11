-- CreateEnum
CREATE TYPE "ForumType" AS ENUM ('TOPIC', 'HOMEROOM');

-- AlterTable
ALTER TABLE "forum" ADD COLUMN     "type" "ForumType" NOT NULL DEFAULT 'HOMEROOM';

INSERT INTO "role"(name, display_name, description, can_be_deleted)
  VALUES ('USER', 'USER', 'User', FALSE),
('ADMIN', 'ADMIN', 'System Administrator', FALSE);

INSERT INTO "permission_group"("resource_name", "description")
  VALUES ('USER', 'USER'),
('ROLE', 'ROLE'),
('USER_PERMISSIONS', 'USER_PERMISSIONS');

WITH permission_group AS (
  SELECT
    id
  FROM
    permission_group
  WHERE
    resource_name = 'USER')
INSERT INTO "permission"("resource_name", "display_name", "description", "can_create", "can_read", "can_update", "can_delete", "permission_group_id")
SELECT
  'USER',
  'USER:C',
  'Allow to create a user',
  TRUE,
  FALSE,
  FALSE,
  FALSE,
  permission_group.id
FROM
  permission_group
UNION
SELECT
  'USER',
  'USER:R',
  'Allow to read a user',
  FALSE,
  TRUE,
  FALSE,
  FALSE,
  permission_group.id
FROM
  permission_group
UNION
SELECT
  'USER',
  'USER:U',
  'Allow to update a user',
  FALSE,
  FALSE,
  TRUE,
  FALSE,
  permission_group.id
FROM
  permission_group
UNION
SELECT
  'USER',
  'USER:D',
  'Allow to delete a user',
  FALSE,
  FALSE,
  FALSE,
  TRUE,
  permission_group.id
FROM
  permission_group;

WITH permission_group AS (
  SELECT
    id
  FROM
    permission_group
  WHERE
    resource_name = 'ROLE')
INSERT INTO "permission"("resource_name", "display_name", "description", "can_create", "can_read", "can_update", "can_delete", "permission_group_id")
SELECT
  'ROLE',
  'ROLE:C',
  'Allow to create a role',
  TRUE,
  FALSE,
  FALSE,
  FALSE,
  permission_group.id
FROM
  permission_group
UNION
SELECT
  'ROLE',
  'ROLE:R',
  'Allow to read a role',
  FALSE,
  TRUE,
  FALSE,
  FALSE,
  permission_group.id
FROM
  permission_group
UNION
SELECT
  'ROLE',
  'ROLE:U',
  'Allow to update a role',
  FALSE,
  FALSE,
  TRUE,
  FALSE,
  permission_group.id
FROM
  permission_group
UNION
SELECT
  'ROLE',
  'ROLE:D',
  'Allow to delete a role',
  FALSE,
  FALSE,
  FALSE,
  TRUE,
  permission_group.id
FROM
  permission_group;

WITH permission_group AS (
  SELECT
    id
  FROM
    permission_group
  WHERE
    resource_name = 'USER_PERMISSIONS')
INSERT INTO "permission"("resource_name", "display_name", "description", "can_create", "can_read", "can_update", "can_delete", "permission_group_id")
SELECT
  'USER_PERMISSIONS',
  'USER_PERMISSIONS:C',
  'Allow to create a role',
  TRUE,
  FALSE,
  FALSE,
  FALSE,
  permission_group.id
FROM
  permission_group
UNION
SELECT
  'USER_PERMISSIONS',
  'USER_PERMISSIONS:R',
  'Allow to read a role',
  FALSE,
  TRUE,
  FALSE,
  FALSE,
  permission_group.id
FROM
  permission_group
UNION
SELECT
  'USER_PERMISSIONS',
  'USER_PERMISSIONS:U',
  'Allow to update a role',
  FALSE,
  FALSE,
  TRUE,
  FALSE,
  permission_group.id
FROM
  permission_group
UNION
SELECT
  'USER_PERMISSIONS',
  'USER_PERMISSIONS:D',
  'Allow to delete a role',
  FALSE,
  FALSE,
  FALSE,
  TRUE,
  permission_group.id
FROM
  permission_group;


/* role_to_permission */
INSERT INTO "role_to_permission"("role_id", "permission_id")
SELECT
  "r"."id" AS "role_id",
  "p"."id" AS "permission_id"
FROM
  "role" "r"
  CROSS JOIN "permission" "p"
WHERE (
  -- System Administrator
  "r"."name" = 'SYSTEM_ADMINISTRATOR'
  AND "p"."resource_name" IN ('PERMISSION', 'USER', 'USER_PERMISSIONS', 'ROLE'))
AND NOT EXISTS (
  SELECT
    1
  FROM
    "role_to_permission" "rtp"
  WHERE
    "rtp"."role_id" = "r"."id"
    AND "rtp"."permission_id" = "p"."id");

