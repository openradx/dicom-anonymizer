import { dataSet } from "dcmjs";

export class FixedValueAnonymizer {
  private tag: string;
  private value: string;

  constructor(tag: string, value: string) {
    this.tag = tag;
    this.value = value;
  }

  anonymize = (dataset: dataSet, dataTag: string): boolean => {
    if (dataTag == this.tag) {
      dataset[dataTag].Value[0] = this.value;

      return true;
    } else {
      return false;
    }
  };
}
