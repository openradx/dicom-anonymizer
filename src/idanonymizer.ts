import { data, dataSet } from "dcmjs";
import Randomizer from "./randomizer";

class IDAnonymizer {
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

  anonymize = async (dataset: dataSet, dataTag: string): Promise<boolean> => {
    if (this.keywords.includes(dataTag)) {
      await this.replaceID(dataset, dataTag);
      return true;
    } else if (dataTag == this.issuerTag && dataset[dataTag].Value[0] != "") {
      dataset[dataTag].Value[0] = "DICOM_ANONYMIZER";
      return true;
    } else {
      return false;
    }
  };

  replaceID = async (dataset: dataSet, dataTag: string) => {
    if (dataset[dataTag].Value.length > 1) {
      for (let i = 0; i < dataset[dataTag].Value.length; i++) {
        dataset[dataTag].Value[i] = await this.newID(dataset[dataTag].Value[i]);
      }
    } else if (dataset[dataTag].Value.length == 1) {
      const originalValue = dataset[dataTag].Value[0];
      dataset[dataTag].Value[0] = await this.newID(originalValue);
    } else {
      dataset[dataTag].Value = [await this.newID("")];
    }
  };

  newID = async (originalValue: string) => {
    const indexes = await this.randomizer.getIntsFromRanges(
      originalValue,
      ...this.indicesForRandomizer
    );
    const idRoot: string = indexes.map((i) => this.alphabet[i]).join("");

    return this.idPrefix + idRoot + this.idSuffix;
  };
}

export default IDAnonymizer;
