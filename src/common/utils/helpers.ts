export const getStudentAvatarUrl = (email: string) => {
  const studentId = email.split('@')[0];
  const year = studentId.slice(3, 5);
  return `http://cb.dut.udn.vn/ImageSV/${year}/${studentId}.jpg`;
};
