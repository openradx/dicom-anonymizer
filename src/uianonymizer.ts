import { data, dataSet } from "dcmjs";
import { Randomizer } from "./randomizer";

export class UIAnonymizer {
  private randomizer: Randomizer;

  constructor(Randomizer: Randomizer) {
    this.randomizer = Randomizer;
  }

  anonymize = (dataset: dataSet, data_tag: string): boolean => {
    const tag = data.DicomMetaDictionary.punctuateTag(data_tag);

    if (
      dataset[data_tag].vr != "UI" ||
      dataset[data_tag].Value[0] == undefined ||
      data.DicomMetaDictionary.dictionary[tag].name.endsWith("ClassUID") ||
      data.DicomMetaDictionary.dictionary[tag].name == "TransferSyntaxUID"
    ) {
      return false;
    } else {
      if (dataset[data_tag].Value.length > 1) {
        dataset[data_tag].Value = dataset[data_tag].Value.map((original_ui: string) => {
          return this.new_ui(original_ui);
        });
      } else {
        const original_ui = dataset[data_tag].Value[0];
        dataset[data_tag].Value[0] = this.new_ui(original_ui);
      }

      return true;
    }
  };

  new_ui(orig_ui: string) {
    return `2.${BigInt(10 ** 39) + this.randomizer.toInt(orig_ui)}`;
  }
}
