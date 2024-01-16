import { dataSet } from "dcmjs";
import { lists } from "./lists";
import { Randomizer } from "./randomizer";

export class PNAnonymizer {
  private randomizer: Randomizer;
  lists: lists;

  constructor(Randomizer: Randomizer) {
    this.randomizer = Randomizer;
    this.lists = new lists();
  }

  anonymize = (dataset: dataSet, dataTag: string): boolean => {
    if (dataset[dataTag].vr != "PN") {
      return false;
    }
    let patientSex = "";
    if ("00100040" in dataset) {
      patientSex = dataset["00100040"].Value[0]; //PatientSex
    }

    if (dataset[dataTag].Value.length > 1) {
      dataset[dataTag].Value = dataset[dataTag].Value.map((originalName: string) => {
        return this.newPN(originalName, patientSex);
      });
    } else {
      const originalName = dataset[dataTag].Value[0];
      dataset[dataTag].Value[0] = this.newPN(originalName, patientSex);
    }

    return true;
  };

  newPN(originalValue: string, sex = "") {
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

    const indices = this.randomizer.getIntsFromRanges(
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
