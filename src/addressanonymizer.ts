import { data, dataSet } from "dcmjs";
import { lists } from "./lists";
import Randomizer from "./randomizer";

class AddressAnonymizer {
  private randomizer: Randomizer;
  private lists: lists;

  addressTag: string = data.DicomMetaDictionary.nameMap["PatientAddress"].tag;
  regionTag: string = data.DicomMetaDictionary.nameMap["RegionOfResidence"].tag;
  countryTag: string = data.DicomMetaDictionary.nameMap["CountryOfResidence"].tag;
  valueFactories; //: { [key: string]: (originalValue: string) => Promise<string> } | undefined;

  constructor(Randomizer: Randomizer) {
    this.randomizer = Randomizer;
    this.lists = new lists();

    this.addressTag = data.DicomMetaDictionary.unpunctuateTag(this.addressTag);
    this.regionTag = data.DicomMetaDictionary.unpunctuateTag(this.regionTag);
    this.countryTag = data.DicomMetaDictionary.unpunctuateTag(this.countryTag);
    // this._setupValueFactories();
    this.valueFactories = {
      [this.addressTag]: this.getLegalAddress,
      [this.regionTag]: this.getRegion,
      [this.countryTag]: this.getCountry,
    };
  }

  anonymize = async (dataset: dataSet, dataTag: string): Promise<boolean> => {
    const valueFactory = await this.valueFactories[dataTag];

    if (valueFactory == undefined) {
      return false;
    }

    if (dataset[dataTag].Value.length > 1) {
      for (let i = 0; i < dataset[dataTag].Value.length; i++) {
        dataset[dataTag].Value[i] = await valueFactory(dataset[dataTag].Value[i]);
      }

      return true;
    } else if (dataset[dataTag].Value.length == 1) {
      const originalValue: string = dataset[dataTag].Value[0];
      dataset[dataTag].Value[0] = await valueFactory(originalValue);
      return true;
    } else {
      dataset[dataTag].Value = [await valueFactory("")];
      return true;
    }
  };

  getLegalAddress = async (originalValue: string): Promise<string> => {
    const street: string = await this.getStreetAddress(originalValue);
    const streetNumber: string = await this.getStreetNumber(originalValue);
    const city: string = await this.getRegion(originalValue);

    return `${streetNumber} ${street}, ${city}`;
  };

  getStreetNumber = async (originalValue: string): Promise<string> => {
    const [streetNumberIndex]: number[] = await this.randomizer.getIntsFromRanges(
      originalValue,
      1000
    );
    const streetNumber: number = streetNumberIndex + 1;

    return `${streetNumber}`;
  };

  getStreetAddress = async (originalValue: string): Promise<string> => {
    const [streetIndex]: number[] = await this.randomizer.getIntsFromRanges(
      originalValue,
      this.lists.streets.length
    );

    return `${this.lists.streets[streetIndex]}`;
  };

  getRegion = async (originalValue: string): Promise<string> => {
    const [cityIndex]: number[] = await this.randomizer.getIntsFromRanges(
      originalValue,
      this.lists.cities.length
    );

    return `${this.lists.cities[cityIndex]}`;
  };

  getCountry = async (originalValue: string): Promise<string> => {
    const [countryIndex]: number[] = await this.randomizer.getIntsFromRanges(
      originalValue,
      this.lists.countries.length
    );

    return `${this.lists.countries[countryIndex]}`;
  };
}

export default AddressAnonymizer;
