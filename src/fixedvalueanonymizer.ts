import { dataSet } from "dcmjs";

export class FixedValueAnonymizer {
  private tag: string;
  private value: string;

  constructor(tag: string, value: string) {
    this.tag = tag;
    this.value = value;
  }

  anonymize = (dataset: dataSet, data_tag: string): boolean => {
    if (data_tag == this.tag) {
      dataset[data_tag].Value[0] = this.value;

      return true;
    } else {
      return false;
    }
  };
}
