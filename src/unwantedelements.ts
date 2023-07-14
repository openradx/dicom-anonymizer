import {DicomDict, DicomMessage, Tag, DicomMetaDictionary} from 'dcmjs';


export class UnwantedElementStripper {
  
  private tags: string[];
  

  constructor(keywords: string[]) {
    this.tags = keywords;
  }

  anonymize = (dataset: any, data_tag: string): boolean => {
    if (data_tag in this.tags){
      delete dataset[data_tag]
      return true
    }
    else{
      return false
    }
  }

}
