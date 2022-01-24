import axios from "axios";
import Croppie from "croppie";
import { db, st } from "../../config/firebase";
import {
  Departments,
  PersonalInformation,
  PublicUserInfo,
  selectOption,
  userContext,
  UserMetadata,
} from "../../interfaces";
import { dateToString, userHasPermission } from "../../utils/generalFunctions";
import Compress from "compress.js";
import { NumberFormatValues } from "react-number-format";
import { getNameFromFullName } from "../Register/registerUtils";

// PHP SERVER VARIABLES
// const developmentPHPTarget =
//   "http://localhost:3000/public/assets/php/save_image_on_server.php";
// const testBuildPHPTarget =
//   "http://localhost:3000/build/php/save_image_on_server.php";
const productionPHPTarget =
  "https://tsb.tecnico.ulisboa.pt/assets/php/save_image_on_server.php";

const saveUserImgInDatabasePHPTarget = productionPHPTarget;

const departmentOptions = [
  {
    value: "Electrical Systems",
    label: "Electrical Systems",
  },
  {
    value: "Mechanical Systems",
    label: "Mechanical Systems",
  },
  {
    value: "Design and Composites",
    label: "Design and Composites",
  },
  {
    value: "Management and Marketing",
    label: "Management and Marketing",
  },
  {
    value: "Hydrogen",
    label: "Hydrogen",
  },
];

const mbWayOptions = [
  {
    value: "Yes",
    label: "Yes",
  },
  {
    value: "No",
    label: "No",
  },
];
const coursesOptions = [
  {
    label: "Undergraduate Programmes",
    options: [
      { value: "LEAer", label: "LEAer" },
      { value: "LAmbi", label: "LAmbi" },
      { value: "LEBiol", label: "LEBiol" },
      { value: "LEBiom", label: "LEBiom" },
      { value: "LEC", label: "LEC" },
      { value: "LEE", label: "LEE" },
      { value: "LEEC", label: "LEEC" },
      { value: "LEGI", label: "LEGI" },
      { value: "LEIC-A", label: "LEIC-A" },
      { value: "LEIC-T", label: "LEIC-T" },
      { value: "LEMat", label: "LEMat" },
      { value: "LEGM", label: "LEGM" },
      { value: "LENO", label: "LENO" },
      { value: "LEQ", label: "LEQ" },
      { value: "LETI", label: "LETI" },
      { value: "MAC", label: "MAC" },
    ],
  },
  {
    label: "Master's Programmes",
    options: [
      { value: "MBioNano", label: "MBioNano" },
      { value: "MBiotec", label: "MBiotec" },
      { value: "MEAer", label: "MEAer" },
      { value: "MEBiol", label: "MEBiol" },
      { value: "MEBiom", label: "MEBiom" },
      { value: "MEC", label: "MEC" },
      { value: "MECD", label: "MECD" },
      { value: "MEE", label: "MEE" },
      { value: "MEEC", label: "MEEC" },
      { value: "MEFarm", label: "MEFarm" },
      { value: "MEFT", label: "MEFT" },
      { value: "MEBiol", label: "MEBiol" },
      { value: "MEGM", label: "MEGM" },
      { value: "MEGI", label: "MEGI" },
      { value: "MEGE", label: "MEGE" },
      { value: "MEGIE", label: "MEGIE" },
      { value: "MEIC-A", label: "MEIC-A" },
      { value: "MEIC-T", label: "MEIC-T" },
      { value: "MEMec", label: "MEMec" },
      { value: "MENO", label: "MENO" },
      { value: "MEQ", label: "MEQ" },
      { value: "MEM", label: "MEM" },
      { value: "MEP", label: "MEP" },
      { value: "METI", label: "METI" },
      { value: "MEAmbi", label: "MEAmbi" },
      { value: "MISE", label: "MISE" },
      { value: "MMA", label: "MMA" },
      { value: "Microbio", label: "Microbio" },
      { value: "MOTU", label: "MOTU" },
      { value: "MPSR", label: "MPSR" },
      { value: "MQ", label: "MQ" },
      { value: "MSIDC", label: "MSIDC" },
    ],
  },
  {
    label: "International Masters",
    options: [
      { value: "AMRD", label: "AMRD" },
      { value: "IMME", label: "IMME" },
      { value: "CoDaS", label: "CoDaS" },
    ],
  },
];

