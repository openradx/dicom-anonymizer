import { dataSet } from "dcmjs";
import { lists } from "./lists";
import Randomizer from "./randomizer";

class PNAnonymizer {
  private randomizer: Randomizer;
  lists: lists;

  constructor(randomizer: Randomizer) {
    this.randomizer = randomizer;
    this.lists = new lists();
  }

  anonymize = async (dataset: dataSet, dataTag: string): Promise<boolean> => {
    if (dataset[dataTag].vr != "PN") {
      return false;
    }

    let patientSex = "";
    if ("00100040" in dataset) {
      patientSex = dataset["00100040"].Value[0]; //PatientSex
    }

    if (dataset[dataTag].Value.length > 1) {
      for (let i = 0; i < dataset[dataTag].Value.length; i++) {
        dataset[dataTag].Value[i].Alphabetic = await this.newPN(
          dataset[dataTag].Value[i].Alphabetic,
          patientSex
        );
      }
    } else if (dataset[dataTag].Value.length == 1) {
      const originalName = dataset[dataTag].Value[0].Alphabetic;

      dataset[dataTag].Value[0].Alphabetic = await this.newPN(originalName, patientSex);
    } else {
      dataset[dataTag].Value[0].Alphabetic = await this.newPN("", patientSex);
    }

    return true;
  };

  async newPN(originalValue: string, sex = "") {
    let firstNames: string[];
    if (sex == "F") {
      firstNames = this.lists.femaleFirstNames;
    } else if (sex == "M") {
      firstNames = this.lists.maleFirstNames;
    } else {
      firstNames = this.lists.allFirstNames;
    }
    const lastNames = this.lists.lastNames;
    if (originalValue != undefined) {
      originalValue = originalValue.replaceAll("^", "");
    }

    const indices = await this.randomizer.getIntsFromRanges(
      originalValue,
      this.lists.lastNames.length,
      firstNames.length,
      this.lists.allFirstNames.length
    );

    return `${lastNames[indices[0]]}^${firstNames[indices[1]]}^${
      this.lists.allFirstNames[indices[2]]
    }`;
  }
}

export default PNAnonymizer;
