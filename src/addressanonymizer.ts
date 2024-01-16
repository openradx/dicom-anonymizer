import { data } from "dcmjs";
import type { dataSet } from "dcmjs";
import { lists } from "./lists";
import { Randomizer } from "./randomizer";

export class AddressAnonymizer {
  private randomizer: Randomizer;
  private lists: lists;

  addressTag: string = data.DicomMetaDictionary.nameMap["PatientAddress"].tag;
  regionTag: string = data.DicomMetaDictionary.nameMap["RegionOfResidence"].tag;
  countryTag: string = data.DicomMetaDictionary.nameMap["CountryOfResidence"].tag;
  valueFactories: { [key: string]: (originalValue: string) => string };

  constructor(Randomizer: Randomizer) {
    this.randomizer = Randomizer;
    this.lists = new lists();

    this.addressTag = data.DicomMetaDictionary.unpunctuateTag(this.addressTag);
    this.regionTag = data.DicomMetaDictionary.unpunctuateTag(this.regionTag);
    this.countryTag = data.DicomMetaDictionary.unpunctuateTag(this.countryTag);

    this.valueFactories = {
      [this.addressTag]: this.getLegalAddress,
      [this.regionTag]: this.getRegion,
      [this.countryTag]: this.getCountry,
    };
  }

  anonymize = (dataset: dataSet, dataTag: string): boolean => {
    const valueFactory: (originalValue: string) => string = this.valueFactories[dataTag];
    if (valueFactory == undefined) {
      return false;
    }

    if (dataset[dataTag].Value.length > 1) {
      dataset[dataTag].Value = dataset[dataTag].Value.map((originalValue: string) => {
        return valueFactory(originalValue);
      });

      return true;
    } else {
      const originalValue: string = dataset[dataTag].Value[0];
      dataset[dataTag].Value[0] = valueFactory(originalValue);

      return true;
    }
  };

  getLegalAddress = (originalValue: string): string => {
    const street: string = this.getStreetAddress(originalValue);
    const streetNumber: string = this.getStreetNumber(originalValue);
    const city: string = this.getRegion(originalValue);

    return `${streetNumber} ${street}, ${city}`;
  };

  getStreetNumber = (originalValue: string): string => {
    const [streetNumberIndex]: number[] = this.randomizer.getIntsFromRanges(originalValue, 1000);
    const streetNumber: number = streetNumberIndex + 1;

    return `${streetNumber}`;
  };

  getStreetAddress = (originalValue: string): string => {
    const [streetIndex]: number[] = this.randomizer.getIntsFromRanges(
      originalValue,
      this.lists.streets.length
    );

    return `${this.lists.streets[streetIndex]}`;
  };

  getRegion = (originalValue: string): string => {
    const [cityIndex]: number[] = this.randomizer.getIntsFromRanges(
      originalValue,
      this.lists.cities.length
    );

    return `${this.lists.cities[cityIndex]}`;
  };

  getCountry = (originalValue: string): string => {
    const [countryIndex]: number[] = this.randomizer.getIntsFromRanges(
      originalValue,
      this.lists.countries.length
    );

    return `${this.lists.countries[countryIndex]}`;
  };
}
