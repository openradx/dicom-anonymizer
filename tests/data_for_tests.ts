import { data } from "dcmjs";

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
  // File Meta Information

  const meta = {
    FileMetaInformationGroupLength: "222",
    // FileMetaInformationVersion: new Uint8Array([0x00, 0x01]),
    MediaStorageSOPClassUID: "1.2.840.10008.5.1.4.1.1.2", // CT Image Storage
    MediaStorageSOPInstanceUID: "1.3.12.2.1107.5.1.4.66002.30000020070513455668000000610",
    TransferSyntaxUID: "1.2.840.10008.1.2.1", // Explicit VR Little Endian
    ImplementationClassUID: "1.2.826.0.1.3680043.9.3811.1.5.3",
    ImplementationVersionName: "PYNETDICOM_153",
    SourceApplicationEntityTitle: "DicomBrowser",
  };
  const metaTagDict = {};
  for (const [key, value] of Object.entries(meta)) {
    const placeholderDict = data.DicomMetaDictionary.nameMap[key];
    const metaTag = data.ValueRepresentation.addTagAccessors({ vr: placeholderDict.vr });
    metaTag.tag = data.DicomMetaDictionary.unpunctuateTag(placeholderDict.tag);
    metaTag.Value = [value];
    metaTagDict[metaTag.tag] = metaTag;
  }

  const dicomDict = new data.DicomDict(metaTagDict);

  // Main dataset
  const dataset = {
    SpecificCharacterSet: "ISO_IR 100",
    // ImageType: ["ORIGINAL", "PRIMARY", "LOCALIZER", "CT_SOM5 TOP"],
    SOPClassUID: "1.2.840.10008.5.1.4.1.1.2", // CT Image Storage
    SOPInstanceUID: "1.3.12.2.1107.5.1.4.66002.30000020070513455668000000610",
    StudyDate: "20190604",
    SeriesDate: "20200705",
    AcquisitionDate: "20200705",
    ContentDate: "20200705",
    AcquisitionDateTime: "20200705182848.235000",
    StudyTime: "182823",
    SeriesTime: "182837.905000",
    AcquisitionTime: "182848.235000",
    ContentTime: "182848.235000",
    AccessionNumber: "0062115936",
    Modality: "CT",
    Manufacturer: "SIEMENS",
    InstitutionName: "Thoraxklinik Heidelberg",
    InstitutionAddress: "Amalienstrasse\r\nHeidelberg\r\nMitte\r\nDE",
    ReferringPhysicianName: "UNKNOWN^UNKNOWN",
    StationName: "CTAWP66002",
    StudyDescription: "CT des Schädels",
    SeriesDescription: "Topogramm  0.6  T20f",
    PhysiciansOfRecord: "UNKNOWN^UNKNOWN",
    ManufacturerModelName: "SOMATOM Definition AS",
    IrradiationEventUID: "1.3.12.2.1107.5.1.4.66002.30000020070514362901900000047",
    PatientName: "Apple^Annie",
    PatientID: "1001",
    PatientBirthDate: "19450427",
    PatientSex: "F",
    PatientAge: "050Y",
    BodyPartExamined: "HEAD",
    KVP: "120.0",
    DataCollectionDiameter: "500.0",
    DeviceSerialNumber: "66002",
    SoftwareVersions: "syngo CT VA48A",
    ProtocolName: "Schaedel_nativ_1",
    ReconstructionDiameter: "512.0",
    DistanceSourceToDetector: "1085.6",
    DistanceSourceToPatient: "595.0",
    GantryDetectorTilt: "0.0",
    TableHeight: "100.0",
    RotationDirection: "CW",
    ExposureTime: "2672",
    XRayTubeCurrent: "35",
    Exposure: "93",
    FilterType: "FLAT",
    GeneratorPower: "4",
    FocalSpots: "0.7",
    DateOfLastCalibration: "20200705",
    TimeOfLastCalibration: "153226.000000",
    ConvolutionKernel: "T20f",
    PatientPosition: "HFS",
    ExposureModulationType: "NONE",
    StudyInstanceUID: "1.2.840.113845.11.1000000001951524609.20200705182951.2689481",
    SeriesInstanceUID: "1.3.12.2.1107.5.1.4.66002.30000020070513455668000000609",
    StudyID: "RCTS",
    SeriesNumber: "1",
    AcquisitionNumber: "1",
    InstanceNumber: "1",
    FrameOfReferenceUID: "1.3.12.2.1107.5.1.4.66002.30000020070514362901900000046",
    PositionReferenceIndicator: "",
    SliceLocation: "-122.0",
    ImageComments: "",
    PhotometricInterpretation: "MONOCHROME2",
    RescaleIntercept: "-1024.0",
    RescaleSlope: "1.0",
    RescaleType: "HU",
    RequestingPhysician: "UNKNOWN^UNKNOWN",
    RequestingService: "CT",
  };

  // Add the dataset to the DicomDict
  Object.entries(dataset).forEach(([key, value]) => {
    populateTag(dicomDict, key, value);
  });

  return dicomDict;
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
  const patientName = dataset.dict["00100010"].Value[0].Alphabetic;
  populateTag(dataset, "OtherPatientIDs", `OTH${dataset.dict["00100020"].Value[0]}`); //PatientID
  const otherPatientIDItem = new data.DicomDict({});
  populateTag(otherPatientIDItem, "PatientID", `OTHSEQ${dataset.dict["00100020"].Value[0]}`); //PatientID
  populateTag(dataset, "OtherPatientIDsSequence", otherPatientIDItem.dict);

  populateTag(dataset, "OtherPatientNames", `Other${patientName}`); //PatientName
  populateTag(dataset, "PatientBirthName", `Birth${patientName}`); //PatientName
  populateTag(dataset, "PatientMotherBirthName", `Mother${patientName}`); //PatientName
  populateTag(dataset, "ResponsiblePerson", `Responsible${patientName}`); //PatientName
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

  if (tagDict.vr == "PN") {
    const l = [];
    for (const v of values) {
      l.push({ Alphabetic: v });
    }
    dataset.upsertTag(tagDict.tag, tagDict.vr, l);
  } else {
    dataset.upsertTag(tagDict.tag, tagDict.vr, values);
  }
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
    dataset.meta[tagDict.tag] = data.ValueRepresentation.addTagAccessors({ vr: tagDict.vr });
    dataset.meta[tagDict.tag].Value = values;
  }
}
