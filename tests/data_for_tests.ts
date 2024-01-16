import { data } from "dcmjs";
import * as fs from "fs";

export function loadInstance(
  patientNumber = 1,
  studyNumber = 1,
  seriesNumber = 1,
  instanceNumber = 1
): data.DicomDict {
  const dataset = loadMinimalInstance();
  setPatientAttributes(dataset, patientNumber);
  setStudyAttributes(dataset, patientNumber, studyNumber);
  setSeriesAttributes(dataset, patientNumber, studyNumber, seriesNumber);
  setInstanceAttributes(dataset, patientNumber, studyNumber, seriesNumber, instanceNumber);
  return dataset;
}

export function loadMinimalInstance(): data.DicomDict {
  const filePathDicom = "./samples";
  const files: string[] = fs.readdirSync(filePathDicom);
  const fileBuffer = fs.readFileSync(filePathDicom + "/" + files[10]).buffer;
  return data.DicomMessage.readFile(fileBuffer);
}

export function loadTestInstance(): data.DicomDict {
  const dataset = loadMinimalInstance();
  const sourceImageDataset = new data.DicomDict({});
  populateTag(sourceImageDataset, "ReferencedSOPClassUID", "1.2.3.0.1");
  populateTag(sourceImageDataset, "ReferencedSOPInstanceUID", "1.2.3.1.1");
  populateTag(dataset, "SourceImageSequence", sourceImageDataset.dict);

  populateTag(dataset, "OperatorsName", "OPERATOR^FIRST^MIDDLE");
  populateTag(dataset, "NameOfPhysiciansReadingStudy", "READING^FIRST^MIDDLE");
  populateTag(dataset, "PerformingPhysicianName", "PERFORMING^FIRST^MIDDLE");
  populateTag(dataset, "ReferringPhysicianName", "REFERRING^FIRST^MIDDLE");
  populateTag(dataset, "RequestingPhysician", "REQUESTING^FIRST^MIDDLE");
  populateTag(dataset, "ResponsiblePerson", "RESPONSIBLE^FIRST^MIDDLE");
  populateTag(dataset, "PatientBirthName", "PBN");
  populateTag(dataset, "PatientMotherBirthName", "PMBN");

  populateTag(dataset, "PatientAddress", "10 REAL STREET");
  populateTag(dataset, "RegionOfResidence", "BROAD COVE");
  populateTag(dataset, "CountryOfResidence", "GERMANY");

  populateTag(dataset, "IssuerOfPatientID", "ISSUEROFPATIENTID");
  populateTag(dataset, "OtherPatientIDs", "OTHERPATIENTID");
  populateTag(dataset, "PerformedProcedureStepID", "PERFORMEDID");
  populateTag(dataset, "ScheduledProcedureStepID", "SCHEDULEDID");

  populateTag(dataset, "FillerOrderNumberImagingServiceRequest", "");
  populateTag(dataset, "PlacerOrderNumberImagingServiceRequest", "");

  populateTag(dataset, "Occupation", "VIGILANTE");
  const codeDataset = new data.DicomDict({});
  populateTag(codeDataset, "CodeValue", "VALUE");
  populateTag(codeDataset, "CodingSchemeDesignator", "DESIGNATOR");
  populateTag(codeDataset, "CodeMeaning", "MEANING");
  populateTag(dataset, "PatientInsurancePlanCodeSequence", codeDataset.dict);
  populateTag(dataset, "MilitaryRank", "YEOMAN");
  populateTag(dataset, "BranchOfService", "COAST GUARD");
  populateTag(dataset, "PatientTelephoneNumbers", "123-456-7890");
  populateTag(dataset, "PatientTelecomInformation", "123-456-7890");
  populateTag(dataset, "PatientReligiousPreference", "PRIVATE");
  populateTag(dataset, "MedicalRecordLocator", "FILING CABINET 1");

  const referencedSOPItem = new data.DicomDict({});
  populateTag(referencedSOPItem, "ReferencedSOPClassUID", "2.3.4.5.6.7");
  populateTag(referencedSOPItem, "ReferencedSOPInstanceUID", "2.3.4.5.6.7.1.2.3");
  const item = new data.DicomDict({});
  populateTag(item, "TypeOfInstances", "DICOM");
  populateTag(item, "StudyInstanceUID", "1.2.3.4.5.6");
  populateTag(item, "SeriesInstanceUID", "1.2.3.4.5.6.1");
  populateTag(item, "ReferencedSOPSequence", referencedSOPItem.dict);
  populateTag(dataset, "ReferencedPatientPhotoSequence", item.dict);

  populateTag(dataset, "ResponsibleOrganization", "RESPONSIBLE ORGANIZATION");

  const otherPatientIDItem0 = new data.DicomDict({});
  populateTag(otherPatientIDItem0, "PatientID", "opi-0-ID");
  populateTag(otherPatientIDItem0, "IssuerOfPatientID", "ISSUER");
  const otherPatientIDItem1 = new data.DicomDict({});
  populateTag(otherPatientIDItem1, "PatientID", "opi-1-ID");
  populateTag(otherPatientIDItem1, "IssuerOfPatientID", "ISSUER");
  populateTag(
    dataset,
    "OtherPatientIDsSequence",
    otherPatientIDItem0.dict,
    otherPatientIDItem1.dict
  );

  const request_attributeItem = new data.DicomDict({});
  populateTag(request_attributeItem, "RequestedProcedureID", "rai-0-REQID");
  populateTag(request_attributeItem, "ScheduledProcedureStepID", "rai-0-SCHEDID");
  populateTag(dataset, "RequestAttributesSequence", request_attributeItem.dict);

  populateTag(dataset, "InstitutionName", "INSTITUTIONNAME");
  populateTag(dataset, "InstitutionAddress", "INSTITUTIONADDRESS");
  populateTag(dataset, "InstitutionalDepartmentName", "INSTITUTIONALDEPARTMENTNAME");
  populateTag(dataset, "StationName", "STATIONNAME");

  populateTag(dataset, "RequestingService", "REQESTINGSERVICE");
  populateTag(dataset, "CurrentPatientLocation", "PATIENTLOCATION");

  return dataset;
}

