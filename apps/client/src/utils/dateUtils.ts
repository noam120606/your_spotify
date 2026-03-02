export class DateUtils {
  static getPreviousInterval(start: Date, end: Date): [Date, Date] {
    const diffTime = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime());
    const prevStart = new Date(start.getTime() - diffTime);
    return [prevStart, prevEnd];
  }
}
