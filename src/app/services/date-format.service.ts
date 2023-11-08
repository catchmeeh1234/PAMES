import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateFormatService {


  constructor() { }

  // Function to get the month name from the array
  getMonthName(month: number): string {
    return this.months[month - 1]; // Subtract 1 to match the 0-based array index
  }

  get months() {
    const monthNames: string[] = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return monthNames;
  }

  get years() {
    // Get the current year
    const currentYear = new Date().getFullYear() + 1;

    // Create an array of years
    const years: number[] = [];

    for (let year = 2021; year <= currentYear; year++) {
      years.push(year);
    }

    return years;
  }

  formatDate(date: Date): string {
    if (date === null || date === undefined) {
      return "";
    }
    const year = date.getFullYear().toString();
    const month = this.padZero(date.getMonth() + 1); // Adding 1 since month is zero-based
    const day = this.padZero(date.getDate());

    return `${year}-${month}-${day}`;
  }

  padZero(value: number): string {
    return value < 10 ? `0${value}` : value.toString();
  }

  formatStringToDate(dateString:string, day:number=1) {
    const months: { [key: string]: number } = {
      January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
      July: 6, August: 7, September: 8, October: 9, November: 10, December: 11
    };

    const [monthStr, yearStr] = dateString.split(' ');

    if (months.hasOwnProperty(monthStr)) {
      const month = months[monthStr];
      const year = parseInt(yearStr, 10);

      if (!isNaN(year)) {
        return new Date(year, month, day);
      }
    }

    return null; // Invalid input
  }

  convertToMonthYearString(dateValue:Date) {
    const selectedDate = new Date(dateValue);

    // Format the date as "Month YYYY"
    const formattedDate = selectedDate.toLocaleString('en-US', { year: 'numeric', month: 'long' });
    return formattedDate;
  }

}