function setPatientAttributes(dataset: data.DicomDict, patientNumber: number): void {
  populateTag(dataset, "PatientAddress", `${123 + patientNumber} Fake Street`);
  populateTag(dataset, "PatientBirthDate", `${19830213 + patientNumber}`);
  populateTag(dataset, "PatientBirthTime", `13140${patientNumber}`);
  populateTag(dataset, "PatientID", `4MR${patientNumber}`);
  populateTag(dataset, "PatientName", `CompressedSamples^MR${patientNumber}`);
  populateTag(dataset, "OtherPatientIDs", `OTH${dataset.dict["00100020"].Value[0]}`); //PatientID
  const otherPatientIDItem = new data.DicomDict({});
  populateTag(otherPatientIDItem, "PatientID", `OTHSEQ${dataset.dict["00100020"].Value[0]}`); //PatientID
  populateTag(dataset, "OtherPatientIDsSequence", otherPatientIDItem.dict);

  populateTag(dataset, "OtherPatientNames", `Other${dataset.dict["00100010"].Value[0]}`); //PatientName
  populateTag(dataset, "PatientBirthName", `Birth${dataset.dict["00100010"].Value[0]}`); //PatientName
  populateTag(dataset, "PatientMotherBirthName", `Mother${dataset.dict["00100010"].Value[0]}`); //PatientName
  populateTag(dataset, "ResponsiblePerson", `Responsible${dataset.dict["00100010"].Value[0]}`); //PatientName
}

function setStudyAttributes(
  dataset: data.DicomDict,
  patientNumber: number,
  studyNumber: number
): void {
  populateTag(dataset, "StudyID", `FOR4MR${patientNumber}.${studyNumber}`);
  populateTag(dataset, "AccessionNumber", `ACC${dataset.dict["00200010"].Value[0]}`); //StudyID
  populateTag(
    dataset,
    "StudyDate",
    new Date(2004, patientNumber, studyNumber).toISOString().substring(0, 10).replace(/-/g, "")
  );
  populateTag(dataset, "StudyTime", `0${patientNumber * 5 + studyNumber}0000`);
  populateTag(
    dataset,
    "StudyInstanceUID",
    `1.3.6.1.4.1.5962.20040827145012.5458.${patientNumber}.${studyNumber}`
  );
  populateTag(
    dataset,
    "NameOfPhysiciansReadingStudy",
    `READING^FIRST^${dataset.dict["00200010"].Value[0]}`
  ); //StudyID
  populateTag(
    dataset,
    "RequestingPhysician",
    `REQUESTING1^FIRST^${dataset.dict["00200010"].Value[0]}`
  ); //StudyID
  populateTag(
    dataset,
    "ReferringPhysicianName",
    `REFERRING1^FIRST^${dataset.dict["00200010"].Value[0]}`
  ); //StudyID
}

