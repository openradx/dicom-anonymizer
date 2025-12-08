import { data, dataSet } from "dcmjs";

class PrivatTagAnonymizer {
  private shouldDelete: boolean;

  constructor(shouldDelete: boolean) {
    this.shouldDelete = shouldDelete;
  }

  anonymize = (dataset: dataSet, dataTag: string): boolean => {
    const currTag = data.Tag.fromString(dataTag);
    // Check if it's a private tag (odd group number)
    if (currTag.group() % 2 === 1) {
      if (this.shouldDelete) {
        // Delete private tag when anonymizePrivateTags is true
        delete dataset[dataTag];
      }
      // Always return true for private tags to skip further processing
      return true;
    } else {
      // Not a private tag, continue processing with other handlers
      return false;
    }
  };
}

export default PrivatTagAnonymizer;
