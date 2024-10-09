import { data, dictionary } from "dcmjs";
import { describe, expect, it } from "vitest";
// Import your data_for_tests module
import Anonymizer from "../src/anonymizer";
import { lists } from "../src/lists";
// Replace with your testing library imports
import { loadInstance, populateTag, loadTestInstance } from "./data_for_tests";

describe("patient", async () => {
  it("should not alter nonidentifying UIs", async () => {
    const elementPaths: (string | number)[][] = [
      ["meta", "00020002"], //"MediaStorageSOPClassUID"
      ["meta", "00020010"], // TransferSyntaxUID
      ["meta", "00020012"], // ImplementationClassUID
      ["dict", "00080016"], // SOPClassUID
      ["dict", "00082112", 0, "00081150"], // "SourceImageSequence[0].ReferencedSOPClassUID"
    ];

    const dataset = loadTestInstance();
    const expected: string[] = [];
    for (const elementPath of elementPaths) {
      if (elementPath.length == 2) {
        expected.push(dataset[elementPath[0]][elementPath[1]].Value[0]);
      } else {
        expected.push(
          dataset[elementPath[0]][elementPath[1]].Value[elementPath[2]][elementPath[3]].Value[0]
        );
      }
    }

    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);

    const actual: string[] = [];
    for (const elementPath of elementPaths) {
      if (elementPath.length == 2) {
        actual.push(dataset[elementPath[0]][elementPath[1]].Value[0]);
      } else {
        actual.push(
          dataset[elementPath[0]][elementPath[1]].Value[elementPath[2]][elementPath[3]].Value[0]
        );
      }
    }

    for (let i = 0; i < expected.length; i++) {
      expect(expected[i]).toEqual(actual[i]);
    }
  });

  it("should anonymize identifying UIs", async () => {
    const elementPaths: (string | number)[][] = [
      ["dict", "00080018"], //SOPInstanceUID
      ["meta", "00020003"], //MediaStorageSOPInstanceUID
      ["dict", "00082112", 0, "00081155"], // "SourceImageSequence[0].ReferencedSOPInstanceUID"
      ["dict", "0020000D"], // StudyInstanceUID
      ["dict", "00200052"], // FrameOfReferenceUID
      ["dict", "0020000E"], // SeriesInstanceUID
    ];

    const dataset = loadTestInstance();
    const before: string[] = [];
    for (const elementPath of elementPaths) {
      if (elementPath.length == 2) {
        before.push(dataset[elementPath[0]][elementPath[1]].Value[0]);
      } else {
        before.push(
          dataset[elementPath[0]][elementPath[1]].Value[elementPath[2]][elementPath[3]].Value[0]
        );
      }
    }

    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);

    const actual: string[] = [];
    for (const elementPath of elementPaths) {
      if (elementPath.length == 2) {
        actual.push(dataset[elementPath[0]][elementPath[1]].Value[0]);
      } else {
        actual.push(
          dataset[elementPath[0]][elementPath[1]].Value[elementPath[2]][elementPath[3]].Value[0]
        );
      }
    }

    for (let i = 0; i < before.length; i++) {
      expect(before[i]).not.toEqual(actual[i]);
    }
  });

  //test_repeatedIDentifyingUIs_get_same_values???

  it("should anonymize IDs", async () => {
    const elementPaths: (string | number)[][] = [
      ["dict", "00080050"], //"AccessionNumber"
      ["dict", "00100021"], // IssuerOfPatientID
      ["dict", "00101000"], // OtherPatientIDs
      ["dict", "00402017"], //"FillerOrderNumberImagingServiceRequest"

      ["dict", "00101002", 0, "00100020"], // "OtherPatientIDsSequence[0].PatientID"
      ["dict", "00101002", 0, "00100021"], // "OtherPatientIDsSequence[0].IssuerOfPatientID"
      ["dict", "00101002", 1, "00100020"], // "OtherPatientIDsSequence[1].PatientID"
      ["dict", "00101002", 1, "00100021"], // "OtherPatientIDsSequence[1].IssuerOfPatientID"

      ["dict", "00100020"], // PatientID"
      ["dict", "00400253"], // PerformedProcedureStepID"
      ["dict", "00402016"], //"PlacerOrderNumberImagingServiceRequest",
      ["dict", "00400275", "00401001"], // RequestAttributesSequence[0].RequestedProcedureID
      ["dict", "00400275", "00400009"], // RequestAttributesSequence[0].ScheduledProcedureStepID
      ["dict", "00400009"], //"ScheduledProcedureStepID",
      ["dict", "00200010"], //"StudyID"]
    ];

    const dataset = loadTestInstance();

    const before: string[] = [];
    for (const elementPath of elementPaths) {
      if (elementPath.length == 2) {
        before.push(dataset[elementPath[0]][elementPath[1]].Value[0]);
      } else if (elementPath.length == 3) {
        before.push(dataset[elementPath[0]][elementPath[1]].Value[0][elementPath[2]].Value[0]);
      } else {
        before.push(
          dataset[elementPath[0]][elementPath[1]].Value[elementPath[2]][elementPath[3]].Value[0]
        );
      }
    }

    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);

    const actual: string[] = [];
    for (const elementPath of elementPaths) {
      if (elementPath.length == 2) {
        actual.push(dataset[elementPath[0]][elementPath[1]].Value[0]);
      } else if (elementPath.length == 3) {
        actual.push(dataset[elementPath[0]][elementPath[1]].Value[0][elementPath[2]].Value[0]);
      } else {
        actual.push(
          dataset[elementPath[0]][elementPath[1]].Value[elementPath[2]][elementPath[3]].Value[0]
        );
      }
    }

    for (let i = 0; i < before.length; i++) {
      expect(before[i]).not.toEqual(actual[i]);
    }
  });

  it("should anonymize single OtherPatientIDs to single ID", async () => {
    const dataset = loadTestInstance();
    dataset.dict["00101000"].Value = ["ID1"];
    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);
    const actual = dataset.dict["00101000"].Value[0];

    expect(actual).not.toBe("ID1");
  });

  it("should anonymize multiple OtherPatientIDs to same number of IDs", async () => {
    const dataset = loadTestInstance();
    const numberOfIDs = 5; // Replace with the desired number of IDs
    const originalIDs: string[] = [];

    for (let i = 1; i < numberOfIDs; i++) {
      originalIDs.push(`ID${i}`);
    }
    populateTag(
      dataset,
      "OtherPatientIDs",
      originalIDs[0],
      originalIDs[1],
      originalIDs[2],
      originalIDs[3]
    );

    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);
    const actual = dataset.dict["00101000"].Value;

    for (let i = 0; i < originalIDs.length; i++) {
      expect(typeof actual[i]).toBe("string");
      expect(originalIDs[i]).not.toEqual(actual[i]);
    }
  });

  it("should anonymize issuer of patientID if not empty", async () => {
    const dataset = loadTestInstance();
    dataset.dict["00100021"].Value[0] = "NOTEMPTY";

    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);

    const actual = dataset.dict["00100021"].Value[0];

    expect(actual).toBe("DICOM_ANONYMIZER");
  });

  it("should not add issuer of patientID if empty", async () => {
    const dataset = loadTestInstance();
    dataset.dict["00100021"].Value[0] = "";

    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);

    const actual = dataset.dict["00100021"].Value[0];

    expect(actual).toBe("");
  });

  it("should anonymize female patient name", async () => {
    const dataset = loadTestInstance();

    populateTag(dataset, "PatientSex", "F");
    populateTag(dataset, "PatientName", "LAST^FIRST^MIDDLE");

    const originalName = dataset.dict["00100010"].Value[0].Alphabetic;
    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);
    const newName = dataset.dict["00100010"].Value[0].Alphabetic;
    const list = new lists();

    expect(newName).not.toBe(originalName);
    const firstName = newName.split("^")[1];
    const middleName = newName.split("^")[2];
    const lastName = newName.split("^")[0];
    expect(list.femaleFirstNames).toContain(firstName);
    expect(list.allFirstNames).toContain(middleName);
    expect(list.lastNames).toContain(lastName);
  });

  it("should anonymize male patient name", async () => {
    const dataset = loadTestInstance();

    populateTag(dataset, "PatientSex", "M");
    populateTag(dataset, "PatientName", "LAST^FIRST^MIDDLE");

    const originalName = dataset.dict["00100010"].Value[0].Alphabetic;
    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);
    const newName = dataset.dict["00100010"].Value[0].Alphabetic;
    const list = new lists();

    expect(newName).not.toBe(originalName);
    const firstName = newName.split("^")[1];
    const middleName = newName.split("^")[2];
    const lastName = newName.split("^")[0];
    expect(list.maleFirstNames).toContain(firstName);
    expect(list.allFirstNames).toContain(middleName);
    expect(list.lastNames).toContain(lastName);
  });

  it("should anonymize sex other patient name", async () => {
    const dataset = loadTestInstance();

    populateTag(dataset, "PatientSex", "O");
    populateTag(dataset, "PatientName", "LAST^FIRST^MIDDLE");

    const originalName = dataset.dict["00100010"].Value[0].Alphabetic;
    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);
    const newName = dataset.dict["00100010"].Value[0].Alphabetic;
    const list = new lists();

    expect(newName).not.toBe(originalName);
    const firstName = newName.split("^")[1];
    const middleName = newName.split("^")[2];
    const lastName = newName.split("^")[0];
    expect(list.allFirstNames).toContain(firstName);
    expect(list.allFirstNames).toContain(middleName);
    expect(list.lastNames).toContain(lastName);
  });

  it("should anonymize multiple PatientNames to same number of names", async () => {
    const dataset = loadTestInstance();
    const numberOfNames = 5; // Replace with the desired number of IDs
    const originalNames: string[] = [];

    for (let i = 1; i <= numberOfNames; i++) {
      originalNames.push(`NAME${i + 1}`);
    }
    populateTag(
      dataset,
      "PatientName",
      originalNames[0],
      originalNames[1],
      originalNames[2],
      originalNames[3],
      originalNames[4]
    );
    //dataset.dict["00100010"].Value = originalNames;
    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);
    const actual = dataset.dict["00100010"].Value;

    for (let i = 0; i < originalNames.length; i++) {
      expect(typeof actual[i].Alphabetic).toBe("string");
      expect(actual.length).toEqual(numberOfNames);
      expect(originalNames[i]).not.toEqual(actual[i].Alphabetic);
    }
  });

  it("should anonymize non patient names", async () => {
    const elementPaths: (string | number)[][] = [
      ["dict", "00080090"], // ReferringPhysicianName
      ["dict", "00081050"], // PerformingPhysicianName
      ["dict", "00081060"], //NameOfPhysiciansReadingStudy
      ["dict", "00081070"], //OperatorsName
      ["dict", "00101005"], //PatientBirthName
      ["dict", "00102297"], // ResponsiblePerson
      ["dict", "00321032"], // RequestingPhysician
    ];

    const dataset = loadTestInstance();
    const before: string[] = [];
    for (const elementPath of elementPaths) {
      const x = dataset[elementPath[0]][elementPath[1]].Value[0].Alphabetic;
      before.push(x);
    }

    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);

    const actual: string[] = [];
    for (const elementPath of elementPaths) {
      actual.push(dataset[elementPath[0]][elementPath[1]].Value[0].Alphabetic);
    }

    for (let i = 0; i < before.length; i++) {
      expect(before[i]).not.toEqual(actual[i]);
    }
  });

  it("should anonymize non patient names", async () => {
    const dataset = loadTestInstance();
    const originalAddress = dataset.dict["00101040"].Value[0]; //PatientAddress
    const originalRegion = dataset.dict["00102152"].Value[0]; //RegionOfResidence
    const originalCountry = dataset.dict["00102150"].Value[0]; //CountryOfResidence

    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);

    const newAddress = dataset.dict["00101040"].Value[0];
    const newRegion = dataset.dict["00102152"].Value[0];
    const newCountry = dataset.dict["00102150"].Value[0];

    expect(originalAddress).not.toEqual(newAddress);
    expect(originalRegion).not.toEqual(newRegion);
    expect(originalCountry).not.toEqual(newCountry);
  });

  it("should remove extra patient attributes", async () => {
    const elementPaths: string[] = [
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
    ];

    const dataset = loadTestInstance();

    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);

    for (const elementPath of elementPaths) {
      expect(Object.keys(dataset.dict)).not.toContain(elementPath);
    }
  });

  it("should anonymize non patient names", async () => {
    const dataset = loadTestInstance();
    const originalInstitutionName = dataset.dict["00080080"].Value[0]; //InstitutionName
    const originalInstitutionAddress = dataset.dict["00080081"].Value[0]; //InstitutionAddress
    const originalInstitutionalDepartmentName = dataset.dict["00081040"].Value[0]; //InstitutionalDepartmentName
    const originalStationName = dataset.dict["00081010"].Value[0]; //StationName

    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);

    const newInstitutionName = dataset.dict["00080080"].Value[0]; //InstitutionName
    const newInstitutionAddress = dataset.dict["00080081"].Value[0]; //InstitutionAddress
    const newInstitutionalDepartmentName = dataset.dict["00081040"].Value[0]; //InstitutionalDepartmentName
    const newStationName = dataset.dict["00081010"].Value[0]; //StationName

    expect(originalInstitutionName).not.toEqual(newInstitutionName);
    expect(originalInstitutionAddress).not.toEqual(newInstitutionAddress);
    expect(originalInstitutionalDepartmentName).not.toEqual(newInstitutionalDepartmentName);
    expect(originalStationName).not.toEqual(newStationName);
  });

  // test_station_gets_anonymized_when_no_modality???

  it("should anonymize requesiting service", async () => {
    const dataset = loadTestInstance();
    dataset.dict["00321033"].Value[0] = "ANY_SERVICE";
    const original = dataset.dict["00321033"].Value[0]; //RequestingService

    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);

    const actual = dataset.dict["00321033"].Value[0];

    expect(original).not.toBe(actual);
  });

  it("should anonymize current patient location", async () => {
    const dataset = loadTestInstance();
    dataset.dict["00380300"].Value[0] = "ANY_LOCATION";
    const original = dataset.dict["00380300"].Value[0]; //CurrentPatientLocation

    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);

    const actual = dataset.dict["00380300"].Value[0];

    expect(original).not.toBe(actual);
  });

  it("should anonymize date and times when both are present", async () => {
    const elementPaths: string[] = [
      "AcquisitionDate",
      "ContentDate",
      "InstanceCreationDate",
      "PatientBirthDate",
      "PerformedProcedureStepStartDate",
      "SeriesDate",
      "StudyDate",
    ];

    const originalDatetime = new Date(1974, 11, 3, 12, 15, 58);
    const originalDateString = originalDatetime.toISOString().slice(0, 10).replaceAll("-", "");
    const originalTimeString =
      originalDatetime.toISOString().slice(11, -1).replaceAll(":", "") + "000";

    const dataset = loadTestInstance();

    for (const elementPath of elementPaths) {
      populateTag(dataset, elementPath, originalDateString);
      populateTag(dataset, elementPath.slice(0, -4) + "Time", originalTimeString);
    }

    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);

    for (const elementPath of elementPaths) {
      const tagDictDate = data.DicomMetaDictionary.nameMap[elementPath];
      tagDictDate.tag = data.DicomMetaDictionary.unpunctuateTag(tagDictDate.tag);
      const newDateString = dataset.dict[tagDictDate.tag].Value[0];
      const tagDictTime = data.DicomMetaDictionary.nameMap[elementPath.slice(0, -4) + "Time"];
      tagDictTime.tag = data.DicomMetaDictionary.unpunctuateTag(tagDictTime.tag);
      const newTimeString = dataset.dict[tagDictTime.tag].Value[0];
      expect(newDateString).not.toBe(originalDateString);
      expect(newTimeString).not.toBe(originalTimeString);
    }
  });

  it("should anonymize date when there is no time", async () => {
    const dataset = loadTestInstance();
    const originalBirthDate = "19830213";
    populateTag(dataset, "PatientBirthDate", originalBirthDate);

    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);

    const newBirthDate = dataset.dict["00100030"].Value[0];

    expect(newBirthDate).not.toBe(originalBirthDate);
    expect(Object.keys(dataset.dict)).not.toContain("PatientBirthTime");
  });

  it("should anonymize date when there is time", async () => {
    const dataset = loadTestInstance();
    const originalBirthDate = "19830213";
    const originalBirthTime = "123456";
    populateTag(dataset, "PatientBirthDate", originalBirthDate);
    populateTag(dataset, "PatientBirthTime", originalBirthTime);

    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);

    const newDateString = dataset.dict["00100030"].Value[0];
    const newTimeString = dataset.dict["00100032"].Value[0];

    expect(newDateString).not.toEqual(originalBirthDate);
    expect(newDateString.length).toBe(originalBirthDate.length);
    expect(newTimeString.slice(2)).toEqual(originalBirthTime.slice(2));
    expect(newTimeString.length).toBe(originalBirthTime.length);
  });

  it("should anonymize date when time has various lengths", async () => {
    const elementPaths: string[] = [
      "",
      "07",
      "0911",
      "131517",
      "192123.1",
      "192123.12",
      "192123.123",
      "192123.1234",
      "192123.12345",
      "192123.123456",
    ];

    const dataset = loadTestInstance();
    const originalBirthDate = "19830213";

    for (const elementPath of elementPaths) {
      populateTag(dataset, "PatientBirthDate", originalBirthDate);
      populateTag(dataset, "PatientBirthTime", elementPath);
      const anonymizer = new Anonymizer();
      await anonymizer.anonymize(dataset);
      const newDateString = dataset.dict["00100030"].Value[0];
      const newTimeString = dataset.dict["00100032"].Value[0];

      expect(newDateString).not.toBe(originalBirthDate);
      expect(newDateString.length).toBe(originalBirthDate.length);
      expect(newTimeString.slice(2)).toBe(elementPath.slice(2));
      expect(newTimeString.length).toBe(elementPath.length);
    }
  });

  it("should anonymize multivalue date when there is no time", async () => {
    const dataset = loadTestInstance();
    const originalBirthDate = ["20010401", "20010402"];

    populateTag(dataset, "DateOfLastCalibration", "20010401", "20010402");

    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);

    const newDateString = dataset.dict["00181200"].Value;

    expect(newDateString).not.toBe(originalBirthDate);
    expect(newDateString.length).toBe(originalBirthDate.length);
  });

  it("should anonymize multivalue date with time pair", async () => {
    const dataset = loadTestInstance();
    const originalDate = ["20010401", "20010402"];
    const originalTime = ["120000", "135959"];

    populateTag(dataset, "DateOfLastCalibration", originalDate[0], originalDate[1]);
    populateTag(dataset, "TimeOfLastCalibration", originalTime[0], originalTime[1]);

    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);

    const newDateString = dataset.dict["00181200"].Value;
    const newTimeString = dataset.dict["00181201"].Value;

    expect(newDateString).not.toBe(originalDate);
    expect(newDateString.length).toBe(originalDate.length);
    expect(newTimeString).not.toBe(originalTime);
    expect(newTimeString.length).toBe(originalTime.length);
  });

  it("should anonymize multivalue date and time pair same with same seed", async () => {
    const dataset1 = loadTestInstance();
    const dataset2 = loadTestInstance();
    const originalDate = ["20010401", "20010402"];
    const originalTime = ["120000", "135959"];

    populateTag(dataset1, "DateOfLastCalibration", originalDate[0], originalDate[1]);
    populateTag(dataset1, "TimeOfLastCalibration", originalTime[0], originalTime[1]);

    populateTag(dataset2, "DateOfLastCalibration", originalDate[0], originalDate[1]);
    populateTag(dataset2, "TimeOfLastCalibration", originalTime[0], originalTime[1]);

    const anonymizer1 = new Anonymizer({ seed: "123" });
    anonymizer1.anonymize(dataset1);
    const anonymizer2 = new Anonymizer({ seed: "123" });
    anonymizer2.anonymize(dataset2);

    const newDate1 = dataset1.dict["00181200"].Value;
    const newTime1 = dataset1.dict["00181201"].Value;

    const newDate2 = dataset2.dict["00181200"].Value;
    const newTime2 = dataset2.dict["00181201"].Value;

    expect(newDate1).toEqual(newDate2);
    expect(newTime1).toEqual(newTime2);
  });

  it("should anonymize datetime", async () => {
    const elementPaths: string[] = [
      "AcquisitionDateTime",
      "FrameReferenceDateTime",
      "FrameAcquisitionDateTime",
      "StartAcquisitionDateTime",
      "EndAcquisitionDateTime",
      "PerformedProcedureStepStartDateTime",
      "PerformedProcedureStepEndDateTime",
    ];

    const dataset = loadTestInstance();

    const originalDatetime = new Date(1974, 11, 3, 12, 15, 58);
    const originalDatetimeString = originalDatetime.toISOString().replace(/[:TZ-]/g, "");

    for (const elementPath of elementPaths) {
      populateTag(dataset, elementPath, originalDatetimeString);
    }
    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);

    for (const elmentPath of elementPaths) {
      const tagDict = data.DicomMetaDictionary.nameMap[elmentPath];
      const tag = data.DicomMetaDictionary.unpunctuateTag(tagDict.tag);
      const newDatetime = dataset.dict[tag].Value[0];
      expect(newDatetime).not.toEqual(originalDatetimeString);
    }
  });

  it("should anonymize datetime with various lenghts", async () => {
    const elementPaths: string[] = [
      "1947",
      "194711",
      "19471103",
      "1947110307",
      "194711030911",
      "19471103131517",
      "19471103192123.1",
      "19471103192123.12",
      "19471103192123.123",
      "19471103192123.1234",
      "19471103192123.12345",
      "19471103192123.123456",
    ];

    const dataset = loadTestInstance();
    const anonymizer = new Anonymizer();

    for (const elementPath of elementPaths) {
      populateTag(dataset, "AcquisitionDateTime", elementPath);
      await anonymizer.anonymize(dataset);
      const newDatetime = dataset.dict["0008002A"].Value[0];
      expect(newDatetime).not.toEqual(elementPath);
      expect(newDatetime.length).toBe(elementPath.length);
    }
  });

  it("should anonymize mulitvalue datetime", async () => {
    const originalDatetime: string[] = ["19741103121558", "19721004161558"];

    const dataset = loadTestInstance();
    populateTag(dataset, "AcquisitionDateTime", "19741103121558", "19721004161558");

    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);

    const newDatetime = dataset.dict["0008002A"].Value;

    expect(newDatetime).not.toEqual(originalDatetime);
    expect(newDatetime.length).toBe(originalDatetime.length);
  });

  it("should anonymize PatientName also without sex", async () => {
    const dataset = loadTestInstance();
    delete dataset.dict["00100040"];
    const oldName = dataset.dict["00100010"].Value[0].Alphabetic;

    const anonymizer = new Anonymizer();
    await anonymizer.anonymize(dataset);

    const newName = dataset.dict["00100010"].Value[0].Alphabetic;

    expect(newName).not.toEqual(oldName);
  });
});
