import { Randomizer } from './randomizer';
import * as dcmjs from 'dcmjs';
import { UnwantedElementStripper } from './unwantedelements';
import { PNAnonymizer } from './pnanonymizer';
import { FixedValueAnonymizer } from './fixedvalueanonymizer';
import { UIAnonymizer } from './uianonymizer';
import { AddressAnonymizer } from './addressanonymizer';
import { IDAnonymizer } from './idanonymizer';
import { DateTimeAnonymizer } from './datetimeanonymizer';
import { Protector } from './protector';
import { InstitutionAnonymizer } from './institutionanonymizer';

export class Anonymizer {
  /**
    The main class responsible for anonymizing dcmjs datasets.
    New instances will anonymize instances differently, so when
    anonymizing instances from the same series, study, or patient,
    reuse an Anonymizer.
    
  */
  private patientID: string;
  
  private id_prefix: string | undefined;
  private id_suffix: string | undefined;
  private seed: string | undefined;

  
  randomizer: Randomizer;
  address_anonymizer: AddressAnonymizer;
  element_handlers: any[];
  private date_offset_hours: number
  
  constructor( patientID: string, id_prefix?: string | undefined, id_suffix?: string | undefined, seed?: string | undefined) {
    const minimum_offset_hours: number = 62 * 24;
    const maximum_offset_hours: number = 730 * 24;
    this.patientID = patientID;
    this.id_prefix = id_prefix;
    this.id_suffix = id_suffix;
    this.seed = seed;
    this.randomizer = new Randomizer(this.seed)
    this.date_offset_hours = Number(-(
      this.randomizer.toInt("date_offset") % (BigInt(maximum_offset_hours) - BigInt(minimum_offset_hours)) + BigInt(minimum_offset_hours)
    ))
    //this.data = data;
    this.address_anonymizer = new AddressAnonymizer(this.randomizer);
    this.element_handlers = 
        [new UnwantedElementStripper(["00101081",//"BranchOfService",
                                      "00102180",//"Occupation",
                                      "00101090",//"MedicalRecordLocator",
                                      "00101080",//"MilitaryRank",
                                      "00100050",//"PatientInsurancePlanCodeSequence",
                                      "00102201",//"PatientReligiousPreference",
                                      "00102155",//"PatientTelecomInformation",
                                      "00102154",//"PatientTelephoneNumbers",
                                      "00101100",//"ReferencedPatientPhotoSequence",
                                      "00102299",//"ResponsibleOrganization"
                                      ]).anonymize,
        new UIAnonymizer(this.randomizer).anonymize,
        new PNAnonymizer(this.randomizer).anonymize,
        new IDAnonymizer(this.randomizer,
                                     ["00080050",//"AccessionNumber",
                                      "00101000",//"OtherPatientIDs",
                                      "00402017",//"FillerOrderNumberImagingServiceRequest",
                                      //"FillerOrderNumberImagingServiceRequestRetired", Retired
                                      //"FillerOrderNumberProcedure", Retired
                                      "00100020",//"PatientID",
                                      "00400253",//"PerformedProcedureStepID",
                                      "00402016",//"PlacerOrderNumberImagingServiceRequest",
                                      //"PlacerOrderNumberImagingServiceRequestRetired",Retired
                                      // "PlacerOrderNumberProcedure", Retired 
                                      "00401001",//"RequestedProcedureID",
                                      "00400009",//"ScheduledProcedureStepID",
                                      "00081010",//"StationName",
                                      "00200010",//"StudyID"
                                      ], 
                                      undefined, undefined).anonymize,                              
        this.address_anonymizer.anonymize,
        new InstitutionAnonymizer(this.address_anonymizer).anonymize,
        new FixedValueAnonymizer("00100020", this.patientID).anonymize,
        new DateTimeAnonymizer(this.date_offset_hours).anonymize
    ];
    
  } 
  
  anonymize(data: any){
    this.walk(data.meta, this.element_handlers);
    this.walk(data.dict, this.element_handlers);
  }
  
  walk(dataset: any, handler: any) {
    const tagList = Object.keys(dataset)
    for (const tag of tagList) {
      const element = dataset[tag];
      
      if (this.del_private_tags(dataset, tag)){
        continue
      }
      
      this.anonymize_element(dataset, tag, handler)
      
      // If the element is a sequence, recursively walk through its items
      if (tag in dataset && element.vr === 'SQ') {
        for ( let i = 0; i< element.Value.length; i++){
          const sequence = element.Value
          for (const item of sequence) {
            this.walk(item, handler);
            
          }
        }
      }
    }
  }

  anonymize_element(dataset: any, tag: string, handler: any) {
    // Perform operations on the element
    for (const callback of handler){
      if (callback(dataset, tag)){
        return;
      };
    }
  }
 
  
  del_private_tags(dataset: any, data_tag: string): boolean {
    const currTag = dcmjs.data.Tag.fromString(data_tag);
      //if (currTag.isPrivateCreator()){
      if (currTag.group() % 2 === 1){
        delete dataset[data_tag];
        return true;
      }
      else {
        return false;
      }
  }


}