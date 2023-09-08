import { data, dataSet } from "dcmjs";
import { Randomizer } from "./randomizer";

export class IDAnonymizer {
  private keywords: string[];
  private randomizer: Randomizer;
  private id_suffix: string;
  private id_prefix: string;
  private issuer_tag: string;
  //private tag_ids: string[];
  private alphabet: string;
  private totalAffixesLength: number;
  private indicesForRandomizer: number[];

  constructor(Randomizer: Randomizer, keywords: string[], id_prefix = "", id_suffix = "") {
    this.keywords = keywords;
    this.randomizer = Randomizer;
    this.id_prefix = id_prefix;
    this.id_suffix = id_suffix;
    this.issuer_tag = data.DicomMetaDictionary.nameMap["IssuerOfPatientID"].tag;

    this.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    this.totalAffixesLength = this.id_prefix.length + this.id_suffix.length;
    this.indicesForRandomizer = new Array<number>(12 - this.totalAffixesLength).fill(
      this.alphabet.length
    );
  }

  anonymize = (dataset: dataSet, data_tag: string): boolean => {
    if (this.keywords.includes(data_tag)) {
      this.replace_id(dataset, data_tag);
      return true;
    } else if (data_tag == this.issuer_tag) {
      dataset[data_tag].Value[0] = "WieAuchImmerDiesesToolHeisenWird";
      return true;
    } else {
      return false;
    }
  };

  replace_id = (dataset: dataSet, data_tag: string): void => {
    if (dataset[data_tag].Value.length > 1) {
      dataset[data_tag].Value = dataset[data_tag].Value.map((original_value: string) => {
        return this.new_id(original_value);
      });
    } else {
      const original_value = dataset[data_tag].Value[0];
      dataset[data_tag].Value[0] = this.new_id(original_value);
    }
  };

  new_id = (original_value: any): string => {
    const indexes = this.randomizer.getIntsFromRanges(original_value, ...this.indicesForRandomizer);
    const id_root: string = indexes.map((i) => this.alphabet[i]).join("");

    return this.id_prefix + id_root + this.id_suffix;
  };
}
