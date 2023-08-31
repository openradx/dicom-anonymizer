export class UnwantedElementStripper {
  
  private tags: string[];
  

  constructor(keywords: string[]) {
    this.tags = keywords;
  }

  anonymize = (dataset: any, data_tag: string): boolean => {
    if (this.tags.includes(data_tag)){
      delete dataset[data_tag]
      return true
    }
    else{
      return false
    }
  }

}
