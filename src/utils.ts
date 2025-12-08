import { data } from 'dcmjs';

/**
 * Utility functions for DICOM tag handling
 */

/**
 * Checks if a DICOM tag is a private tag.
 * Private tags have odd group numbers (first 4 hex digits).
 *
 * @param tag - DICOM tag in format "XXXXXXXX" (8 hex digits)
 * @returns true if the tag is a private tag, false otherwise
 */
export function isPrivateTag(tag: string): boolean {
  // Private tags have odd group numbers
  const groupNumber = parseInt(tag.substring(0, 4), 16);
  return (groupNumber % 2) === 1;
}

/**
 * Safely retrieve tag information from DICOM dictionary
 * Returns null for tags not in dictionary (private or unknown tags)
 * 
 * @param tag - DICOM tag to look up
 * @returns Tag info object or null if not found
 */
export function safeGetTagInfo(tag: string): any | null {
  try {
    const tagInfo = data.DicomMetaDictionary.dictionary[tag];
    
    // Check if tagInfo exists and has expected properties
    if (tagInfo && typeof tagInfo === 'object') {
      return tagInfo;
    }
    
    return null;
  } catch (error) {
    console.warn(`Error looking up tag ${tag}:`, error);
    return null;
  }
}

/**
 * Get the name of a DICOM tag safely
 * Provides descriptive fallback names for private/unknown tags
 * 
 * @param tag - DICOM tag
 * @returns Tag name or descriptive fallback
 */
export function getTagName(tag: string): string {
  // Check if it's a private tag first
  if (isPrivateTag(tag)) {
    return `PrivateTag_${tag}`;
  }
  
  // Try to get from dictionary
  const tagInfo = safeGetTagInfo(tag);
  if (tagInfo?.name) {
    return tagInfo.name;
  }
  
  // Fallback for unknown tags
  return `UnknownTag_${tag}`;
}

/**
 * Safely get tag VR (Value Representation)
 * 
 * @param tag - DICOM tag
 * @returns VR string or 'UN' for unknown
 */
export function getTagVR(tag: string): string {
  const tagInfo = safeGetTagInfo(tag);
  return tagInfo?.vr || 'UN'; // UN = Unknown
}

/**
 * Check if tag exists in standard DICOM dictionary
 * 
 * @param tag - DICOM tag
 * @returns true if tag is in standard dictionary
 */
export function isStandardTag(tag: string): boolean {
  return !isPrivateTag(tag) && safeGetTagInfo(tag) !== null;
}

