/*
  Warnings:

  - A unique constraint covering the columns `[file_url]` on the table `post_document` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ixuq_file_url" ON "post_document"("file_url");
