import { data, dataSet } from "dcmjs";
import { AddressAnonymizer } from "./addressanonymizer";
import { DateTimeAnonymizer } from "./datetimeanonymizer";
import { FixedValueAnonymizer } from "./fixedvalueanonymizer";
import { IDAnonymizer } from "./idanonymizer";
import { InstitutionAnonymizer } from "./institutionanonymizer";
import { PNAnonymizer } from "./pnanonymizer";
import { Protector } from "./protector";
import { Randomizer } from "./randomizer";
import { UIAnonymizer } from "./uianonymizer";
import { UnwantedElementStripper } from "./unwantedelements";

type ElementHandler = (dataset: dataSet, tag: string) => boolean;

export class Anonymizer {
  /**
    The main class responsible for anonymizing dcmjs datasets.
    New instances will anonymize instances differently, so when
    anonymizing instances from the same series, study, or patient,
    reuse an Anonymizer.
    
  */

  private patientID?: string;
  private date_offset_hours: number;
  randomizer: Randomizer;
  address_anonymizer: AddressAnonymizer;
  element_handlers: ElementHandler[];

  constructor(
    patientID?: string,
    protected_tags?: string[],
    id_prefix?: string,
    id_suffix?: string,
    seed?: string
  ) {
    const minimum_offset_hours: number = 62 * 24;
    const maximum_offset_hours: number = 730 * 24;
    if (patientID) {
      this.patientID = patientID;
    }
    this.randomizer = new Randomizer(seed);
    this.date_offset_hours = Number(
      -(
        (this.randomizer.toInt("date_offset") %
          (BigInt(maximum_offset_hours) - BigInt(minimum_offset_hours))) +
        BigInt(minimum_offset_hours)
      )
    );
    //this.data = data;
    this.address_anonymizer = new AddressAnonymizer(this.randomizer);
    this.element_handlers = [
      new Protector(protected_tags).protect,
      new UnwantedElementStripper([
        "00101081", //"BranchOfService",
        "00102180", //"Occupation",
        "00101090", //"MedicalRecordLocator",
        "00101080", //"MilitaryRank",
        "00100050", //"PatientInsurancePlanCodeSequence",
        "00102201", //"PatientReligiousPreference",
        "00102155", //"PatientTelecomInformation",
        "00102154", //"PatientTelephoneNumbers",
        "00101100", //"ReferencedPatientPhotoSequence",
        "00102299", //"ResponsibleOrganization"
      ]).anonymize,
      new UIAnonymizer(this.randomizer).anonymize,
      new PNAnonymizer(this.randomizer).anonymize,
      new IDAnonymizer(
        this.randomizer,
        [
          "00080050", //"AccessionNumber",
          "00101000", //"OtherPatientIDs",
          "00402017", //"FillerOrderNumberImagingServiceRequest",
          //"FillerOrderNumberImagingServiceRequestRetired", Retired
          //"FillerOrderNumberProcedure", Retired
          "00100020", //"PatientID",
          "00400253", //"PerformedProcedureStepID",
          "00402016", //"PlacerOrderNumberImagingServiceRequest",
          //"PlacerOrderNumberImagingServiceRequestRetired",Retired
          // "PlacerOrderNumberProcedure", Retired
          "00401001", //"RequestedProcedureID",
          "00400009", //"ScheduledProcedureStepID",
          "00081010", //"StationName",
          "00200010", //"StudyID"
        ],
        id_prefix,
        id_suffix
      ).anonymize,
      this.address_anonymizer.anonymize,
      new InstitutionAnonymizer(this.address_anonymizer).anonymize,
      new FixedValueAnonymizer("00321033", "").anonymize, // RequestingService
      new FixedValueAnonymizer("00380300", "").anonymize, // CurrentPatientLocation
      new DateTimeAnonymizer(this.date_offset_hours).anonymize,
    ];
    if (patientID) {
      this.element_handlers.push(new FixedValueAnonymizer("00100020", patientID).anonymize);
    }
  }

  anonymize(data: data.DicomDict) {
    this.walk(data.meta, this.element_handlers);
    this.walk(data.dict, this.element_handlers);
  }

  walk(dataset: dataSet, handler: ElementHandler[]) {
    const tagList = Object.keys(dataset);
    for (const tag of tagList) {
      const element = dataset[tag];

      if (this.del_private_tags(dataset, tag)) {
        continue;
      }

      this.anonymize_element(dataset, tag, handler);

      // If the element is a sequence, recursively walk through its items
      if (tag in dataset && element.vr == "SQ") {
        for (let i = 0; i < element.Value.length; i++) {
          const sequence = element.Value;
          for (const item of sequence) {
            this.walk(item, handler);
          }
        }
      }
    }
  }

  anonymize_element(dataset: dataSet, tag: string, handler: ElementHandler[]) {
    // Perform operations on the element
    for (const callback of handler) {
      if (callback(dataset, tag)) {
        return;
      }
    }
  }

  del_private_tags(dataset: dataSet, data_tag: string): boolean {
    const currTag = data.Tag.fromString(data_tag);
    if (currTag.group() % 2 === 1) {
      delete dataset[data_tag];
      return true;
    } else {
      return false;
    }
    //return true
  }
}
