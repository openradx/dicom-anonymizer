import { Randomizer } from './randomizer';



export class Anonymizer {
  /**
    The main class responsible for anonymizing dcmjs datasets.
    New instances will anonymize instances differently, so when
    anonymizing instances from the same series, study, or patient,
    reuse an Anonymizer.
    
  */
  
  public id_prefix: string | undefined;
  public id_suffix: string | undefined;
  public seed: string | undefined;
  public minimum_offset_hours: number = 62 * 24;
  public maximum_offset_hours: number = 730 * 24;
  public randomizer: Randomizer;

  constructor(id_prefix?: string | undefined, id_suffix?: string | undefined, seed?: string | undefined) {
    this.id_prefix = id_prefix;
    this.id_suffix = id_suffix;
    this.seed = seed;
    this.randomizer = new Randomizer(this.seed)
  }
  

}