const countryOptions = [
  { value: "Afghanistan", label: "Afghanistan" },
  { value: "Åland Islands", label: "Åland Islands" },
  { value: "Albania", label: "Albania" },
  { value: "Algeria", label: "Algeria" },
  { value: "American Samoa", label: "American Samoa" },
  { value: "Andorra", label: "Andorra" },
  { value: "Angola", label: "Angola" },
  { value: "Anguilla", label: "Anguilla" },
  { value: "Antarctica", label: "Antarctica" },
  { value: "Antigua and Barbuda", label: "Antigua and Barbuda" },
  { value: "Argentina", label: "Argentina" },
  { value: "Armenia", label: "Armenia" },
  { value: "Aruba", label: "Aruba" },
  { value: "Australia", label: "Australia" },
  { value: "Austria", label: "Austria" },
  { value: "Azerbaijan", label: "Azerbaijan" },
  { value: "Bahamas", label: "Bahamas" },
  { value: "Bahrain", label: "Bahrain" },
  { value: "Bangladesh", label: "Bangladesh" },
  { value: "Barbados", label: "Barbados" },
  { value: "Belarus", label: "Belarus" },
  { value: "Belgium", label: "Belgium" },
  { value: "Belize", label: "Belize" },
  { value: "Benin", label: "Benin" },
  { value: "Bermuda", label: "Bermuda" },
  { value: "Bhutan", label: "Bhutan" },
  { value: "Bolivia", label: "Bolivia" },
  { value: "Bosnia and Herzegovina", label: "Bosnia and Herzegovina" },
  { value: "Botswana", label: "Botswana" },
  { value: "Bouvet Island", label: "Bouvet Island" },
  { value: "Brazil", label: "Brazil" },
  {
    value: "British Indian Ocean Territory",
    label: "British Indian Ocean Territory",
  },
  { value: "Brunei Darussalam", label: "Brunei Darussalam" },
  { value: "Bulgaria", label: "Bulgaria" },
  { value: "Burkina Faso", label: "Burkina Faso" },
  { value: "Burundi", label: "Burundi" },
  { value: "Cambodia", label: "Cambodia" },
  { value: "Cameroon", label: "Cameroon" },
  { value: "Canada", label: "Canada" },
  { value: "Cape Verde", label: "Cape Verde" },
  { value: "Cayman Islands", label: "Cayman Islands" },
  { value: "Central African Republic", label: "Central African Republic" },
  { value: "Chad", label: "Chad" },
  { value: "Chile", label: "Chile" },
  { value: "China", label: "China" },
  { value: "Christmas Island", label: "Christmas Island" },
  { value: "Cocos (Keeling) Islands", label: "Cocos (Keeling) Islands" },
  { value: "Colombia", label: "Colombia" },
  { value: "Comoros", label: "Comoros" },
  { value: "Congo", label: "Congo" },
  {
    value: "Congo, The Democratic Republic of The",
    label: "Congo, The Democratic Republic of The",
  },
  { value: "Cook Islands", label: "Cook Islands" },
  { value: "Costa Rica", label: "Costa Rica" },
  { value: "Cote D'ivoire", label: "Cote D'ivoire" },
  { value: "Croatia", label: "Croatia" },
  { value: "Cuba", label: "Cuba" },
  { value: "Cyprus", label: "Cyprus" },
  { value: "Czech Republic", label: "Czech Republic" },
  { value: "Denmark", label: "Denmark" },
  { value: "Djibouti", label: "Djibouti" },
  { value: "Dominica", label: "Dominica" },
  { value: "Dominican Republic", label: "Dominican Republic" },
  { value: "Ecuador", label: "Ecuador" },
  { value: "Egypt", label: "Egypt" },
  { value: "El Salvador", label: "El Salvador" },
  { value: "Equatorial Guinea", label: "Equatorial Guinea" },
  { value: "Eritrea", label: "Eritrea" },
  { value: "Estonia", label: "Estonia" },
  { value: "Ethiopia", label: "Ethiopia" },
  {
    value: "Falkland Islands (Malvinas)",
    label: "Falkland Islands (Malvinas)",
  },
  { value: "Faroe Islands", label: "Faroe Islands" },
  { value: "Fiji", label: "Fiji" },
  { value: "Finland", label: "Finland" },
  { value: "France", label: "France" },
  { value: "French Guiana", label: "French Guiana" },
  { value: "French Polynesia", label: "French Polynesia" },
  {
    value: "French Southern Territories",
    label: "French Southern Territories",
  },
  { value: "Gabon", label: "Gabon" },
  { value: "Gambia", label: "Gambia" },
  { value: "Georgia", label: "Georgia" },
  { value: "Germany", label: "Germany" },
  { value: "Ghana", label: "Ghana" },
  { value: "Gibraltar", label: "Gibraltar" },
  { value: "Greece", label: "Greece" },
  { value: "Greenland", label: "Greenland" },
  { value: "Grenada", label: "Grenada" },
  { value: "Guadeloupe", label: "Guadeloupe" },
  { value: "Guam", label: "Guam" },
  { value: "Guatemala", label: "Guatemala" },
  { value: "Guernsey", label: "Guernsey" },
  { value: "Guinea", label: "Guinea" },
  { value: "Guinea-bissau", label: "Guinea-bissau" },
  { value: "Guyana", label: "Guyana" },
  { value: "Haiti", label: "Haiti" },
  {
    value: "Heard Island and Mcdonald Islands",
    label: "Heard Island and Mcdonald Islands",
  },
  {
    value: "Holy See (Vatican City State)",
    label: "Holy See (Vatican City State)",
  },
  { value: "Honduras", label: "Honduras" },
  { value: "Hong Kong", label: "Hong Kong" },
  { value: "Hungary", label: "Hungary" },
  { value: "Iceland", label: "Iceland" },
  { value: "India", label: "India" },
  { value: "Indonesia", label: "Indonesia" },
  { value: "Iran, Islamic Republic of", label: "Iran, Islamic Republic of" },
  { value: "Iraq", label: "Iraq" },
  { value: "Ireland", label: "Ireland" },
  { value: "Isle of Man", label: "Isle of Man" },
  { value: "Israel", label: "Israel" },
  { value: "Italy", label: "Italy" },
  { value: "Jamaica", label: "Jamaica" },
  { value: "Japan", label: "Japan" },
  { value: "Jersey", label: "Jersey" },
  { value: "Jordan", label: "Jordan" },
  { value: "Kazakhstan", label: "Kazakhstan" },
  { value: "Kenya", label: "Kenya" },
  { value: "Kiribati", label: "Kiribati" },
  {
    value: "Korea, Democratic People's Republic of",
    label: "Korea, Democratic People's Republic of",
  },
  { value: "Korea, Republic of", label: "Korea, Republic of" },
  { value: "Kuwait", label: "Kuwait" },
  { value: "Kyrgyzstan", label: "Kyrgyzstan" },
  {
    value: "Lao People's Democratic Republic",
    label: "Lao People's Democratic Republic",
  },
  { value: "Latvia", label: "Latvia" },
  { value: "Lebanon", label: "Lebanon" },
  { value: "Lesotho", label: "Lesotho" },
  { value: "Liberia", label: "Liberia" },
  { value: "Libyan Arab Jamahiriya", label: "Libyan Arab Jamahiriya" },
  { value: "Liechtenstein", label: "Liechtenstein" },
  { value: "Lithuania", label: "Lithuania" },
  { value: "Luxembourg", label: "Luxembourg" },
  { value: "Macao", label: "Macao" },
  {
    value: "Macedonia, The Former Yugoslav Republic of",
    label: "Macedonia, The Former Yugoslav Republic of",
  },
  { value: "Madagascar", label: "Madagascar" },
  { value: "Malawi", label: "Malawi" },
  { value: "Malaysia", label: "Malaysia" },
  { value: "Maldives", label: "Maldives" },
  { value: "Mali", label: "Mali" },
  { value: "Malta", label: "Malta" },
  { value: "Marshall Islands", label: "Marshall Islands" },
  { value: "Martinique", label: "Martinique" },
  { value: "Mauritania", label: "Mauritania" },
  { value: "Mauritius", label: "Mauritius" },
  { value: "Mayotte", label: "Mayotte" },
  { value: "Mexico", label: "Mexico" },
  {
    value: "Micronesia, Federated States of",
    label: "Micronesia, Federated States of",
  },
  { value: "Moldova, Republic of", label: "Moldova, Republic of" },
  { value: "Monaco", label: "Monaco" },
  { value: "Mongolia", label: "Mongolia" },
  { value: "Montenegro", label: "Montenegro" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Morocco", label: "Morocco" },
  { value: "Mozambique", label: "Mozambique" },
  { value: "Myanmar", label: "Myanmar" },
  { value: "Namibia", label: "Namibia" },
  { value: "Nauru", label: "Nauru" },
  { value: "Nepal", label: "Nepal" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "Netherlands Antilles", label: "Netherlands Antilles" },
  { value: "New Caledonia", label: "New Caledonia" },
  { value: "New Zealand", label: "New Zealand" },
  { value: "Nicaragua", label: "Nicaragua" },
  { value: "Niger", label: "Niger" },
  { value: "Nigeria", label: "Nigeria" },
  { value: "Niue", label: "Niue" },
  { value: "Norfolk Island", label: "Norfolk Island" },
  { value: "Northern Mariana Islands", label: "Northern Mariana Islands" },
  { value: "Norway", label: "Norway" },
  { value: "Oman", label: "Oman" },
  { value: "Pakistan", label: "Pakistan" },
  { value: "Palau", label: "Palau" },
  {
    value: "Palestinian Territory, Occupied",
    label: "Palestinian Territory, Occupied",
  },
  { value: "Panama", label: "Panama" },
  { value: "Papua New Guinea", label: "Papua New Guinea" },
  { value: "Paraguay", label: "Paraguay" },
  { value: "Peru", label: "Peru" },
  { value: "Philippines", label: "Philippines" },
  { value: "Pitcairn", label: "Pitcairn" },
  { value: "Poland", label: "Poland" },
  { value: "Portugal", label: "Portugal" },
  { value: "Puerto Rico", label: "Puerto Rico" },
  { value: "Qatar", label: "Qatar" },
  { value: "Reunion", label: "Reunion" },
  { value: "Romania", label: "Romania" },
  { value: "Russian Federation", label: "Russian Federation" },
  { value: "Rwanda", label: "Rwanda" },
  { value: "Saint Helena", label: "Saint Helena" },
  { value: "Saint Kitts and Nevis", label: "Saint Kitts and Nevis" },
  { value: "Saint Lucia", label: "Saint Lucia" },
  { value: "Saint Pierre and Miquelon", label: "Saint Pierre and Miquelon" },
  {
    value: "Saint Vincent and The Grenadines",
    label: "Saint Vincent and The Grenadines",
  },
  { value: "Samoa", label: "Samoa" },
  { value: "San Marino", label: "San Marino" },
  { value: "Sao Tome and Principe", label: "Sao Tome and Principe" },
  { value: "Saudi Arabia", label: "Saudi Arabia" },
  { value: "Senegal", label: "Senegal" },
  { value: "Serbia", label: "Serbia" },
  { value: "Seychelles", label: "Seychelles" },
  { value: "Sierra Leone", label: "Sierra Leone" },
  { value: "Singapore", label: "Singapore" },
  { value: "Slovakia", label: "Slovakia" },
  { value: "Slovenia", label: "Slovenia" },
  { value: "Solomon Islands", label: "Solomon Islands" },
  { value: "Somalia", label: "Somalia" },
  { value: "South Africa", label: "South Africa" },
  {
    value: "South Georgia and The South Sandwich Islands",
    label: "South Georgia and The South Sandwich Islands",
  },
  { value: "Spain", label: "Spain" },
  { value: "Sri Lanka", label: "Sri Lanka" },
  { value: "Sudan", label: "Sudan" },
  { value: "Suriname", label: "Suriname" },
  { value: "Svalbard and Jan Mayen", label: "Svalbard and Jan Mayen" },
  { value: "Swaziland", label: "Swaziland" },
  { value: "Sweden", label: "Sweden" },
  { value: "Switzerland", label: "Switzerland" },
  { value: "Syrian Arab Republic", label: "Syrian Arab Republic" },
  { value: "Taiwan, Province of China", label: "Taiwan, Province of China" },
  { value: "Tajikistan", label: "Tajikistan" },
  {
    value: "Tanzania, United Republic of",
    label: "Tanzania, United Republic of",
  },
  { value: "Thailand", label: "Thailand" },
  { value: "Timor-leste", label: "Timor-leste" },
  { value: "Togo", label: "Togo" },
  { value: "Tokelau", label: "Tokelau" },
  { value: "Tonga", label: "Tonga" },
  { value: "Trinidad and Tobago", label: "Trinidad and Tobago" },
  { value: "Tunisia", label: "Tunisia" },
  { value: "Turkey", label: "Turkey" },
  { value: "Turkmenistan", label: "Turkmenistan" },
  { value: "Turks and Caicos Islands", label: "Turks and Caicos Islands" },
  { value: "Tuvalu", label: "Tuvalu" },
  { value: "Uganda", label: "Uganda" },
  { value: "Ukraine", label: "Ukraine" },
  { value: "United Arab Emirates", label: "United Arab Emirates" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "United States", label: "United States" },
  {
    value: "United States Minor Outlying Islands",
    label: "United States Minor Outlying Islands",
  },
  { value: "Uruguay", label: "Uruguay" },
  { value: "Uzbekistan", label: "Uzbekistan" },
  { value: "Vanuatu", label: "Vanuatu" },
  { value: "Venezuela", label: "Venezuela" },
  { value: "Viet Nam", label: "Viet Nam" },
  { value: "Virgin Islands, British", label: "Virgin Islands, British" },
  { value: "Virgin Islands, U.S.", label: "Virgin Islands, U.S." },
  { value: "Wallis and Futuna", label: "Wallis and Futuna" },
  { value: "Western Sahara", label: "Western Sahara" },
  { value: "Yemen", label: "Yemen" },
  { value: "Zambia", label: "Zambia" },
  { value: "Zimbabwe", label: "Zimbabwe" },
];

const curricularYearOptions = [
  {
    value: "1",
    label: "1",
  },
  {
    value: "2",
    label: "2",
  },
  {
    value: "3",
    label: "3",
  },
  {
    value: "4",
    label: "4",
  },
  {
    value: "5",
    label: "5",
  },
];

const groupStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};
const groupBadgeStyles = {
  backgroundColor: "#EBECF0",
  borderRadius: "2em",
  color: "#172B4D",
  display: "inline-block",
  fontSize: 12,
  lineHeight: "1",
  minWidth: 1,
  padding: "0.16666666666667em 0.5em",
};
const selectStyles = (theme: any, isDisabled: boolean, isDarkMode: boolean) => {
  return {
    ...theme,
    borderRadius: "0.2rem",
    colors: {
      ...theme.colors,
      neutral5: isDisabled && "#e9ecef", //I'm changing the predefined variable of the disabled color
      neutral40: "#495057",
      neutral10: "#ced4da",
    },
  };
};

