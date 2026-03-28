import { Timesplit } from "../api/types";

export class TimesplitUtils {
  static getTimesplit(start: Date, end: Date): Timesplit {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 2) {
      return Timesplit.hour;
    }
    if (diffDays > 31) {
      return Timesplit.month;
    }
    return Timesplit.day;
  }
}
