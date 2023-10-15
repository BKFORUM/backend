/*
  Warnings:

  - You are about to drop the column `description` on the `topic` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "topic" DROP COLUMN "description";

INSERT INTO "topic"("name","display_name") VALUES ('Học tập','Học tập'), ('Vui Chơi','Vui Chơi'), ('CLB','CLB'), ('Giáo viên','Giáo viên'), ('Kỹ Năng Sống','Kỹ Năng Sống'), ('Toiec','Toiec'), ('Khoa','Khoa'), ('Liên Chi Đoàn','Liên Chi Đoàn'), ('Môn học','Môn học'), ('Thiện Nguyện','Thiện Nguyện'), ('Buôn bán','Buôn bán'), ('Tìm kiếm việc làm','Tìm kiếm việc làm'), ('Khóa Sinh Viên','Khóa Sinh Viên'), ('Toàn Trường','Toàn Trường'), ('Đọc Sách','Đọc Sách'), ('Doanh Nghiệp','Doanh Nghiệp'), ('Cựu Sinh Viên','Cựu Sinh Viên'), ('Tiếng Nhật','Tiếng Nhật'), ('Cuộc thi','Cuộc thi')
