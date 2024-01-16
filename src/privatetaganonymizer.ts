import { data, dataSet } from "dcmjs";

export class PrivatTagAnonymizer {
  anonymize = (dataset: dataSet, data_tag: string): boolean => {
    const currTag = data.Tag.fromString(data_tag);
    if (currTag.group() % 2 === 1) {
      delete dataset[data_tag];
      return true;
    } else {
      return false;
    }
  };
}
