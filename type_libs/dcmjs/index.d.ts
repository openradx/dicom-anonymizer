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

  export class Tag {
    static fromString(str: string): Tag;
    static fromPString(str: any): Tag;
    static fromNumbers(group: any, element: any): Tag;
    static readTag(stream: any): Tag;
    group(): number;
    constructor(value: any);
    toString(): string;
    toCleanString(): string;
    is(t: any): boolean;
    element(): number;
    isPixelDataTag(): boolean;
    isPrivateCreator(): boolean;
    write(stream: any, vrType: any, values: any, syntax: any, writeOptions: any): any;
  }
  export namespace DicomMetaDictionary {
    export class DicomMetaDictionary {}
    var dictionary: dictionary;
    var nameMap: nameMap;
    export function naturalizeDataset(dataset: dataSet): { _vrMap: any };
    export function punctuateTag(rawTag: string): string;
    export function unpunctuateTag(tag: string): string;
    export function parseIntFromTag(tag: string): number;
    export function tagAsIntegerFromName(name: string): number | undefined;
  }

  export class DicomMetaDictionary {
    static punctuateTag(rawTag: string): string;
    static unpunctuateTag(tag: string): string;
    static parseIntFromTag(tag: string): number;
    static tagAsIntegerFromName(name: string): number | undefined;
    static cleanDataset(dataset: dataSet): {};
    static namifyDataset(dataset: dataSet): {};
    /** converts from DICOM JSON Model dataset to a natural dataset
     * - sequences become lists
     * - single element lists are replaced by their first element,
     *     with single element lists remaining lists, but being a
     *     proxy for the child values, see addAccessors for examples
     * - object member names are dictionary, not group/element tag
     */
    static naturalizeDataset(dataset: dataSet): { _vrMap: {} };
    denaturalizeValue(naturalValue: any): any;
    denaturalizeDataset(dataset: dataSet, nameMap?: any): {};
    uid(): string;
    date(): string;
    time(): string;
    dateTime(): string;

    constructor(customDictionary: any);

    denaturalizeDataset(dataset: dataSet): {};
    nameMap: nameMap;
    dictionary: dictionary;
  }

  export = DicomMetaDictionary;
  
  declare class DicomDict {
    constructor(meta: dataSet);
    meta: dataSet;
    dict: dataSet;
    static upsertTag(tag: string, vr: string, values: any): void;
  }
  export = DicomDict;
  
  export namespace DicomMessage {
    export class DicomMessage {}
    export function readFile(buffer: any, options?: any): any;
  }

  declare class DicomMessage {
    read(
      bufferStream: any,
      syntax: any,
      ignoreErrors: any,
      untilTag?: any,
      includeUntilTagValue?: boolean
    ): {};
    readTag(
      bufferStream: any,
      syntax: any,
      untilTag?: any,
      includeUntilTagValue?: boolean
    ): {
      tag: any;
      vr: any;
      values: any;
    };
    _read(
      bufferStream: any,
      syntax: any,
      options?: {
        ignoreErrors: boolean;
        untilTag: any;
        includeUntilTagValue: boolean;
      }
    ): {};
    _normalizeSyntax(syntax: any): any;
    isEncapsulated(syntax: any): boolean;
    static readFile(
      buffer: any,
      options?:
          {
            ignoreErrors: boolean;
            untilTag: null;
            includeUntilTagValue: boolean;
            noCopy: boolean;
          }
        
    ): any;
    writeTagObject(
      stream: any,
      tagString: any,
      vr: any,
      values: any,
      syntax: any,
      writeOptions: any
    ): void;
    write(jsonObjects: any, useStream: any, syntax: any, writeOptions: any): number;
    _readTag(
      stream: any,
      syntax: any,
      options?: {
        untilTag: any;
        includeUntilTagValue: boolean;
      }
    ): {
      tag: any;
      vr: any;
      values: any;
    };
  }
  export = DicomMessage;

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
