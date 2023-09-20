declare module "dcmjs" {
  export interface dataSet {
    [tag: string]: {
      vr: string;
      Value: any;
    };
  }

  interface nameMap {
    [key: string]: {
      name: string;
      tag: string;
      value: string;
    };
  }

  interface dictionary {
    [key: string]: {
      tag: string;
      vr: string;
      name: string;
      vm: string;
      version: string;
    };
  }

  // Add namespace as dcmjs exports some stuff inside a data object,
  // see https://github.com/dcmjs-org/dcmjs/blob/master/src/index.js
  declare namespace data {
    export class DicomDict {
      constructor(meta: dataSet);
      meta: dataSet;
      dict: dataSet;
      
    }

    export class DicomMessage {
      static readFile(buffer: ArrayBufferLike): DicomDict;
    }

    export class DicomMetaDictionary {
      static nameMap: nameMap;
      static dictionary: dictionary;
      static punctuateTag(rawTag: string): string;
      static unpunctuateTag(tag: string): string;
      static parseIntFromTag(tag: string): number;
      
      /** converts from DICOM JSON Model dataset to a natural dataset
       * - sequences become lists
       * - single element lists are replaced by their first element,
       *     with single element lists remaining lists, but being a
       *     proxy for the child values, see addAccessors for examples
       * - object member names are dictionary, not group/element tag
       */
      // static naturalizeDataset(dataset: dataSet): { _vrMap: any };
      // static denaturalizeValue(naturalValue: any): any;
      // static denaturalizeDataset(dataset: dataSet, nameMap?: any): any;
      static uid(): string;
      static date(): string;
      static time(): string;
      static dateTime(): string;
    }

    export class Tag {
      static fromString(str: string): Tag;
      group(): number;
      constructor(value: any);
      toString(): string;
      toCleanString(): string;
      is(t: string): boolean;
      element(): number;
      isPixelDataTag(): boolean;
      isPrivateCreator(): boolean;
      write(stream: any, vrType: any, values: any, syntax: any, writeOptions: any): any;
    }

    export class ValueRepresentation {
      createByTypeString(type: any): any;
      constructor(type: any);
      type: any;
      multi: boolean;
      _isBinary: boolean;
      _allowMultiple: boolean;
      _isExplicit: boolean;
      isBinary(): boolean;
      allowMultiple(): boolean;
      isExplicit(): boolean;
      read(stream: any, length: any, syntax: any): any;
      readBytes(stream: any, length: any): any;
      readNullPaddedString(stream: any, length: any): any;
      write(stream: any, type: any, ...args: any[]): any[];
      writeBytes(
        stream: any,
        value: any,
        lengths: any,
        writeOptions?: {
          allowInvalidVRLength: boolean;
        }
      ): number;
    }
  }
}
