
export class Protector {
  
    private protected_tags: string[];
    
  
    constructor(keywords: string[] = []) {
      this.protected_tags = keywords;
    }
  
    protect = (data_tag: string): boolean => {
      if (this.protected_tags.includes(data_tag)){
        return true
      }
      else{
        return false
      }
    }
  
  }