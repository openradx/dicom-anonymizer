import { data } from "dcmjs";
import * as fs from "fs";

function loadInstance(
  patientNumber = 1,
  studyNumber = 1,
  seriesNumber = 1,
  instanceNumber = 1
): data.DicomDict {
  const dataset = loadMinimalInstance();
  _setPatientAttributes(dataset, patientNumber);
  _setStudyAttributes(dataset, patientNumber, studyNumber);
  _setSeriesAttributes(dataset, patientNumber, studyNumber, seriesNumber);
  _setInstanceAttributes(dataset, patientNumber, studyNumber, seriesNumber, instanceNumber);
  return dataset;
}

function loadMinimalInstance(): data.DicomDict {
  const filePath_dicom = "./samples";
  const files: string[] = fs.readdirSync(filePath_dicom);
  const fileBuffer = fs.readFileSync(filePath_dicom + "/" + files[0]).buffer;
  return data.DicomMessage.readFile(fileBuffer);
}

function loadTestInstance(): data.DicomDict {
  const dataset = loadMinimalInstance();
  const sourceImageDataset = new data.DicomDict({});
  populateTag(sourceImageDataset, "ReferencedSOPClassUID", "1.2.3.0.1");
  populateTag(sourceImageDataset, "ReferencedSOPInstanceUID", "1.2.3.1.1");
  populateTag(dataset, "SourceImageSequence", [sourceImageDataset.dict]);

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

  const referenced_sop_item = new data.DicomDict({});
  populateTag(referenced_sop_item, "ReferencedSOPClassUID", "2.3.4.5.6.7");
  populateTag(referenced_sop_item, "ReferencedSOPInstanceUID", "2.3.4.5.6.7.1.2.3");
  const item = new data.DicomDict({});
  populateTag(item, "TypeOfInstances", "DICOM");
  populateTag(item, "StudyInstanceUID", "1.2.3.4.5.6");
  populateTag(item, "SeriesInstanceUID", "1.2.3.4.5.6.1");
  populateTag(item, "ReferencedSOPSequence", referenced_sop_item.dict);
  populateTag(dataset, "ReferencedPatientPhotoSequence", item.dict);

  populateTag(dataset, "ResponsibleOrganization", "RESPONSIBLE ORGANIZATION");

  const other_patient_id_item0 = new data.DicomDict({});
  populateTag(other_patient_id_item0, "PatientID", "opi-0-ID");
  populateTag(other_patient_id_item0, "IssuerOfPatientID", "ISSUER");
  const other_patient_id_item1 = new data.DicomDict({});
  populateTag(other_patient_id_item1, "PatientID", "opi-1-ID");
  populateTag(other_patient_id_item1, "IssuerOfPatientID", "ISSUER");
  populateTag(dataset, "OtherPatientIDsSequence", [
    other_patient_id_item0.dict,
    other_patient_id_item1.dict,
  ]);

  const request_attribute_item = new data.DicomDict({});
  populateTag(request_attribute_item, "RequestedProcedureID", "rai-0-REQID");
  populateTag(request_attribute_item, "ScheduledProcedureStepID", "rai-0-SCHEDID");
  populateTag(dataset, "RequestAttributesSequence", request_attribute_item.dict);

  populateTag(dataset, "InstitutionName", "INSTITUTIONNAME");
  populateTag(dataset, "InstitutionAddress", "INSTITUTIONADDRESS");
  populateTag(dataset, "InstitutionalDepartmentName", "INSTITUTIONALDEPARTMENTNAME");
  populateTag(dataset, "StationName", "STATIONNAME");

  populateTag(dataset, "RequestingService", "REQESTINGSERVICE");
  populateTag(dataset, "CurrentPatientLocation", "PATIENTLOCATION");

  return dataset;
}

function _setPatientAttributes(dataset: data.DicomDict, patientNumber: number): void {
  populateTag(dataset, "PatientAddress", `${123 + patientNumber} Fake Street`);
  populateTag(dataset, "PatientBirthDate", `${19830213 + patientNumber}`);
  populateTag(dataset, "PatientBirthTime", `13140${patientNumber}`);
  populateTag(dataset, "PatientID", `4MR${patientNumber}`);
  populateTag(dataset, "PatientName", `CompressedSamples^MR${patientNumber}`);
  populateTag(dataset, "OtherPatientIDs", `OTH${dataset.dict["00100020"]}`); //PatientID
  const other_patient_id_item = new data.DicomDict({});
  populateTag(other_patient_id_item, "PatientID", `OTHSEQ${dataset.dict["00100020"]}`); //PatientID
  populateTag(dataset, "OtherPatientIDsSequence", other_patient_id_item);

  populateTag(dataset, "OtherPatientNames", `Other${dataset.dict["00100010"]}`); //PatientName
  populateTag(dataset, "PatientBirthName", `Birth${dataset.dict["00100010"]}`); //PatientName
  populateTag(dataset, "PatientMotherBirthName", `Mother${dataset.dict["00100010"]}`); //PatientName
  populateTag(dataset, "ResponsiblePerson", `Responsible${dataset.dict["00100010"]}`); //PatientName
}

