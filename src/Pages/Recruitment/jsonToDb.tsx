import { v4 as uuid } from "uuid";
import { db } from "../../config/firebase";
import { RecruitmentTable, RecruitmentTableSQL } from "../../interfaces";
var iconv = require("iconv-lite");

const replaceString = (str: string) => {
  let newStr = iconv.decode(str, "ISO-8859-1");
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
    .replace(/(^|\. *)([a-z])/g, function (match, separator, char) {
      return separator + char.toUpperCase();
    });
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
      else return "";
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
  let data = jsonData.data;
  let newData: RecruitmentTable = {};

  let tableName = "RecrutaSEP18";

  data.forEach((userData) => {
    // change departments format
    let og = userData.Areas;
    let toStopIdx = og.indexOf("->") - 2;
    og = og.substring(8, toStopIdx);
    let departmentsList = og.split(" ");

    // change time data stamp
    let ogDate = userData.timedata ? new Date(userData.timedata) : null;
    let newDate = ogDate ? ogDate.getTime() : null;

    // year to string
    let newYear = userData.Ano ? userData.Ano.toString() : "-";

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
    // console.log(replaceString(userData.message));
  });
  db.ref("public/recruitment/tables/" + tableName).set(newData);
};

export { sendJsonToDb };
