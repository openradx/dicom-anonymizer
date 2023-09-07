import { dataSet } from "dcmjs";

export class UnwantedElementStripper {
  private tags: string[];

  constructor(keywords: string[]) {
    this.tags = keywords;
  }

  anonymize = (dataset: typeof dataSet, data_tag: string): boolean => {
    if (this.tags.includes(data_tag)) {
      delete dataset[data_tag];
      return true;
    } else {
      return false;
    }
  };
}