const formatCoursesLabel = (data: any) => (
  <div style={groupStyles}>
    <span>{data.label}</span>
    <span style={groupBadgeStyles}>{data.options.length}</span>
  </div>
);

const defaultInfo: PersonalInformation = {
  uid: "",
  fullName: "",
  department: "",
  position: "Team Member",
  joinedIn: "",
  name: "",
  email: "",
  phone: "",
  mbway: "",
  university: "Instituto Superior Técnico",
  degree: "MEEC",
  studentId: "ist",
  idCard: "",
  nif: "",
  country: "Portugal",
  birth: "",
  address: "",
  city: "Lisbon",
  zip: "",
  iban: "",
  linkedin: "",
  inTeam: true,
  departmentStats: 1,
  generalStats: 1,
  gender: "",
  curricularYear: 0,
  userName: "",
};

const departmentAcronyms: { [key: string]: string } = {
  "Electrical Systems": "es",
  "Mechanical Systems": "ms",
  "Design and Composites": "dc",
  "Management and Marketing": "mm",
  Hydrogen: "hp",
};

const departmentProfileAcronyms: { [key: string]: string } = {
  "Electrical Systems": "es",
  "Mechanical Systems": "ms",
  "Design and Composites": "dc",
  "Management and Marketing": "mm",
  "Hydrogen Fuel Cell": "hp",
};

