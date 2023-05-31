/*

const chars = { '(': '', ')': '', ',': '' };
for (key in data) {
  let newKey = key.replace(/[(),]/g, m => chars[m]);
  if (newKey in DicomDict.dict) {

    const name = data[key].Name;
    const chng = data[key].BasicProf;
    const msg = `${name}, which is ${data[key].VR}, has to be changed like: ${chng}`;
    console.log(msg);
    if (data[key].BasicProf.includes('X')) {
      console.log(DicomDict.dict[newKey]);
      delete DicomDict.dict[newKey];
      console.log(DicomDict.dict[newKey]);
    }
  }
}
*/