import * as dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));

dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

export const getDay = (day: Date) => {
  return dayjs(day).format('DD-MM-YYYY');
};
