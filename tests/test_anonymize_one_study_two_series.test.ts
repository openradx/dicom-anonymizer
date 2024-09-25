// Import your Anonymizer class
import { data } from "dcmjs";
import { describe, expect, it, test } from "vitest";
// Import your data_for_tests module
import Anonymizer from "../src/anonymizer";
// Replace with your testing library imports
import { loadInstance } from "./data_for_tests";

// Replace with the actual structure of your dataset

class OneStudyTwoSeries {
  dataset1: data.DicomDict;
  dataset2: data.DicomDict;

  constructor() {
    this.dataset1 = loadInstance(1, 1, 1);
    this.dataset2 = loadInstance(1, 1, 2);

    const anonymizer = new Anonymizer("");
    anonymizer.anonymize(this.dataset1);
    anonymizer.anonymize(this.dataset2);
  }
}

describe("patient", () => {
  it("should anonymize patient and study attributes the same", () => {
    const diffInstances = new OneStudyTwoSeries();
    const dataset1 = diffInstances.dataset1;
    const dataset2 = diffInstances.dataset2;
    const elementPaths: string[][] = [
      // patient
      ["dict", "00100020"], // PatientID
      ["dict", "00101000"], // OtherPatientIDs
      ["dict", "00101002", "00100020"], // OtherPatientIDsSequence[0].PatientID
      ["dict", "00101001"], // OtherPatientNames
      ["dict", "00101040"], // PatientAddress
      ["dict", "00100030"], // PatientBirthDate
      ["dict", "00101005"], // PatientBirthName
      ["dict", "00100032"], // PatientBirthTime
      ["dict", "00101060"], // PatientMotherBirthName
      ["dict", "00100010"], // PatientName
      ["dict", "00102297"], // ResponsiblePerson
      // study
      ["dict", "0020000D"], // StudyInstanceUID
      ["dict", "00081060"], // NameOfPhysiciansReadingStudy
      ["dict", "00080090"], // ReferringPhysicianName
      ["dict", "00321032"], // RequestingPhysician
      ["dict", "00080050"], // AccessionNumber
      ["dict", "00080020"], // StudyDate
      ["dict", "00200010"], // StudyID
      ["dict", "00080030"], // StudyTime
    ];

    for (const elementPath of elementPaths) {
      if (elementPath.length == 2) {
        const value1 = dataset1[elementPath[0]][elementPath[1]].Value[0];
        const value2 = dataset2[elementPath[0]][elementPath[1]].Value[0];
        expect(value1).toEqual(value2);
      } else {
        const value1 = dataset1[elementPath[0]][elementPath[1]].Value[0][elementPath[2]].Value[0];
        const value2 = dataset2[elementPath[0]][elementPath[1]].Value[0][elementPath[2]].Value[0];
        expect(value1).toEqual(value2);
      }
    }
  });

  it("should anonymize series and instance attributes differently", () => {
    const diffInstances = new OneStudyTwoSeries();
    const dataset1 = diffInstances.dataset1;
    const dataset2 = diffInstances.dataset2;
    const elementPaths = [
      // series
      ["dict", "0020000E"], // SeriesInstanceUID
      ["dict", "00081070"], // OperatorsName
      ["dict", "00081050"], // PerformingPhysicianName
      ["dict", "00400275", "00401001"], // RequestAttributesSequence[0].RequestedProcedureID
      ["dict", "00400275", "00400009"], // RequestAttributesSequence[0].ScheduledProcedureStepID
      ["dict", "00200052"], // FrameOfReferenceUID
      ["dict", "00080081"], // InstitutionAddress
      ["dict", "00080080"], // InstitutionName
      ["dict", "00400253"], // PerformedProcedureStepID
      ["dict", "00401001"], // RequestedProcedureID
      ["dict", "00400009"], // ScheduledProcedureStepID
      //["dict", "00080021"], // SeriesDate
      ["dict", "00080031"], // SeriesTime
      // instance
      ["dict", "00080018"], //SOPInstanceUID
      ["meta", "00020003"], //MediaStorageSOPInstanceUID
      //["dict", "00080012"], //InstanceCreationDate
      ["dict", "00080013"], //InstanceCreationTime
    ];

    for (const elementPath of elementPaths) {
      if (elementPath.length == 2) {
        const value1 = dataset1[elementPath[0]][elementPath[1]].Value[0];
        const value2 = dataset2[elementPath[0]][elementPath[1]].Value[0];
        expect(value1).not.toEqual(value2);
      } else {
        const value1 = dataset1[elementPath[0]][elementPath[1]].Value[0][elementPath[2]].Value[0];
        const value2 = dataset2[elementPath[0]][elementPath[1]].Value[0][elementPath[2]].Value[0];
        expect(value1).not.toEqual(value2);
      }
    }
  });
});
