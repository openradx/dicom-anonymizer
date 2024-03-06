import { dataSet } from "dcmjs";

class FixedValueAnonymizer {
  private tag: string;
  private value: string;

  constructor(tag: string, value: string) {
    this.tag = tag;
    this.value = value;
  }

  anonymize = async (dataset: dataSet, dataTag: string): Promise<boolean> => {
    if (dataTag == this.tag) {
      dataset[dataTag].Value[0] = this.value;

      return true;
    } else {
      return false;
    }
  };
}

export default FixedValueAnonymizer;
