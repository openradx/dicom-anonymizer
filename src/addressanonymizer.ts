import { lists } from "./lists";
import * as dcmjs from 'dcmjs';
import { Randomizer } from "./randomizer";

export class AddressAnonymizer {

    private randomizer: Randomizer;
    private lists: lists;

    address_tag: string = dcmjs.data.DicomMetaDictionary.nameMap["PatientAddress"].tag;
    region_tag: string = dcmjs.data.DicomMetaDictionary.nameMap["RegionOfResidence"].tag;
    country_tag: string = dcmjs.data.DicomMetaDictionary.nameMap["CountryOfResidence"].tag;
    value_factories: { [key: string]: Function};
    
    
    constructor(Randomizer: any){
        this.randomizer = Randomizer;
        this.lists = new lists();

        this.address_tag = dcmjs.data.DicomMetaDictionary.unpunctuateTag(this.address_tag);
        this.region_tag = dcmjs.data.DicomMetaDictionary.unpunctuateTag(this.region_tag);
        this.country_tag = dcmjs.data.DicomMetaDictionary.unpunctuateTag(this.country_tag);

        this.value_factories = {
            [this.address_tag]: this.get_legal_address,
            [this.region_tag]: this.get_region,
            [this.country_tag]: this.get_country
        };
    }

    anonymize = (dataset: any, data_tag: string): boolean => {
        const value_factory = this.value_factories[data_tag]
        if (typeof value_factory !== 'function' || dataset[data_tag].Value[0] == undefined) {
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

    get_legal_address = (original_value: string): string => {
        let street = this.get_street_address(original_value);
        let street_number = this.get_street_number(original_value);
        let city = this.get_region(original_value);
        
        return `${street_number} ${street}, ${city}`
    }

    get_street_number = (original_value: string): string =>{
        let street_number_index: number;
        [street_number_index] = this.randomizer.getIntsFromRanges(
            original_value, 1000)
        var street_number: number = street_number_index + 1
        
        return `${street_number}`
    }

    get_street_address = (original_value: string): string =>{
        let street_index: number;
        [street_index] = this.randomizer.getIntsFromRanges(
            original_value, this.lists.streets.length)

        return `${this.lists.streets[street_index]}`
    }

    get_region = (original_value: string): string => {
        let city_index: number;
        [city_index] = this.randomizer.getIntsFromRanges(original_value, this.lists.cities.length)
        
        return `${this.lists.cities[city_index]}`
    }

    get_country = (original_value: string):string => {
        let country_index: number;
        [country_index] = this.randomizer.getIntsFromRanges(original_value, this.lists.countries.length)
        
        return `${this.lists.countries[country_index]}`
    }


}