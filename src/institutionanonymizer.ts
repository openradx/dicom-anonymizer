import * as dcmjs from 'dcmjs';
import { AddressAnonymizer } from './addressanonymizer';

export class InstitutionAnonymizer {

    private address_anonymizer: AddressAnonymizer;

    institution_name: string = dcmjs.data.DicomMetaDictionary.nameMap["InstitutionName"].tag; //0008,0080
    institution_address: string = dcmjs.data.DicomMetaDictionary.nameMap["InstitutionAddress"].tag; //0008,0081
    institutional_department_name: string = dcmjs.data.DicomMetaDictionary.nameMap["InstitutionalDepartmentName"].tag; //0008,1040
    value_factories: { [key: string]: Function};

    constructor(AddressAnonymizer: AddressAnonymizer){
        this.address_anonymizer = AddressAnonymizer;
        
        this.institution_name = dcmjs.data.DicomMetaDictionary.unpunctuateTag(this.institution_name);
        this.institution_address = dcmjs.data.DicomMetaDictionary.unpunctuateTag(this.institution_address);
        this.institutional_department_name = dcmjs.data.DicomMetaDictionary.unpunctuateTag(this.institutional_department_name);

        this.value_factories = {
            [this.institution_name]: this.anonymize_institution_name,
            [this.institution_address]: this.anonymize_institution_address,
            [this.institutional_department_name]: this.anonymize_department_name
        };
    }

    anonymize = (dataset: any, data_tag: string): boolean => {
        const value_factory = this.value_factories[data_tag];
        if (value_factory == undefined){
            return false
        }

        if (dataset[data_tag].Value.length>1){
            dataset[data_tag].Value = dataset[data_tag].Value.map((original_value:string) => {
            return value_factory(original_value);
            });
            
            return true
        }
        else{
            const original_value = dataset[data_tag].Value[0]
            dataset[data_tag].Value[0] = value_factory(original_value)
            
            return true
        }
    }

    anonymize_institution_name= (original_value: string): string => {
        const region = this.address_anonymizer.get_region(original_value);
        const street_address = this.address_anonymizer.get_street_address(original_value);

        return `${region}'S ${street_address} CLINIC`
    }

    anonymize_institution_address= (original_value: string): string => {
        const full_address = this.address_anonymizer.get_legal_address(original_value);
        const country = this.address_anonymizer.get_country(original_value);

        return `${full_address}, ${country}`
    }

    anonymize_department_name= (original_value: string): string => {
        return 'RADIOLOGY'
    }

}