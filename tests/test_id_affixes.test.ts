import { data } from "dcmjs";
import { describe, expect, it, test } from "vitest";
// Import your data_for_tests module
import Anonymizer from "../src/anonymizer";
// Replace with your testing library imports
import { loadInstance } from "./data_for_tests";

const elementPaths: string[][] = [
  // patient
  ["dict", "00080050"], //"AccessionNumber"
  ["dict", "00101000"], // OtherPatientIDs
  ["dict", "00101002", "00100020"], // OtherPatientIDsSequence[0].PatientID
  ["dict", "00100020"], // PatientID
  ["dict", "00400253"], // PerformedProcedureStepID
  ["dict", "00401001"], // RequestedProcedureID
  ["dict", "00400009"], // ScheduledProcedureStepID
  ["dict", "00200010"], // StudyID
];

describe("patient", async () => {
  it("should prepend idPrefix to IDs", async () => {
    const dataset = loadInstance();
    const anonymizer = new Anonymizer({ anonymizePrivateTags: true, idPrefix: "A1" });
    await anonymizer.anonymize(dataset);

    for (const elementPath of elementPaths) {
      if (elementPath.length == 2) {
        const value: string = dataset[elementPath[0]][elementPath[1]].Value[0];
        const startsWithA1 = value.startsWith("A1");
        expect(startsWithA1).toBe(true);
      } else {
        const value = dataset[elementPath[0]][elementPath[1]].Value[0][elementPath[2]].Value[0];
        const startsWithA1 = value.startsWith("A1");
        expect(startsWithA1).toBe(true);
      }
    }
  });

  it("should prepend idPrefix to each OtherPatientIDs", async () => {
    const dataset = loadInstance();
    dataset.dict["00101000"].Value = ["ID1", "ID2"];
    const anonymizer = new Anonymizer({ anonymizePrivateTags: true, idPrefix: "B2" });
    await anonymizer.anonymize(dataset);

    const value0 = dataset.dict["00101000"].Value[0];
    const firstStartsWithA1 = value0.startsWith("B2");
    expect(firstStartsWithA1).toBe(true);

    const value1 = dataset.dict["00101000"].Value[1];
    const secondStartsWithA1 = value1.startsWith("B2");
    expect(secondStartsWithA1).toBe(true);
  });

  it("should append idSuffix to IDs", async () => {
    const dataset = loadInstance();
    const anonymizer = new Anonymizer({ anonymizePrivateTags: true, idSuffix: "1A" });
    await anonymizer.anonymize(dataset);

    for (const elementPath of elementPaths) {
      if (elementPath.length == 2) {
        const value: string = dataset[elementPath[0]][elementPath[1]].Value[0];
        const startsWithA1 = value.endsWith("1A");
        expect(startsWithA1).toBe(true);
      } else {
        const value = dataset[elementPath[0]][elementPath[1]].Value[0][elementPath[2]].Value[0];
        const startsWithA1 = value.endsWith("1A");
        expect(startsWithA1).toBe(true);
      }
    }
  });

  it("should append idSuffix to each OtherPatientIDs", async () => {
    const dataset = loadInstance();
    dataset.dict["00101000"].Value = ["ID1", "ID2"];
    const anonymizer = new Anonymizer({ anonymizePrivateTags: true, idSuffix: "2B" });
    await anonymizer.anonymize(dataset);

    const value0 = dataset.dict["00101000"].Value[0];
    const firstStartsWithA1 = value0.endsWith("2B");
    expect(firstStartsWithA1).toBe(true);

    const value1 = dataset.dict["00101000"].Value[1];
    const secondStartsWithA1 = value1.endsWith("2B");
    expect(secondStartsWithA1).toBe(true);
  });

  it("should append and prepend idPrefix and idSuffix to ID", async () => {
    const dataset = loadInstance();
    const anonymizer = new Anonymizer({
      anonymizePrivateTags: true,
      idPrefix: "C3",
      idSuffix: "3C",
    });
    await anonymizer.anonymize(dataset);

    const value = dataset.dict["00100020"].Value[0];

    const startsWithC3 = value.startsWith("C3");
    expect(startsWithC3).toBe(true);

    const endsWithC3 = value.endsWith("3C");
    expect(endsWithC3).toBe(true);
  });
});
