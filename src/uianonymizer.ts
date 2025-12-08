import { data, dataSet } from "dcmjs";
import Randomizer from "./randomizer";
import { isPrivateTag, getTagName } from "./utils";

class UIAnonymizer {
  private randomizer: Randomizer;

  constructor(Randomizer: Randomizer) {
    this.randomizer = Randomizer;
  }

  anonymize = async (dataset: dataSet, dataTag: string): Promise<boolean> => {
    // Skip private tags as they are not in the standard dictionary
    if (isPrivateTag(dataTag)) {
      return false;
    }

    const tag = data.DicomMetaDictionary.punctuateTag(dataTag);
    const tagName = getTagName(tag);
    
    if (
      dataset[dataTag].vr != "UI" ||
      dataset[dataTag].Value[0] == undefined ||
      tagName.endsWith("ClassUID") ||
      tagName == "TransferSyntaxUID"
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
        dataset[dataTag].Value = [await this.newUI("")];
      }

      return true;
    }
  };

  async newUI(origUI: string) {
    const result = await this.randomizer.toInt(origUI);
    const number4String = BigInt(result);
    const max = BigInt("1" + "0".repeat(61));

    return `2.${number4String % max}`;
  }
}

export default UIAnonymizer;
