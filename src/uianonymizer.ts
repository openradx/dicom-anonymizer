import { data, dataSet } from "dcmjs";
import { Randomizer } from "./randomizer";

export class UIAnonymizer {
  private randomizer: Randomizer;

  constructor(Randomizer: Randomizer) {
    this.randomizer = Randomizer;
  }

  anonymize = (dataset: dataSet, dataTag: string): boolean => {
    const tag = data.DicomMetaDictionary.punctuateTag(dataTag);

    if (
      dataset[dataTag].vr != "UI" ||
      dataset[dataTag].Value[0] == undefined ||
      data.DicomMetaDictionary.dictionary[tag].name.endsWith("ClassUID") ||
      data.DicomMetaDictionary.dictionary[tag].name == "TransferSyntaxUID"
    ) {
      return false;
    } else {
      if (dataset[dataTag].Value.length > 1) {
        dataset[dataTag].Value = dataset[dataTag].Value.map((originalUI: string) => {
          return this.newUI(originalUI);
        });
      } else {
        const originalUI = dataset[dataTag].Value[0];
        dataset[dataTag].Value[0] = this.newUI(originalUI);
      }

      return true;
    }
  };

  newUI(origUI: string) {
    return `2.${BigInt(10 ** 39) + this.randomizer.toInt(origUI)}`;
  }
}