/**
 * Sends a request to the FLask API backend to retrieve courses information
 * @param userName
 * @param userId
 */
const fenixAuth = (userName: string, userId: string) => {
  const [firstN, lastN] = userName.split(" ");
  window.open(
    "https://tsb-app-flask.herokuapp.com/?name=" +
      `${firstN}+${lastN}` +
      "&uid=" +
      userId,
    "_blank"
  );
};

/**
 * Finds matches of courses between users
 * @param course
 * @param users
 * @param userId
 * @returns
 */
const getMatchedUsers = (
  course: string,
  users: any,
  userId: string
): string[] => {
  let matchedUsers = [];
  try {
    // Retrieve the keys of each child of the parent node
    var keys = Object.keys(users);

    for (let i in keys) {
      var k = keys[i];
      var userPairID = keys[i];
      if (users[k].hasOwnProperty("courses")) {
        if (users[k].courses.hasOwnProperty("enrolments")) {
          for (let j = 0; j < users[k].courses.enrolments.length; j++) {
            if (
              course === users[k].courses.enrolments[j].acronym &&
              userId !== userPairID
            ) {
              matchedUsers.push(userPairID);
            }
          }
        }
      }
    }
    return matchedUsers;
  } catch (err) {
    return [];
  }
};

/**
 * Gets the available positions from the selected department
 * @param option
 * @param setSelectPositions
 */
