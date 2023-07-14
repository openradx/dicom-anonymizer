import * as dcmjs from 'dcmjs';
import { Randomizer } from './randomizer';


export class IDAnonymizer {
  
    private keywords: string[];
    private randomizer: Randomizer;
    private id_suffix: string | undefined;
    private id_prefix: string | undefined;
    private issuer_tag: string;
    private id_tags: string[];
    private alphabet: string;
    private totalAffixesLength: number;
    private indicesForRandomizer: number[];

    constructor(Randomizer: Randomizer, id_prefix?: string | undefined, id_suffix?: string | undefined, ...keywords: string[]) {
        this.keywords = keywords;
        this.randomizer = Randomizer;
        this.id_prefix = id_prefix;
        this.id_suffix = id_suffix;

        this.issuer_tag = dcmjs.data.DicomMetaDictionary.nameMap["IssuerOfPatientID"].tag
        this.id_tags =  this.keywords.map(tag_name => dcmjs.data.DicomMetaDictionary.nameMap[tag_name].tag);
        this.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

        if (this.id_prefix && this.id_suffix){
            this.totalAffixesLength = this.id_prefix.length + this.id_suffix.length
        } else if (this.id_prefix && !this.id_suffix){
            this.id_suffix = ""
            this.totalAffixesLength = this.id_prefix.length

        } else if (!this.id_prefix && this.id_suffix){
            this.id_prefix = ""
            this.totalAffixesLength = this.id_suffix.length
        }
        else {
            this.totalAffixesLength = 0
        }
        
        this.indicesForRandomizer = new Array<number>(12 - this.totalAffixesLength).fill(this.alphabet.length)
    }

    anonymize = (dataset: any, data_tag: string): boolean => {
        if (data_tag in this.keywords){
            this.replace_id(dataset, data_tag)
            return true
        }
        else if (data_tag == this.issuer_tag) {
            dataset[data_tag].Value[0] = "WieAuchImmerDiesesToolHeisenWird"
            return true
        } 
        else{ 
            return false
        }
    }

    replace_id = (dataset: any, data_tag: string): void => {
        
        if (dataset[data_tag].Value.length>1){
            dataset[data_tag].Value = dataset[data_tag].Value.map((original_value:string) => {
            return this.new_id(original_value);
            });
        }
        else{
            const original_value = dataset[data_tag].Value[0]
            dataset[data_tag].Value[0] = this.new_id(original_value)
        }
    }

    new_id = (original_value: any): string =>{
        let indexes = this.randomizer.getIntsFromRanges(original_value, ...this.indicesForRandomizer)
        const id_root: string = indexes.map(i => this.alphabet[i]).join('');
        
        return this.id_prefix + id_root + this.id_suffix
    }


}