function _setStudyAttributes(
  dataset: data.DicomDict,
  patientNumber: number,
  studyNumber: number
): void {
  populateTag(dataset, "StudyID", `FOR4MR${patientNumber}.${studyNumber}`);
  populateTag(dataset, "AccessionNumber", `ACC${dataset.dict["00200010"]}`); //StudyID
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
  populateTag(dataset, "NameOfPhysiciansReadingStudy", `READING^FIRST^${dataset.dict["00200010"]}`); //StudyID
  populateTag(dataset, "RequestingPhysician", `REQUESTING1^FIRST^${dataset.dict["00200010"]}`); //StudyID
  populateTag(dataset, "ReferringPhysicianName", `REFERRING1^FIRST^${dataset.dict["00200010"]}`); //StudyID
}

function _setSeriesAttributes(
  dataset: data.DicomDict,
  patientNumber: number,
  studyNumber: number,
  seriesNumber: number
): void {
  const seriesSuffix = `${patientNumber}-${studyNumber}-${seriesNumber}`;
  populateTag(dataset, "SeriesInstanceUID", `${dataset.dict["0020000D"]}.${seriesNumber}`); //StudyInstanceUID
  populateTag(dataset, "FrameOfReferenceUID", `${dataset.dict["0020000E"]}.0.${seriesNumber}`); //SeriesInstanceUID
  populateTag(dataset, "PerformedProcedureStepID", `PERFSTEP${seriesSuffix}`);
  populateTag(dataset, "RequestedProcedureID", `REQSTEP${seriesSuffix}`);
  populateTag(dataset, "ScheduledProcedureStepID", `SCHEDSTEP${seriesSuffix}`);

  populateTag(dataset, "SeriesDate", dataset.dict["0008,0020"]); //StudyDate
  populateTag(dataset, "SeriesTime", `${patientNumber}${studyNumber}${seriesNumber}0000`);
  populateTag(dataset, "StationName", `STATIONNAME${patientNumber}.${studyNumber}.${seriesNumber}`);
  populateTag(dataset, "OperatorsName", `OPERATOR^FIRST^${seriesSuffix}`);
  populateTag(dataset, "PerformingPhysicianName", `PERFORMING1^FIRST^${seriesSuffix}`);

  const requestAttributeItem = new data.DicomDict({});
  populateTag(requestAttributeItem, "RequestedProcedureID", `REQSTEP${seriesSuffix}`);
  populateTag(requestAttributeItem, "ScheduledProcedureStepID", `SCHEDSTEP${seriesSuffix}`);
  populateTag(dataset, "RequestAttributesSequence", requestAttributeItem);

  populateTag(dataset, "InstitutionName", `INSTITUTIONNAME${seriesSuffix}`);
  populateTag(dataset, "InstitutionAddress", `INSTITUTIONADDRESS${seriesSuffix}`);
  populateTag(dataset, "InstitutionalDepartmentName", `INSTITUTIONALDEPARTMENTNAME${seriesSuffix}`);
  populateTag(dataset, "StationName", `STATIONNAME${seriesSuffix}`);
}

function _setInstanceAttributes(
  dataset: data.DicomDict,
  patientNumber: number,
  studyNumber: number,
  seriesNumber: number,
  instanceNumber: number
): void {
  populateTag(dataset, "SOPInstanceUID", `${dataset.dict["0020000E"]}.${instanceNumber}`); //SeriesInstanceUID
  populateMetaTag(dataset, "MediaStorageSOPInstanceUID", dataset.dict["0008,0018"]); //SOPInstanceUID
  populateTag(dataset, "InstanceCreationDate", dataset.dict["0008,0021"]); //SeriesDate
  const creationTime = new Date();
  creationTime.setHours(patientNumber, studyNumber, 7 * seriesNumber + instanceNumber);
  populateTag(
    dataset,
    "InstanceCreationTime",
    creationTime.toTimeString().slice(0, 8).replace(/:/g, "")
  );
}

function populateTag(
  dataset: data.DicomDict,
  tagName: string,
  ...values: string[] | object[]
): void {
  console.log(tagName);
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

// Usage example
const instance = loadInstance(1, 1, 1, 1);
console.log(instance);