const setDepartmentPositions = (
  option: string,
  user: userContext | null,
  setSelectPositions: Function
) => {
  // Sets the optional positions based on the current department
  const acronym: string = departmentProfileAcronyms[option];
  db.ref(`private/departments/${acronym}/positions`).once(
    "value",
    (snapshot) => {
      const positions = snapshot.val();
      const dataArr: selectOption[] = [];
      for (var key in positions) {
        if (positions.hasOwnProperty(key)) {
          dataArr.push({ value: positions[key], label: positions[key] });
        }
      }
      let morePositions: selectOption[] = getAdditionalAdminPositions(user);
      let defaultPositions = getDefaultPositions();
      let allPositions = [...defaultPositions, ...dataArr, ...morePositions];
      setSelectPositions(allPositions);
    }
  );
};

/**
 * Aditional positions to choose if the current user is admin
 * @param user
 * @returns
 */
const getAdditionalAdminPositions = (user: userContext | null) => {
  if (!user || !userHasPermission(user)) return [];
  if (user.position === "Team Leader" || user.position === "God") {
    return [
      { value: "Team Leader", label: "Team Leader" },
      { value: "Head of Department", label: "Head of Department" },
      { value: "Technical Director", label: "Technical Director" },
    ];
  } else if (user.position === "Head of Department") {
    return [
      { value: "Head of Department", label: "Head of Department" },
      { value: "Technical Director", label: "Technical Director" },
    ];
  } else if (user.position === "Technical Director") {
    return [{ value: "Technical Director", label: "Technical Director" }];
  }
  return [];
};

