import { data, dataSet } from "dcmjs";
import AddressAnonymizer from "./addressanonymizer";

class InstitutionAnonymizer {
  private addressAnonymizer: AddressAnonymizer;

  institutionName: string = data.DicomMetaDictionary.nameMap["InstitutionName"].tag; //0008,0080
  institutionAddress: string = data.DicomMetaDictionary.nameMap["InstitutionAddress"].tag; //0008,0081
  institutionalDepartmentName: string =
    data.DicomMetaDictionary.nameMap["InstitutionalDepartmentName"].tag; //0008,1040
  valueFactories; //: { [key: string]: (originalValue: string) => string };

  constructor(AddressAnonymizer: AddressAnonymizer) {
    this.addressAnonymizer = AddressAnonymizer;

    this.institutionName = data.DicomMetaDictionary.unpunctuateTag(this.institutionName);
    this.institutionAddress = data.DicomMetaDictionary.unpunctuateTag(this.institutionAddress);
    this.institutionalDepartmentName = data.DicomMetaDictionary.unpunctuateTag(
      this.institutionalDepartmentName
    );

    this.valueFactories = {
      [this.institutionName]: this.anonymizeInstitutionName,
      [this.institutionAddress]: this.anonymizeInstitutionAddress,
      [this.institutionalDepartmentName]: this.anonymizeDepartmentName,
    };
  }

  anonymize = async (dataset: dataSet, dataTag: string): Promise<boolean> => {
    const valueFactory: (originalValue: string) => Promise<string> = await this.valueFactories[
      dataTag
    ];
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

  anonymizeInstitutionName = async (originalValue: string): Promise<string> => {
    const region = await this.addressAnonymizer.getRegion(originalValue);
    const streetAddress = await this.addressAnonymizer.getStreetAddress(originalValue);

    return `${region}'S ${streetAddress} CLINIC`;
  };

  anonymizeInstitutionAddress = async (originalValue: string): Promise<string> => {
    const fullAddress = await this.addressAnonymizer.getLegalAddress(originalValue);
    const country = await this.addressAnonymizer.getCountry(originalValue);

    return `${fullAddress}, ${country}`;
  };

  anonymizeDepartmentName = (): Promise<string> => {
    return Promise.resolve("RADIOLOGY");
  };
}

export default InstitutionAnonymizer;
