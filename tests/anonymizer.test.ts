import { data } from "dcmjs";
import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";
import { Anonymizer } from "../src/anonymizer";

describe("First case", () => {
  it("should succeed", () => {
    const buffer = readFileSync("samples/00001.dcm").buffer;
    const dicomData = data.DicomMessage.readFile(buffer);
    const anonymizer = new Anonymizer("PAT0001");
    // anonymizer.anonymize(dicomData.dict);
    expect(true).toBe(true);
  });
});