/**
 * Default and unmutable positions
 * @returns
 */
const getDefaultPositions = () => {
  return [{ value: "Team Member", label: "Team Member" }];
};

/**
 * Handler for department selection
 * @param option
 * @param key
 * @param setSelectPositions
 */
const handleSelectDepartment = (
  option: any,
  key: string,
  user: userContext | null,
  setSelectPositions: Function,
  setInfo: Function
) => {
  setDepartmentPositions(option.value, user, setSelectPositions); // change positions based on department
  setInfo((info: PersonalInformation) => ({ ...info, [key]: option.value }));
};

/**
 * Input text handler
 * @param e
 * @param key
 */
const handleInput = (e: any, key: string, setInfo: Function) => {
  const value = e.target.value;
  setInfo((info: PersonalInformation) => ({ ...info, [key]: value }));
};

/**
 * Select handler
 * @param option
 * @param key
 * @param setInfo
 */
const handleSelect = (option: any, key: string, setInfo: Function) => {
  setInfo((info: PersonalInformation) => ({ ...info, [key]: option.value }));
};

/**
 * In team input handler
 * @param option
 * @param setInfo
 */
const handleInTeamSelect = (option: any, setInfo: Function) => {
  let inTeam = option.value === "true";
  setInfo((info: PersonalInformation) => ({
    ...info,
    inTeam: inTeam ? true : false,
  }));
};

/**
 * Date input handler
 * @param date
 * @param key
 */
const handleDate = (date: Date, key: string, setInfo: Function) => {
  // saves the date as a portuguese format string
  const nDate = dateToString(date);
  setInfo((info: PersonalInformation) => ({ ...info, [key]: nDate }));
};

/**
 * Handles the input mask on change
 * @param value
 * @param key
 * @param setInfo
 */
const handleInputMask = (
  value: NumberFormatValues,
  key: string,
  setInfo: Function
) => {
  let str = value.formattedValue;
  setInfo((info: PersonalInformation) => ({ ...info, [key]: str }));
};

/**
 * Edit profile toggle
 */
const editInformation = (setDisabledInput: Function) => {
  setDisabledInput((disabledInput: boolean) => !disabledInput);
};

/**
 * Saves public user information to public DB
 * @param user
 * @param info
 */
const savePublicUser = (userId: string, info: PersonalInformation) => {
  const publicInfo: PublicUserInfo = {
    name: info.name ? info.name : "",
    position: info.position ? info.position : "",
    degree: info.degree ? info.degree : "",
    birth: info.birth ? info.birth : "",
    department: info.department ? info.department : "",
    joinedIn: info.joinedIn ? info.joinedIn : "",
    linkedin: info.linkedin ? info.linkedin : "",
    description: info.description ? info.description : "",
    email: info.email ? info.email : "",
    inTeam: info.inTeam,
    leftIn: info.leftIn ? info.leftIn : "",
    userName: info.userName ? info.userName : "",
  };
  db.ref("public/officialWebsite/team")
    .child(userId)
    .child("info")
    .set(publicInfo);
};

/**
 * Copies all public user data to Public directory DB
 */
const sendTeamToPublic = () => {
  db.ref(`private/usersMetadata`)
    .once("value")
    .then((snapshot) => {
      const allUsers: UserMetadata = snapshot.val();

      if (!allUsers) return;

      Object.entries(allUsers).forEach(([userKey, user]) => {
        const info = user.pinfo;
        const publicInfo: PublicUserInfo = {
          name: info.name ? info.name : "",
          position: info.position ? info.position : "",
          degree: info.degree ? info.degree : "",
          birth: info.birth ? info.birth : "",
          department: info.department ? info.department : "",
          joinedIn: info.joinedIn ? info.joinedIn : "",
          linkedin: info.linkedin ? info.linkedin : "",
          description: info.description ? info.description : "",
          email: info.email ? info.email : "",
          inTeam: info.inTeam,
          leftIn: info.leftIn ? info.leftIn : "",
        };
        db.ref("public/officialWebsite/team")
          .child(userKey)
          .child("info")
          .set(publicInfo);
      });
    });
};

