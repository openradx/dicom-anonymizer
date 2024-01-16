import { data, dataSet } from "dcmjs";

export class PrivatTagAnonymizer {
  anonymize = (dataset: dataSet, dataTag: string): boolean => {
    const currTag = data.Tag.fromString(dataTag);
    if (currTag.group() % 2 === 1) {
      delete dataset[dataTag];
      return true;
    } else {
      return false;
    }
  };
}
