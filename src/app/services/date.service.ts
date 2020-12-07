export class DateToStringService {
  date: Date;
  public constructor(date: string) {
    this.date = new Date(date);
  }

  getDateString(): String {
    const months = [
      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
    ];
    return this.date.getDate() + '/' + months[this.date.getMonth()] + '/' + this.date.getFullYear();
  }

  getTimeString(): String {
    return this.date.getHours() + ':' + this.date.getMinutes() + ':' + this.date.getSeconds();
  }

  getDateTimeString(): String {
    return this.getDateString() + ' - ' + this.getTimeString();
  }
}
