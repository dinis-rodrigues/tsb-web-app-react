import { ref, set } from "firebase/database";
import { v4 as uuid } from "uuid";
import { db } from "../../config/firebase";
import { RecruitmentTable, RecruitmentTableSQL } from "../../interfaces";
const iconv = require("iconv-lite");

const replaceString = (str: string) => {
  const newStr = iconv.decode(str, "ISO-8859-1");
  return newStr;
};

/**
 * String to lower case and capitalize letter after dots
 * @param input
 * @returns
 */
const sentenceCase = (input: string) => {
  input = input === undefined || input === null ? "" : input;
  input = input.toLowerCase();
  return input
    .toString()
    .replace(/(^|\. *)([a-z])/g, (match, separator, char) => separator + char.toUpperCase());
};

/**
 * Converst DINIS RODRIGUES to Dinis Rodrigues
 * @param str
 * @returns
 */
const toTitleCase = (str: string) => {
  return str
    .split(" ")
    .map((w) => {
      if (w.length > 0) return w[0].toUpperCase() + w.substr(1).toLowerCase();
      return "";
    })
    .join(" ");
};

/**
 * This data was acquired from Sequel Pro program for MAC OS
 * Go to the desired SQL table and select all rows (Cmd + A)
 * Then go to Bundles -> Data Table -> Copy -> Copy as JSON
 * Paste the result
 */
const jsonData: RecruitmentTableSQL = {
  data: [
    {
      Nome: "Example",
      Email: "example@example.com",
      Areas: "Recrutamento CA  -> Example",
      Curso: "LEAN",
      Ano: 1,
      Mensagem: "Example message",
      timedata: "02/18/2019 08:32:16 pm",
    },
  ],
};

/**
 * Sends data acquired from the SQL database and sends it in json format to the new
 * Firebase database
 */
const sendJsonToDb = () => {
  const data = jsonData.data;
  const newData: RecruitmentTable = {};

  const tableName = "RecrutaSEP18";

  data.forEach((userData) => {
    // change departments format
    let og = userData.Areas;
    const toStopIdx = og.indexOf("->") - 2;
    og = og.substring(8, toStopIdx);
    const departmentsList = og.split(" ");

    // change time data stamp
    const ogDate = userData.timedata ? new Date(userData.timedata) : null;
    const newDate = ogDate ? ogDate.getTime() : null;

    // year to string
    const newYear = userData.Ano ? userData.Ano.toString() : "-";

    newData[uuid()] = {
      name: toTitleCase(replaceString(userData.Nome)),
      email: userData.Email,
      departments: departmentsList,
      degree: userData.Curso,
      year: newYear,
      phone: userData.Telemovel ? userData.Telemovel : "",
      link: userData.Facebook ? userData.Facebook : "",
      message: sentenceCase(replaceString(userData.Mensagem)),
      timestamp: newDate,
    };
  });
  set(ref(db, `public/recruitment/tables/${tableName}`), newData);
};

export { sendJsonToDb };
