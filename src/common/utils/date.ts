import * as dayjs from 'dayjs';

export const getDay = (day: Date) => {
  return dayjs(day).format('DD-MM-YYYY');
};
