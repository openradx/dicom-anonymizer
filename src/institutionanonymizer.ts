import { data, dataSet } from "dcmjs";
import { AddressAnonymizer } from "./addressanonymizer";

export class InstitutionAnonymizer {
  private addressAnonymizer: AddressAnonymizer;

  institutionName: string = data.DicomMetaDictionary.nameMap["InstitutionName"].tag; //0008,0080
  institutionAddress: string = data.DicomMetaDictionary.nameMap["InstitutionAddress"].tag; //0008,0081
  institutionalDepartmentName: string =
    data.DicomMetaDictionary.nameMap["InstitutionalDepartmentName"].tag; //0008,1040
  valueFactories: { [key: string]: (originalValue: string) => string };

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

  anonymizeInstitutionName = (originalValue: string): string => {
    const region: string = this.addressAnonymizer.getRegion(originalValue);
    const streetAddress: string = this.addressAnonymizer.getStreetAddress(originalValue);

    return `${region}'S ${streetAddress} CLINIC`;
  };

  anonymizeInstitutionAddress = (originalValue: string): string => {
    const fullAddress: string = this.addressAnonymizer.getLegalAddress(originalValue);
    const country: string = this.addressAnonymizer.getCountry(originalValue);

    return `${fullAddress}, ${country}`;
  };

  anonymizeDepartmentName = (): string => {
    return "RADIOLOGY";
  };
}