/**
 * Saves user information in DB
 * @param user
 * @param info
 * @param croppie
 * @param setDisabledInput
 * @param setPrevInfo
 * @param setCroppie
 * @param setShowSaveImg
 * @returns
 */
const saveInformation = (
  user: userContext | undefined,
  info: PersonalInformation,
  croppie: Croppie,
  setDisabledInput: Function,
  setPrevInfo: Function,
  setCroppie: Function,
  setShowSaveImg: Function
) => {
  // Updates the database and destroys croppie
  if (!user) {
    return;
  }
  const userData = { ...info, name: getNameFromFullName(info.fullName!) };
  db.ref(`private/usersMetadata/${user.id}/pinfo`).update(userData);
  savePublicUser(user.id, userData);
  setDisabledInput((disabledInput: boolean) => !disabledInput);
  setPrevInfo(userData);
  killCroppie(setCroppie, croppie, setShowSaveImg);
};

/**
 * Restores original user information
 * @param prevInfo
 * @param croppie
 * @param setDisabledInput
 * @param setInfo
 * @param setCroppie
 * @param setShowSaveImg
 */
const discardInformation = (
  prevInfo: PersonalInformation,
  croppie: Croppie,
  setDisabledInput: Function,
  setInfo: Function,
  setCroppie: Function,
  setShowSaveImg: Function
) => {
  setDisabledInput((disabledInput: boolean) => !disabledInput);
  setInfo(prevInfo);
  killCroppie(setCroppie, croppie, setShowSaveImg);
};

/**
 * Destroys croppie instance
 * @param setCroppie
 * @param croppie
 * @param setShowSaveImg
 */
const killCroppie = (
  setCroppie: Function,
  croppie: Croppie | undefined,
  setShowSaveImg: Function
) => {
  if (croppie) croppie.destroy();
  setCroppie(croppie);
  setShowSaveImg(false);
};

/**
 * Creates a croppie instance
 * @param img
 * @param croppie
 * @param setCroppie
 */
const handleImage = (
  img: string,
  croppie: Croppie | undefined,
  setCroppie: Function
) => {
  const el = document.getElementById("croppie-img");
  if (el) {
    if (!croppie) {
      const croppieInstance = new Croppie(el, {
        enableExif: true,
        viewport: {
          // @ts-ignore
          height: "12rem",
          // @ts-ignore
          width: "12rem",
        },
        boundary: {
          // @ts-ignore
          width: "15rem",
          // @ts-ignore
          height: "15rem",
        },
        url: img,
      });
      setCroppie(croppieInstance);
    } else {
      croppie.bind({
        url: img,
        zoom: 0,
      });
    }
  }
};

/**
 * Receives the uploaded image and starts building the croppie instance
 * @param event
 * @param croppie
 * @param setShowSaveImg
 * @param setCroppie
 */
const handleUpload = (
  event: React.ChangeEvent<HTMLInputElement>,
  croppie: Croppie | undefined,
  setShowSaveImg: Function,
  setCroppie: Function
) => {
  if (event.target.files && event.target.files[0]) {
    const img = URL.createObjectURL(event.target.files[0]);
    handleImage(img, croppie, setCroppie);
    event.target.value = ""; // Resets the input
    setShowSaveImg(true); // show button to save image to server
  }
};

/**
 * Resizes image
 * @param user
 * @param blob
 * @param croppie
 * @param setCroppie
 * @param setShowSaveImg
 * @param setUSER
 * @returns
 */
