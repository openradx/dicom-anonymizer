import { data, dataSet } from "dcmjs";
import { Randomizer } from "./randomizer";

export class IDAnonymizer {
  private keywords: string[];
  private randomizer: Randomizer;
  private idSuffix: string;
  private idPrefix: string;
  private issuerTag: string;
  private alphabet: string;
  private totalAffixesLength: number;
  private indicesForRandomizer: number[];

  constructor(Randomizer: Randomizer, keywords: string[], idPrefix = "", idSuffix = "") {
    this.keywords = keywords;
    this.randomizer = Randomizer;
    this.idPrefix = idPrefix;
    this.idSuffix = idSuffix;
    this.issuerTag = data.DicomMetaDictionary.nameMap["IssuerOfPatientID"].tag;

    this.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    this.totalAffixesLength = this.idPrefix.length + this.idSuffix.length;
    this.indicesForRandomizer = new Array<number>(12 - this.totalAffixesLength).fill(
      this.alphabet.length
    );
  }

  anonymize = (dataset: dataSet, dataTag: string): boolean => {
    if (this.keywords.includes(dataTag)) {
      this.replaceID(dataset, dataTag);
      return true;
    } else if (dataTag == this.issuerTag && dataset[dataTag].Value[0] != "") {
      dataset[dataTag].Value[0] = "DICOM_ANONYMIZER";
      return true;
    } else {
      return false;
    }
  };

  replaceID = (dataset: dataSet, dataTag: string): void => {
    if (dataset[dataTag].Value.length > 1) {
      dataset[dataTag].Value = dataset[dataTag].Value.map((originalValue: string) => {
        return this.newID(originalValue);
      });
    } else {
      const originalValue = dataset[dataTag].Value[0];
      dataset[dataTag].Value[0] = this.newID(originalValue);
    }
  };

  newID = (originalValue: string): string => {
    const indexes = this.randomizer.getIntsFromRanges(originalValue, ...this.indicesForRandomizer);
    const idRoot: string = indexes.map((i) => this.alphabet[i]).join("");

    return this.idPrefix + idRoot + this.idSuffix;
  };
}
