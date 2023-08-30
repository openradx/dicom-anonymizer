import { lists } from "./lists";
import { Randomizer } from "./randomizer";

export class PNAnonymizer {

  private randomizer: Randomizer;
  lists: lists;

  constructor(Randomizer: Randomizer){
    this.randomizer = Randomizer;
    this.lists = new lists();
  }

  anonymize = (dataset: any, data_tag: string): boolean => {
    if (dataset[data_tag].vr != "PN"){
      return false
    }
    

    const patient_sex = dataset["00100040"].Value[0]; //PatientSex
    if (dataset[data_tag].Value.length>1){
      
      dataset[data_tag].Value = dataset[data_tag].Value.map((original_name:string) => {
        return this.new_pn(original_name, patient_sex);
      });
    }
    else {
      const original_name = dataset[data_tag].Value[0]
      dataset[data_tag].Value[0] = this.new_pn(original_name, patient_sex)
    }
    
    return true
  }

  new_pn(original_value: string, sex?: string | undefined,){
    var first_names: string[];
    if (sex == "F"){
      first_names = this.lists.female_first_names;}
    else if (sex == "M"){
      first_names = this.lists.male_first_names;}
    else {
      first_names = this.lists.all_first_names;
    }
    const last_names = this.lists.last_names
    if (original_value != undefined){
      original_value = original_value.replace("^", "");
    }

    const indices = this.randomizer.getIntsFromRanges(original_value, this.lists.last_names.length, first_names.length, this.lists.all_first_names.length)

    return `${last_names[indices[0]]}^${first_names[indices[1]]}^${this.lists.all_first_names[indices[2]]}`
  }

}