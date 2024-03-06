import { data, dataSet } from "dcmjs";
import AddressAnonymizer from "./addressanonymizer";
import DateTimeAnonymizer from "./datetimeanonymizer";
import FixedValueAnonymizer from "./fixedvalueanonymizer";
import IDAnonymizer from "./idanonymizer";
import InstitutionAnonymizer from "./institutionanonymizer";
import PNAnonymizer from "./pnanonymizer";
import PrivatTagAnonymizer from "./privatetaganonymizer";
import Randomizer from "./randomizer";
import UIAnonymizer from "./uianonymizer";
import UnwantedElementStripper from "./unwantedelements";
import ValueKeeper from "./valuekeeper";

type ElementHandler = (
  dataset: dataSet,
  tag: string
) => boolean | Promise<boolean>;

export default class Anonymizer {
  /**
    The main class responsible for anonymizing dcmjs datasets.
    New instances will anonymize instances differently, so when
    anonymizing instances from the same series, study, or patient,
    reuse an Anonymizer.
    
  */

  private patientID?: string;
  private anonymizePrivateTags?: boolean = true;
  private dateOffsetHours = 0;
  randomizer: Randomizer;
  addressAnonymizer: AddressAnonymizer;
  elementHandlers: ElementHandler[];

  constructor(
    patientID?: string,
    protectedTags?: string[],
    anonymizePrivateTags?: boolean,
    idPrefix?: string,
    idSuffix?: string,
    seed?: string
  ) {
    if (patientID) {
      this.patientID = patientID;
    }
    if (anonymizePrivateTags) {
      this.anonymizePrivateTags = anonymizePrivateTags;
    }

    this.randomizer = new Randomizer(seed);
    this.setOffset();

    this.addressAnonymizer = new AddressAnonymizer(this.randomizer);
    this.elementHandlers = [
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
        idPrefix,
        idSuffix
      ).anonymize,
      this.addressAnonymizer.anonymize,
      new InstitutionAnonymizer(this.addressAnonymizer).anonymize,
      new FixedValueAnonymizer("00321033", "").anonymize, // RequestingService
      new FixedValueAnonymizer("00380300", "").anonymize, // CurrentPatientLocation
    ];
    if (protectedTags) {
      this.elementHandlers.unshift(new ValueKeeper(protectedTags).keep);
    }
    if (this.patientID) {
      this.elementHandlers.unshift(
        new FixedValueAnonymizer("00100020", this.patientID).anonymize
      );
    }
    if (this.anonymizePrivateTags) {
      this.elementHandlers.push(new PrivatTagAnonymizer().anonymize);
    }
  }
  async setOffset() {
    const res = await this.randomizer.toInt("dateOffset");
    const minimumOffsetHours: number = 62 * 24;
    const maximumOffsetHours: number = 730 * 24;

    this.dateOffsetHours = Number(
      -(
        (res % (BigInt(maximumOffsetHours) - BigInt(minimumOffsetHours))) +
        BigInt(minimumOffsetHours)
      )
    );

    this.elementHandlers.push(
      new DateTimeAnonymizer(this.dateOffsetHours).anonymize
    );
  }

  async anonymize(dcmDict: data.DicomDict) {
    await this.walk(dcmDict.meta, this.elementHandlers);
    await this.walk(dcmDict.dict, this.elementHandlers);
  }

  async walk(dataset: dataSet, handler: ElementHandler[]) {
    const tagList = Object.keys(dataset);

    for (const tag of tagList) {
      const element = dataset[tag];

      await this.anonymizeElement(dataset, tag, handler);

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

  async anonymizeElement(
    dataset: dataSet,
    tag: string,
    handler: ElementHandler[]
  ) {
    // Perform operations on the element

    for (const callback of handler) {
      const result = await callback(dataset, tag);

      if (result) {
        return;
      }
    }
  }
}
