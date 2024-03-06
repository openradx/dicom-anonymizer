import { data, dataSet } from "dcmjs";
import Randomizer from "./randomizer";

class UIAnonymizer {
  private randomizer: Randomizer;

  constructor(Randomizer: Randomizer) {
    this.randomizer = Randomizer;
  }

  anonymize = async (dataset: dataSet, dataTag: string): Promise<boolean> => {
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
        for (let i = 0; i < dataset[dataTag].Value.length; i++) {
          dataset[dataTag].Value[i] = await this.newUI(dataset[dataTag].Value[i]);
        }
      } else if (dataset[dataTag].Value.length == 1) {
        const originalUI = dataset[dataTag].Value[0];
        dataset[dataTag].Value[0] = await this.newUI(originalUI);
      } else {
        dataset[dataTag].Value[0] = await this.newUI("");
      }

      return true;
    }
  };

  async newUI(origUI: string) {
    const result = await this.randomizer.toInt(origUI);
    const number4String = BigInt(result);
    return `2.${BigInt(10 ** 39) + number4String}`;
  }
}

export default UIAnonymizer;
