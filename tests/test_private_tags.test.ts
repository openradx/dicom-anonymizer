import { data } from "dcmjs";
import { beforeEach, describe, expect, it } from "vitest";
import Anonymizer from "../src/anonymizer";
import { loadInstance } from "./data_for_tests";

describe("Private Tags Handling", () => {
  let dataset: data.DicomDict;

  beforeEach(() => {
    dataset = loadInstance();

    // Add private tags to the dataset
    // Private tag 00091001 (group 0009 is odd, so it's private)
    const privateTag1 = data.ValueRepresentation.addTagAccessors({ vr: "LO" });
    privateTag1.tag = "00091001";
    privateTag1.Value = ["PrivateValue1"];
    dataset.dict["00091001"] = privateTag1;

    // Private tag 00191002 (group 0019 is odd, so it's private)
    const privateTag2 = data.ValueRepresentation.addTagAccessors({ vr: "LO" });
    privateTag2.tag = "00191002";
    privateTag2.Value = ["PrivateValue2"];
    dataset.dict["00191002"] = privateTag2;
  });

  it("should keep private tags when anonymizePrivateTags is false", async () => {
    const anonymizer = new Anonymizer({ anonymizePrivateTags: false });

    await expect(anonymizer.anonymize(dataset)).resolves.not.toThrow();

    // Private tags should still exist
    expect(dataset.dict["00091001"]).toBeDefined();
    expect(dataset.dict["00191002"]).toBeDefined();

    // Private tags should have their original values
    expect(dataset.dict["00091001"].Value[0]).toBe("PrivateValue1");
    expect(dataset.dict["00191002"].Value[0]).toBe("PrivateValue2");
  });

  it("should remove private tags when anonymizePrivateTags is true", async () => {
    const anonymizer = new Anonymizer({ anonymizePrivateTags: true });

    await expect(anonymizer.anonymize(dataset)).resolves.not.toThrow();

    // Private tags should be removed
    expect(dataset.dict["00091001"]).toBeUndefined();
    expect(dataset.dict["00191002"]).toBeUndefined();
  });

  it("should not throw error when processing private tags with UI VR", async () => {
    // Add a private tag with UI value representation
    const privateUITag = data.ValueRepresentation.addTagAccessors({ vr: "UI" });
    privateUITag.tag = "00091010";
    privateUITag.Value = ["1.2.3.4.5.6.7.8.9"];
    dataset.dict["00091010"] = privateUITag;

    const anonymizer = new Anonymizer({ anonymizePrivateTags: false });

    // Should not throw error when UIAnonymizer encounters private tag
    await expect(anonymizer.anonymize(dataset)).resolves.not.toThrow();

    // Private UI tag should remain unchanged
    expect(dataset.dict["00091010"]).toBeDefined();
    expect(dataset.dict["00091010"].Value[0]).toBe("1.2.3.4.5.6.7.8.9");
  });

  it("should not throw error when processing private tags with DA VR", async () => {
    // Add a private tag with DA (Date) value representation
    const privateDateTag = data.ValueRepresentation.addTagAccessors({ vr: "DA" });
    privateDateTag.tag = "00091020";
    privateDateTag.Value = ["20200705"];
    dataset.dict["00091020"] = privateDateTag;

    const anonymizer = new Anonymizer({ anonymizePrivateTags: false });

    // Should not throw error when DateTimeAnonymizer encounters private tag
    await expect(anonymizer.anonymize(dataset)).resolves.not.toThrow();

    // Private date tag should remain unchanged
    expect(dataset.dict["00091020"]).toBeDefined();
    expect(dataset.dict["00091020"].Value[0]).toBe("20200705");
  });

  it("should not throw error when processing private tags with DT VR", async () => {
    // Add a private tag with DT (DateTime) value representation
    const privateDateTimeTag = data.ValueRepresentation.addTagAccessors({ vr: "DT" });
    privateDateTimeTag.tag = "00091030";
    privateDateTimeTag.Value = ["20200705182848.235000"];
    dataset.dict["00091030"] = privateDateTimeTag;

    const anonymizer = new Anonymizer({ anonymizePrivateTags: false });

    // Should not throw error when DateTimeAnonymizer encounters private tag
    await expect(anonymizer.anonymize(dataset)).resolves.not.toThrow();

    // Private datetime tag should remain unchanged
    expect(dataset.dict["00091030"]).toBeDefined();
    expect(dataset.dict["00091030"].Value[0]).toBe("20200705182848.235000");
  });

  it("should handle mixed private and standard tags correctly", async () => {
    const anonymizer = new Anonymizer({ anonymizePrivateTags: true });

    // Store original patient name to verify it gets anonymized
    const originalPatientName = dataset.dict["00100010"].Value[0].Alphabetic;

    await expect(anonymizer.anonymize(dataset)).resolves.not.toThrow();

    // Private tags should be removed
    expect(dataset.dict["00091001"]).toBeUndefined();
    expect(dataset.dict["00191002"]).toBeUndefined();

    // Standard tags should be anonymized
    const newPatientName = dataset.dict["00100010"].Value[0].Alphabetic;
    expect(newPatientName).not.toBe(originalPatientName);
  });

  it("should correctly identify private tags with odd group numbers", async () => {
    // Test various private tag group numbers (all odd)
    const privateTags = ["00091001", "00111001", "00191001", "00211001", "00BD1001"];

    for (const tagId of privateTags) {
      const privateTag = data.ValueRepresentation.addTagAccessors({ vr: "LO" });
      privateTag.tag = tagId;
      privateTag.Value = [`PrivateValue_${tagId}`];
      dataset.dict[tagId] = privateTag;
    }

    const anonymizer = new Anonymizer({ anonymizePrivateTags: true });
    await expect(anonymizer.anonymize(dataset)).resolves.not.toThrow();

    // All private tags should be removed
    for (const tagId of privateTags) {
      expect(dataset.dict[tagId]).toBeUndefined();
    }
  });

  it("should not treat standard tags as private (even group numbers)", async () => {
    // Standard tags have even group numbers
    const anonymizer = new Anonymizer({ anonymizePrivateTags: false });

    await expect(anonymizer.anonymize(dataset)).resolves.not.toThrow();

    // Standard tags should still exist (even if anonymized)
    expect(dataset.dict["00100010"]).toBeDefined(); // PatientName (group 0010 is even)
    expect(dataset.dict["00100020"]).toBeDefined(); // PatientID (group 0010 is even)
    expect(dataset.dict["00080050"]).toBeDefined(); // AccessionNumber (group 0008 is even)
  });
});
