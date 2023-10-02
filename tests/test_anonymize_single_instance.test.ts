import { data } from "dcmjs";
import { describe, expect, it } from "vitest";
// Import your data_for_tests module
import { Anonymizer } from "../src/anonymizer";
import { lists } from "../src/lists";
// Replace with your testing library imports
import { loadInstance, populateTag, loadTestInstance } from "./data_for_tests";

describe("patient", () => {
  it("should not alter nonidentifying UIs", () => {
    const elementPaths: (string | number)[][] = [
      ["meta", "00020002"], //"MediaStorageSOPClassUID"
      ["meta", "00020010"], // TransferSyntaxUID
      ["meta", "00020012"], // ImplementationClassUID
      ["dict", "00080016"], // SOPClassUID
      ["dict", "00082112", 0, "00081155"], // "SourceImageSequence[0].ReferencedSOPClassUID"
    ];

    const dataset = loadTestInstance();
    const expected: string[] = [];
    for (const elementPath of elementPaths) {
      if (elementPath.length == 2) {
        expected.push(dataset[elementPath[0]][elementPath[1]].Value[0]);
      } else {
        expected.push(
          dataset[elementPath[0]][elementPath[1]].Value[0][elementPath[2]][elementPath[3]].Value[0]
        );
      }
    }

    const anonymizer = new Anonymizer();
    anonymizer.anonymize(dataset);

    const actual: string[] = [];
    for (const elementPath of elementPaths) {
      if (elementPath.length == 2) {
        actual.push(dataset[elementPath[0]][elementPath[1]].Value[0]);
      } else {
        actual.push(
          dataset[elementPath[0]][elementPath[1]].Value[0][elementPath[2]][elementPath[3]].Value[0]
        );
      }
    }

    for (let i = 0; i < expected.length; i++) {
      expect(expected[i]).toEqual(actual[i]);
    }
  });

  it("should anonymize identifying UIs", () => {
    const elementPaths: (string | number)[][] = [
      ["dict", "00080018"], //SOPInstanceUID
      ["meta", "00020003"], //MediaStorageSOPInstanceUID
      ["dict", "00082112", 0, "00081150"], // "SourceImageSequence[0].ReferencedSOPInstanceUID"
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
          dataset[elementPath[0]][elementPath[1]].Value[0][elementPath[2]][elementPath[3]].Value[0]
        );
      }
    }

    const anonymizer = new Anonymizer();
    anonymizer.anonymize(dataset);

    const actual: string[] = [];
    for (const elementPath of elementPaths) {
      if (elementPath.length == 2) {
        actual.push(dataset[elementPath[0]][elementPath[1]].Value[0]);
      } else {
        actual.push(
          dataset[elementPath[0]][elementPath[1]].Value[0][elementPath[2]][elementPath[3]].Value[0]
        );
      }
    }

    for (let i = 0; i < before.length; i++) {
      expect(before[i]).not.toEqual(actual[i]);
    }
  });

  //test_repeated_identifying_uis_get_same_values???

  it("should anonymize IDs", () => {
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
          dataset[elementPath[0]][elementPath[1]].Value[0][elementPath[2]][elementPath[3]].Value[0]
        );
      }
    }

    const anonymizer = new Anonymizer();
    anonymizer.anonymize(dataset);

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

  it("should anonymize single OtherPatientIDs to single ID", () => {
    const dataset = loadTestInstance();
    dataset.dict["00101000"].Value = ["ID1"];
    const anonymizer = new Anonymizer();
    anonymizer.anonymize(dataset);
    const actual = dataset.dict["00101000"].Value[0];

    expect(actual).not.toBe("ID1");
  });

  it("should anonymize multiple OtherPatientIDs to same number of IDs", () => {
    const dataset = loadTestInstance();
    const number_of_ids = 5; // Replace with the desired number of IDs
    const original_IDs: string[] = [];

    for (let i = 1; i <= number_of_ids; i++) {
      original_IDs.push(`ID${i}`);
    }

    dataset.dict["00101000"].Value = original_IDs;
    const anonymizer = new Anonymizer();
    anonymizer.anonymize(dataset);
    const actual = dataset.dict["00101000"].Value;

    for (let i = 0; i < original_IDs.length; i++) {
      expect(typeof actual[i]).toBe("string");
      expect(original_IDs[i]).not.toEqual(actual[i]);
    }
  });

  it("should anonymize issuer of patientID if not empty", () => {
    const dataset = loadTestInstance();
    dataset.dict["00100021"].Value[0] = "NOTEMPTY";

    const anonymizer = new Anonymizer();
    anonymizer.anonymize(dataset);

    const actual = dataset.dict["00100021"].Value[0];

    expect(actual).toBe("WieAuchImmerDiesesToolHeisenWird");
  });

  it("should anonymize issuer of patientID if not empty", () => {
    const dataset = loadTestInstance();
    dataset.dict["00100021"].Value[0] = "NOTEMPTY";

    const anonymizer = new Anonymizer();
    anonymizer.anonymize(dataset);

    const actual = dataset.dict["00100021"].Value[0];

    expect(actual).toBe("WieAuchImmerDiesesToolHeisenWird");
  });

  it("should anonymize female patient name", () => {
    const dataset = loadTestInstance();

    populateTag(dataset, "PatientSex", "F");
    populateTag(dataset, "PatientName", "LAST^FIRST^MIDDLE");

    const original_name = dataset.dict["00100010"].Value[0];
    const anonymizer = new Anonymizer();
    anonymizer.anonymize(dataset);
    const new_name = dataset.dict["00100010"].Value[0];
    const list = new lists();

    expect(new_name).not.toBe(original_name);
    const firstName = new_name.split("^")[1];
    const middleName = new_name.split("^")[2];
    const lastName = new_name.split("^")[0];
    expect(list.female_first_names).toContain(firstName);
    expect(list.all_first_names).toContain(middleName);
    expect(list.last_names).toContain(lastName);
  });

  it("should anonymize male patient name", () => {
    const dataset = loadTestInstance();

    populateTag(dataset, "PatientSex", "M");
    populateTag(dataset, "PatientName", "LAST^FIRST^MIDDLE");

    const original_name = dataset.dict["00100010"].Value[0];
    const anonymizer = new Anonymizer();
    anonymizer.anonymize(dataset);
    const new_name = dataset.dict["00100010"].Value[0];
    const list = new lists();

    expect(new_name).not.toBe(original_name);
    const firstName = new_name.split("^")[1];
    const middleName = new_name.split("^")[2];
    const lastName = new_name.split("^")[0];
    expect(list.male_first_names).toContain(firstName);
    expect(list.all_first_names).toContain(middleName);
    expect(list.last_names).toContain(lastName);
  });

  it("should anonymize sex other patient name", () => {
    const dataset = loadTestInstance();

    populateTag(dataset, "PatientSex", "O");
    populateTag(dataset, "PatientName", "LAST^FIRST^MIDDLE");

    const original_name = dataset.dict["00100010"].Value[0];
    const anonymizer = new Anonymizer();
    anonymizer.anonymize(dataset);
    const new_name = dataset.dict["00100010"].Value[0];
    const list = new lists();

    expect(new_name).not.toBe(original_name);
    const firstName = new_name.split("^")[1];
    const middleName = new_name.split("^")[2];
    const lastName = new_name.split("^")[0];
    expect(list.all_first_names).toContain(firstName);
    expect(list.all_first_names).toContain(middleName);
    expect(list.last_names).toContain(lastName);
  });

  it("should anonymize multiple PatientNames to same number of names", () => {
    const dataset = loadTestInstance();
    const number_of_names = 5; // Replace with the desired number of IDs
    const original_names: string[] = [];

    for (let i = 1; i <= number_of_names; i++) {
      original_names.push(`NAME${i + 1}`);
    }

    dataset.dict["00100010"].Value = original_names;
    const anonymizer = new Anonymizer();
    anonymizer.anonymize(dataset);
    const actual = dataset.dict["00100010"].Value;

    for (let i = 0; i < original_names.length; i++) {
      expect(typeof actual[i]).toBe("string");
      expect(actual.length).toEqual(number_of_names);
      expect(original_names[i]).not.toEqual(actual[i]);
    }
  });

  it("should anonymize non patient names", () => {
    const elementPaths: (string | number)[][] = [
      ["dict", "00081060"], //NameOfPhysiciansReadingStudy
      ["dict", "00081070"], //OperatorsName
      ["dict", "00101005"], //PatientBirthName

      ["dict", "00081050"], // PerformingPhysicianName
      ["dict", "00080090"], // ReferringPhysicianName
      ["dict", "00321032"], // RequestingPhysician
      ["dict", "00102297"], // ResponsiblePerson
    ];

    const dataset = loadTestInstance();
    const before: string[] = [];
    for (const elementPath of elementPaths) {
      before.push(dataset[elementPath[0]][elementPath[1]].Value[0]);
    }

    const anonymizer = new Anonymizer();
    anonymizer.anonymize(dataset);

    const actual: string[] = [];
    for (const elementPath of elementPaths) {
      actual.push(dataset[elementPath[0]][elementPath[1]].Value[0]);
    }

    for (let i = 0; i < before.length; i++) {
      expect(before[i]).not.toEqual(actual[i]);
    }
  });

  it("should anonymize non patient names", () => {
    const dataset = loadTestInstance();
    const original_address = dataset.dict["00101040"].Value[0]; //PatientAddress
    const original_region = dataset.dict["00102152"].Value[0]; //RegionOfResidence
    const original_country = dataset.dict["00102150"].Value[0]; //CountryOfResidence

    const anonymizer = new Anonymizer();
    anonymizer.anonymize(dataset);

    const new_address = dataset.dict["00101040"].Value[0];
    const new_region = dataset.dict["00102152"].Value[0];
    const new_country = dataset.dict["00102150"].Value[0];

    expect(original_address).not.toEqual(new_address);
    expect(original_region).not.toEqual(new_region);
    expect(original_country).not.toEqual(new_country);
  });

  it("should remove extra patient attributes", () => {
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
    anonymizer.anonymize(dataset);

    for (const elementPath of elementPaths) {
      expect(Object.keys(dataset.dict)).not.toContain(elementPath);
    }
  });

  it("should anonymize non patient names", () => {
    const dataset = loadTestInstance();
    const original_institution_name = dataset.dict["00080080"].Value[0]; //InstitutionName
    const original_institution_address = dataset.dict["00080081"].Value[0]; //InstitutionAddress
    const original_institutional_department_name = dataset.dict["00081040"].Value[0]; //InstitutionalDepartmentName
    const original_station_name = dataset.dict["00081010"].Value[0]; //StationName

    const anonymizer = new Anonymizer();
    anonymizer.anonymize(dataset);

    const new_institution_name = dataset.dict["00080080"].Value[0]; //InstitutionName
    const new_institution_address = dataset.dict["00080081"].Value[0]; //InstitutionAddress
    const new_institutional_department_name = dataset.dict["00081040"].Value[0]; //InstitutionalDepartmentName
    const new_station_name = dataset.dict["00081010"].Value[0]; //StationName

    expect(original_institution_name).not.toEqual(new_institution_name);
    expect(original_institution_address).not.toEqual(new_institution_address);
    expect(original_institutional_department_name).not.toEqual(new_institutional_department_name);
    expect(original_station_name).not.toEqual(new_station_name);
  });

  // test_station_gets_anonymized_when_no_modality???

  it("should anonymize requesiting service", () => {
    const dataset = loadTestInstance();
    dataset.dict["00321033"].Value[0] = "ANY_SERVICE";
    const original = dataset.dict["00321033"].Value[0]; //RequestingService

    const anonymizer = new Anonymizer();
    anonymizer.anonymize(dataset);

    const actual = dataset.dict["00321033"].Value[0];

    expect(original).not.toBe(actual);
  });

  it("should anonymize current patient location", () => {
    const dataset = loadTestInstance();
    dataset.dict["00380300"].Value[0] = "ANY_LOCATION";
    const original = dataset.dict["00380300"].Value[0]; //CurrentPatientLocation

    const anonymizer = new Anonymizer();
    anonymizer.anonymize(dataset);

    const actual = dataset.dict["00380300"].Value[0];

    expect(original).not.toBe(actual);
  });

  it("should anonymize date and times when both are present", () => {
    const elementPaths: string[] = [
      "AcquisitionDate",
      "ContentDate",
      "InstanceCreationDate",
      "PatientBirthDate",
      "PerformedProcedureStepStartDate",
      "SeriesDate",
      "StudyDate",
    ];

    const original_datetime = new Date(1974, 11, 3, 12, 15, 58);
    const original_date_string = original_datetime.toISOString().slice(0, 10).replaceAll("-", "");
    const original_time_string =
      original_datetime.toISOString().slice(11, -1).replaceAll(":", "") + "000";

    const dataset = loadTestInstance();

    for (const elementPath of elementPaths) {
      populateTag(dataset, elementPath, original_date_string);
      populateTag(dataset, elementPath.slice(0, -4) + "Time", original_time_string);
    }

    const anonymizer = new Anonymizer();
    anonymizer.anonymize(dataset);

    for (const elementPath of elementPaths) {
      const tagDictDate = data.DicomMetaDictionary.nameMap[elementPath];
      tagDictDate.tag = data.DicomMetaDictionary.unpunctuateTag(tagDictDate.tag);
      const new_date_string = dataset.dict[tagDictDate.tag].Value[0];
      const tagDictTime = data.DicomMetaDictionary.nameMap[elementPath.slice(0, -4) + "Time"];
      tagDictTime.tag = data.DicomMetaDictionary.unpunctuateTag(tagDictTime.tag);
      const new_time_string = dataset.dict[tagDictTime.tag].Value[0];
      expect(new_date_string).not.toBe(original_date_string);
      expect(new_time_string).not.toBe(original_time_string);
    }
  });
});
