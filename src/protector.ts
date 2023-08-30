
export class Protector {
  
    private tags: string[];
    
  
    constructor(keywords: string[]) {
      this.tags = keywords;
    }
  
    anonymize = (data_tag: string): boolean => {
      if (this.tags.includes(data_tag)){
        return true
      }
      else{
        return false
      }
    }
  
  }