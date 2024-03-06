import { data } from "dcmjs";
import Anonymizer from "../../src/anonymizer";

export function setupCounter(element: HTMLButtonElement) {
  let counter = 0;
  const setCounter = (count: number) => {
    counter = count;
    element.innerHTML = `count is ${counter}`;
  };
  element.addEventListener("click", () => setCounter(counter + 1));
  setCounter(0);
}

export async function getFiles() {
  const inputElement = document.getElementById("fileselector") as HTMLInputElement;

  if (
    inputElement instanceof HTMLInputElement &&
    inputElement.files &&
    inputElement.files.length > 0
  ) {
    const files = inputElement.files;
    const buffer = await files[0].arrayBuffer();
    const daten = data.DicomMessage.readFile(buffer);
    const anon = new Anonymizer();
    anon.anonymize(daten);
    console.log(daten);
  }
}