function setSeriesAttributes(
  dataset: data.DicomDict,
  patientNumber: number,
  studyNumber: number,
  seriesNumber: number
): void {
  const seriesSuffix = `${patientNumber}-${studyNumber}-${seriesNumber}`;
  populateTag(dataset, "SeriesInstanceUID", `${dataset.dict["0020000D"].Value[0]}.${seriesNumber}`); //StudyInstanceUID
  populateTag(
    dataset,
    "FrameOfReferenceUID",
    `${dataset.dict["0020000E"].Value[0]}.0.${seriesNumber}`
  ); //SeriesInstanceUID
  populateTag(dataset, "PerformedProcedureStepID", `PERFSTEP${seriesSuffix}`);
  populateTag(dataset, "RequestedProcedureID", `REQSTEP${seriesSuffix}`);
  populateTag(dataset, "ScheduledProcedureStepID", `SCHEDSTEP${seriesSuffix}`);

  populateTag(dataset, "SeriesDate", dataset.dict["00080020"].Value[0]); //StudyDate
  populateTag(dataset, "SeriesTime", `${patientNumber}${studyNumber}${seriesNumber}0000`);
  populateTag(dataset, "StationName", `STATIONNAME${patientNumber}.${studyNumber}.${seriesNumber}`);
  populateTag(dataset, "OperatorsName", `OPERATOR^FIRST^${seriesSuffix}`);
  populateTag(dataset, "PerformingPhysicianName", `PERFORMING1^FIRST^${seriesSuffix}`);

  const requestAttributeItem = new data.DicomDict({});
  populateTag(requestAttributeItem, "RequestedProcedureID", `REQSTEP${seriesSuffix}`);
  populateTag(requestAttributeItem, "ScheduledProcedureStepID", `SCHEDSTEP${seriesSuffix}`);
  populateTag(dataset, "RequestAttributesSequence", requestAttributeItem.dict);

  populateTag(dataset, "InstitutionName", `INSTITUTIONNAME${seriesSuffix}`);
  populateTag(dataset, "InstitutionAddress", `INSTITUTIONADDRESS${seriesSuffix}`);
  populateTag(dataset, "InstitutionalDepartmentName", `INSTITUTIONALDEPARTMENTNAME${seriesSuffix}`);
  populateTag(dataset, "StationName", `STATIONNAME${seriesSuffix}`);
}

function setInstanceAttributes(
  dataset: data.DicomDict,
  patientNumber: number,
  studyNumber: number,
  seriesNumber: number,
  instanceNumber: number
): void {
  populateTag(dataset, "SOPInstanceUID", `${dataset.dict["0020000E"].Value[0]}.${instanceNumber}`); //SeriesInstanceUID
  populateMetaTag(dataset, "MediaStorageSOPInstanceUID", dataset.dict["00080018"].Value[0]); //SOPInstanceUID
  populateTag(dataset, "InstanceCreationDate", dataset.dict["00080021"].Value[0]); //SeriesDate
  const creationTime = new Date();
  creationTime.setHours(patientNumber, studyNumber, 7 * seriesNumber + instanceNumber);
  populateTag(
    dataset,
    "InstanceCreationTime",
    creationTime.toTimeString().slice(0, 8).replace(/:/g, "")
  );
}

export function populateTag(
  dataset: data.DicomDict,
  tagName: string,
  ...values: string[] | object[]
): void {
  const tagDict = data.DicomMetaDictionary.nameMap[tagName];
  tagDict.tag = data.DicomMetaDictionary.unpunctuateTag(tagDict.tag);
  dataset.upsertTag(tagDict.tag, tagDict.vr, values);
}

function populateMetaTag(
  dataset: data.DicomDict,
  tagName: string,
  ...values: string[] | object[]
): void {
  const tagDict = data.DicomMetaDictionary.nameMap[tagName];
  tagDict.tag = data.DicomMetaDictionary.unpunctuateTag(tagDict.tag);

  if (dataset.meta[tagDict.tag]) {
    dataset.meta[tagDict.tag].Value = values;
  } else {
    dataset.meta[tagDict.tag] = { vr: tagDict.vr, Value: values };
  }
}

// // Usage example
// const instance = loadInstance(1, 1, 1, 1);
// console.log(instance);
