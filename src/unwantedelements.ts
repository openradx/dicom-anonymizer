import { dataSet } from "dcmjs";

class UnwantedElementStripper {
  private tags: string[];

  constructor(keywords: string[]) {
    this.tags = keywords;
  }

  anonymize = (dataset: dataSet, dataTag: string): boolean => {
    if (this.tags.includes(dataTag)) {
      delete dataset[dataTag];
      return true;
    } else {
      return false;
    }
  };
}

export default UnwantedElementStripper;
