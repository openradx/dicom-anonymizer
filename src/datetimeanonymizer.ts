import { DicomMetaDictionary, dataSet } from "dcmjs";

type returnarg = {
  value: object | string;
  tag: string;
};

export class DateTimeAnonymizer {
  private offset: number;

  constructor(date_offset_hours: number) {
    this.offset = date_offset_hours * 60 * 60 * 1000;
  }

  anonymize = (dataset: typeof dataSet, dataTag: string): boolean => {
    if (dataset[dataTag].vr != "DA" && dataset[dataTag].vr != "DT") {
      return false;
    }
    if (dataset[dataTag].Value[0] == undefined) {
      return true;
    }

    if (dataset[dataTag].vr != "DA") {
      this.anonymize_date_and_time(dataset, dataTag);
    } else {
      this.anonymize_datetime(dataset, dataTag);
    }
    return true;
  };

  anonymize_date_and_time = (dataset: typeof dataSet, dataTag: string): void => {
    const dates = dataset[dataTag].Value;
    const result: returnarg = this.checkTag(dataset, dataTag);

    const times = result.value;

    const newDates: string[] = [];
    const newTimes: string[] = [];

    for (const [date, time] of this.zipLongest("", dates, times)) {
      const newDateTime = this.shiftDateTime(date + time);

      newDates.push(newDateTime.slice(0, 8));
      newTimes.push(newDateTime.slice(8));
    }

    dataset[dataTag].Value = newDates;
    if (result.tag != "") {
      dataset[result.tag].Value = newTimes;
    }
  };

  anonymize_datetime = (dataset: typeof dataSet, dataTag: string): void => {
    const dateTimes = dataset[dataTag].Value;
    const newDateTimes: string[] = [];

    for (const dateTimeValue of dateTimes) {
      const newDateTimeString = this.shiftDateTime(dateTimeValue);
      newDateTimes.push(newDateTimeString);
    }
    dataset[dataTag].Value = newDateTimes;
  };

  shiftDateTime = (dateTimeValue: string): string => {
    const dateTimeFormat = "%Y%m%d%H".slice(0, dateTimeValue.length - 2);
    const oldDateTime = this.parseDateTime(dateTimeValue);
    const newDateTime = new Date(oldDateTime.getTime() + this.offset);
    let newDateTimeString = this.formatDate(newDateTime, dateTimeFormat);
    newDateTimeString += dateTimeValue.slice(newDateTimeString.length);

    return newDateTimeString;
  };

  parseDateTime = (dateTimeValue: string): Date => {
    // similar to pythons strptime() method
    const dateString = dateTimeValue;
    const year = Number(dateString.slice(0, 4));
    const month = Number(dateString.slice(4, 6)) - 1; // JavaScript months are zero-indexed (0 to 11)
    const day = Number(dateString.slice(6, 8));
    const hour = Number(dateString.slice(8, 10));
    const minute = Number(dateString.slice(10, 12));
    const second = Number(dateString.slice(12, 14));
    const milliseconds = Number(dateString.slice(15, dateString.length));

    return new Date(year, month, day, hour, minute, second, milliseconds);
  };

  formatDate = (date: Date, format: string): string => {
    const padZero = (value: number, length: number) => String(value).padStart(length, "0");

    const year = padZero(date.getFullYear(), 4);
    const month = padZero(date.getMonth() + 1, 2); // Months are zero-indexed, so add 1
    const day = padZero(date.getDate(), 2);
    const hours = padZero(date.getHours(), 2);
    const minutes = padZero(date.getMinutes(), 2);
    const seconds = padZero(date.getSeconds(), 2);

    return format
      .replace("%Y", year)
      .replace("%m", month)
      .replace("%d", day)
      .replace("%H", hours)
      .replace("%M", minutes)
      .replace("%S", seconds);
  };

  zipLongest = (fillValue = "", ...arr: any[]): string[][] => {
    const maxLength = Math.max(...arr.map((arr: any) => arr.length));

    return Array.from({ length: maxLength }, (_, index) => {
      return arr.map((arr: any) => (arr[index] !== undefined ? arr[index] : fillValue));
    });
  };

  checkTag = (dataset: typeof dataSet, dataTag: string): returnarg => {
    const tagName = DicomMetaDictionary.dictionary[DicomMetaDictionary.punctuateTag(dataTag)].name;
    const timeName = tagName.replace("Date", "Time");

    if (typeof DicomMetaDictionary.nameMap[timeName] !== "undefined") {
      let timeNameTag = DicomMetaDictionary.nameMap[timeName].tag;
      timeNameTag = DicomMetaDictionary.unpunctuateTag(timeNameTag);

      if (timeNameTag in dataset) {
        const timeElement = dataset[timeNameTag];
        const returnArg: returnarg = {
          value: timeElement.Value,
          tag: timeNameTag,
        };

        return returnArg;
      } else {
        const returnArg: returnarg = {
          value: "",
          tag: timeNameTag,
        };
        return returnArg;
      }
    } else {
      const returnArg: returnarg = {
        value: "",
        tag: "",
      };
      return returnArg;
    }
  };
}
