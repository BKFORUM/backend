const faculties = `Cơ khí
Cơ khí Giao thông
Công nghệ Nhiệt – Điện lanh
Công nghệ Thông tin
Điện
Điện tử - Viễn thông
Hóa
Sư phạm Kỹ thuật
Cầu Đường
Dân dụng và Công nghiệp
Thủy lợi – Thủy điện
Quản lý Dự án
Môi trường
Kiến Trúc
PFIEV`;

console.log(
  faculties
    .split('\n')
    .map((faculty) => `(\'${faculty}\`,\'${faculty}\`)`)
    .join(),
);
