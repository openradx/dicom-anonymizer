import { Randomizer } from './randomizer';
import {DicomDict, DicomMessage, Tag, DicomMetaDictionary} from 'dcmjs';


function fixedValueAnonymizer(currentValue: string, newValue: string) {


}

function unwantedElementStripper(tag: string) {
    const currTag = new Tag(tag);
    if (currTag.isPrivateCreator()){
      
    }
}      