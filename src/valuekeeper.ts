import { dataSet, data } from "dcmjs";

class TagError extends Error {
  constructor(tag: string) {
    const message = `Bad tag name '${tag}'. Must be a well-known DICOM element name or a string in the form 'stuv,wxyz' where each character is a hexadecimal digit.`;
    super(message);

    // Set the prototype explicitly to ensure correct inheritance
    Object.setPrototypeOf(this, TagError.prototype);
  }
}

class ValueKeeper {
  private protectedTags: string[] = [];

  constructor(keywords: string[] = []) {
    for (const tag of keywords) {
      let pattern = /^\(?([0-9A-F]{4}),?([0-9A-F]{4})\)?$/;
      let match = tag.match(pattern);
      if (match) {
        this.protectedTags.push(match[1] + match[2]);
      } else {
        pattern = /^[a-zA-Z]+$/;

        try {
          match = tag.match(pattern)!;
          const tempTag = data.DicomMetaDictionary.nameMap[match[0]];
          if (!tempTag) {
            throw new TagError("invalidTag");
          } else {
            this.protectedTags.push(tempTag.tag);
          }
        } catch (error) {
          if (error instanceof TagError) {
            console.error(error.message);
          } else {
            // Handle other types of errors
            console.error("An unexpected error occurred:", error);
          }
        }
      }
    }
  }

  keep = (_: dataSet, dataTag: string): boolean => {
    if (this.protectedTags.includes(dataTag)) {
      return true;
    } else {
      return false;
    }
  };
}

export default ValueKeeper;
