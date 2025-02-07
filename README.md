# DICOM Web Anonymizer

## Overview

DICOM Web Anonymizer is a TypeScript library designed to anonymize DICOM (Digital Imaging and Communications in Medicine) datasets. It provides a robust solution for removing or modifying sensitive patient information while preserving the integrity of medical imaging data.

## Features

- Anonymizes various DICOM elements including patient identifiers, names, dates, and addresses according to the [DICOM Standard](https://dicom.nema.org/medical/dicom/current/output/chtml/part15/chapter_E.html)
- Customizable anonymization rules
- Preserves DICOM data structure and integrity
- Handles complex DICOM elements like sequences
- Applicable in web-bowsers

## Installation

npm install dicom-web-anonymizer

## Usage

Here's a basic example of how to use the DICOM Web Anonymizer:

`import Anonymizer from 'dicom-web-anonymizer';`\
`import { data } from 'dcmjs';`

// Create an instance of the Anonymizer \
`const anonymizer = new Anonymizer();`

// Load your DICOM dataset\
`const dataset = data.DicomDict.fromDicomJson(/_ your DICOM JSON data _/);`

// Anonymize the dataset\
`await anonymizer.anonymize(dataset);` \

// Your dataset is now anonymized \
`console.log(dataset);`

## API Reference

### `Anonymizer`

The main class for anonymizing DICOM datasets.

#### Constructor

- `constructor(options?: AnonymizerOptions)`

#### Methods

- `anonymize(dcmDict: data.DicomDict): Promise<void>`
  Anonymizes the given DICOM dataset.

### `Configuration`

Configuration options for the Anonymizer.

- `protectedTags?: string[]`: List of DICOM tags to leave unchanged
- `anonymizePrivateTags?: boolean`: Whether to anonymize (delete) private tags
- `idPrefix?: string`: Prefix for anonymized IDs
- `idSuffix?: string`: Suffix for anonymized IDs
- `seed?: string`: Seed for the random number generator

## License

This project is licensed under the MIT License - see the LICENSE file for details.