const resizeImage = (
  user: userContext | null,
  blob: Blob,
  croppie: Croppie | undefined,
  setCroppie: Function,
  setShowSaveImg: Function,
  setUSER: Function
) => {
  // Read the input image using FileReader.
  if (!user) {
    return;
  }
  const compress = new Compress();
  const fileToCompress = new File([blob], "filename.png");
  compress
    .compress([fileToCompress], {
      size: 1, // the max size in MB, defaults to 2MB
      quality: 1, // the quality of the image, max is 1,
      maxWidth: 64, // the max width of the output image, defaults to 1920px
      maxHeight: 64, // the max height of the output image, defaults to 1920px
      resize: true, // defaults to true, set false if you do not want to resize the image width and height
    })
    .then((data) => {
      const img = data[0];
      const base64str = img.data;
      const imgExt = img.ext;
      const fileBlob = Compress.convertBase64ToFile(base64str, imgExt); // blob file
      const compressed = new FormData();
      compressed.append("file", fileBlob, `${user.id}comp`);
      compressed.set("uid", user.id);
      // returns an array of compressed images
      // send data to save in server
      axios
        .post(saveUserImgInDatabasePHPTarget, compressed, {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          // If succesfful, save in firebase storage
          // Send image to firebase storage
          st.ref(`users/${user.id}/${user.id}comp`).put(fileBlob);
          // When all works out well, kill croppie and save button
          killCroppie(setCroppie, croppie, setShowSaveImg);
          // update/refresh the profile image

          setUSER((USER: userContext) => {
            return {
              ...USER,
              usrImgComp: `/db/users/${user.id}/img/${
                user.id
              }comp.png?${new Date().getTime()}`,
              userImg: `/db/users/${user.id}/img/${
                user.id
              }.png?${new Date().getTime()}`,
            };
          });
          // Refresh page to reload profile image
          window.location.reload();
        })
        .catch((error) => {});
    });
};

/**
 * Uploads the profile image to firebase storage and to local IST server
 * @param user
 * @param blob
 * @param filename
 * @param croppie
 * @returns
 */
const sendImgToServer = async (
  user: userContext | null,
  blob: Blob | undefined,
  filename: string,
  croppie: Croppie,
  setCroppie: Function,
  setShowSaveImg: Function,
  setUSER: Function
) => {
  if (!user) {
    return;
  }
  // croppie to blob, this returns a promise, use await to get the blob file
  if (!blob) {
    blob = await croppie.result({
      type: "blob", // blob is just a file type  that works with firebase
      size: "viewport",
    });
  }
  if (!filename) {
    filename = user.id;
  }

  var data = new FormData();
  data.append("file", blob, user.id);
  data.set("uid", user.id);
  await axios
    .post(saveUserImgInDatabasePHPTarget, data, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      // Send image to firebase storage
    })
    .catch((error) => {});
  await st.ref(`users/${user.id}/${user.id}`).put(blob);
  resizeImage(user, blob, croppie, setCroppie, setShowSaveImg, setUSER);
};

const getUserIdFromUrl = () => {
  const pathName = window.location.pathname;
  // thread pathName
  // /forum/s/encodedSectionName/topic/encodedTopicName/thread/encodedThreadName
  let splitted = pathName.split("/");
  return splitted[splitted.length - 1];
};

/**
 * Builds department options base on the departments on the database
 * @param departments
 * @returns
 */
const getDepartmentOptions = (departments: Departments) => {
  let departmentOptions = Object.entries(departments).map(
    ([acronym, department]) => ({
      value: department.description,
      label: department.description,
    })
  );
  return departmentOptions;
};

/**
 * Retrieves the gradient color of the cover
 * @param user
 * @param departmentsWDesc
 * @returns
 */
const getCoverBgColor = (
  user: userContext | PersonalInformation | null,
  departmentsWDesc: Departments
) => {
  if (!user) return;
  let bgColor = "bg-vicious-stance";
  try {
    bgColor = departmentsWDesc[user.department!].gradientColor;
  } catch (error) {
    return bgColor;
  }
  return bgColor;
};

/**
 * Retrieves the profile border color
 * @param user
 * @param departmentsWDesc
 * @returns
 */
const getCoverBorderColor = (
  user: userContext | PersonalInformation | null,
  departmentsWDesc: Departments
) => {
  if (!user) return;
  let bdColor = "#6c757d";
  try {
    bdColor = departmentsWDesc[user.department!].color;
  } catch (error) {
    return bdColor;
  }
  return bdColor;
};

export {
  killCroppie,
  handleImage,
  handleUpload,
  setDepartmentPositions,
  saveInformation,
  discardInformation,
  handleSelectDepartment,
  handleInput,
  handleSelect,
  handleInTeamSelect,
  handleDate,
  editInformation,
  departmentOptions,
  mbWayOptions,
  coursesOptions,
  groupStyles,
  groupBadgeStyles,
  selectStyles,
  curricularYearOptions,
  countryOptions,
  formatCoursesLabel,
  defaultInfo,
  departmentAcronyms,
  fenixAuth,
  getMatchedUsers,
  sendImgToServer,
  getUserIdFromUrl,
  handleInputMask,
  getDepartmentOptions,
  getCoverBgColor,
  getCoverBorderColor,
  sendTeamToPublic,
  savePublicUser,
};
