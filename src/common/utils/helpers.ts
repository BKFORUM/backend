export const getStudentAvatarUrl = (studentId: string) => {
  const year = studentId.slice(3, 5);
  return `http://cb.dut.udn.vn/ImageSV/${year}/${studentId}.jpg`;
};
