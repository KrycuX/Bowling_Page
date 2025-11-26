import dayjsLib from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

const DEFAULT_TIMEZONE = 'Europe/Warsaw';

dayjsLib.extend(utc);
dayjsLib.extend(timezone);
dayjsLib.tz.setDefault(DEFAULT_TIMEZONE);

export const dayjs = dayjsLib;
export const WARSAW_TZ = DEFAULT_TIMEZONE;
