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

type ElementHandler = (dataset: dataSet, tag: string) => boolean | Promise<boolean>;

interface AnonymizerOptions {
  protectedTags?: string[];
  anonymizePrivateTags?: boolean;
  idPrefix?: string;
  idSuffix?: string;
  seed?: string;
}

const defaultOptions: AnonymizerOptions = {
  protectedTags: [],
  anonymizePrivateTags: true,
  idPrefix: undefined,
  idSuffix: undefined,
  seed: undefined,
};

export default class Anonymizer {
  /**
    The main class responsible for anonymizing dcmjs datasets.
    New instances will anonymize instances differently, so when
    anonymizing instances from the same series, study, or patient,
    reuse an Anonymizer.
    
  */

  private dateOffsetHours = 0;
  randomizer: Randomizer;
  addressAnonymizer: AddressAnonymizer;
  elementHandlers: ElementHandler[];
  private _options: AnonymizerOptions;
  private initPromise: Promise<void>;

  constructor(options?: AnonymizerOptions) {
    this._options = Object.assign({}, defaultOptions, options ?? {});
    this.elementHandlers = [];
    this.randomizer = new Randomizer(this._options.seed);
    this.addressAnonymizer = new AddressAnonymizer(this.randomizer);
    this.initPromise = this._create();
  }

  private async _create() {
    await this.setOffset();

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
        this._options.idPrefix,
        this._options.idSuffix
      ).anonymize,
      this.addressAnonymizer.anonymize,
      new InstitutionAnonymizer(this.addressAnonymizer).anonymize,
      new FixedValueAnonymizer("00321033", "").anonymize, // RequestingService
      new FixedValueAnonymizer("00380300", "").anonymize, // CurrentPatientLocation
    ];
    if (this._options.protectedTags) {
      this.elementHandlers.unshift(new ValueKeeper(this._options.protectedTags).keep);
    }

    if (this._options.anonymizePrivateTags) {
      this.elementHandlers.push(new PrivatTagAnonymizer().anonymize);
    }

    await this.elementHandlers.push(new DateTimeAnonymizer(this.dateOffsetHours).anonymize);
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
  }

  async anonymize(dcmDict: data.DicomDict) {
    await this.initPromise;
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
            await this.walk(item, handler);
          }
        }
      }
    }
  }

  async anonymizeElement(dataset: dataSet, tag: string, handler: ElementHandler[]) {
    // Perform operations on the element

    for (const callback of handler) {
      const result = await callback(dataset, tag);

      if (result) {
        return;
      }
    }
  }
}
