import { BadRequestException } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { unlink } from 'fs';
import { parse as parseBuffer } from 'node-xlsx';
const path = require('path');

export const getStudentAvatarUrl = (email: string) => {
  const studentId = email.split('@')[0];
  const year = studentId.slice(3, 5);
  return `http://cb.dut.udn.vn/ImageSV/${year}/${studentId}.jpg`;
};

export async function readXlsxFile(fileName: string): Promise<string[][]> {
  try {
    const workbook = new Workbook();
    const rootPath = process.cwd();
    const filePath = path.join(rootPath, `uploads/${fileName}`)
    await workbook.xlsx.readFile(filePath);
    const buffer = await workbook.xlsx.writeBuffer();

    unlink(filePath, (error) => {
      if (error) {
          console.log(error);
      }
      console.log('deleted');
  });

    return parseXlsx(buffer as Buffer);
  } catch (err) {
    throw new BadRequestException('Invalid file');
  }
}

export function parseXlsx(buffer: Buffer): any[] {
  const xlsxData = parseBuffer(buffer);

  return xlsxData[0].data.filter((el) => el[0]).slice(1);
}
