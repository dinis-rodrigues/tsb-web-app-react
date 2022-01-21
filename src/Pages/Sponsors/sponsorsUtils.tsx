import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { db } from "../../config/firebase";
import { v4 as uuid } from "uuid";
import {
  Sponsor,
  SponsorBracket,
  SponsorBracketListItem,
  SponsorBracketPublic,
  SponsorBracketsDB,
  SponsorBracketsListDB,
  SponsorHistory,
  SponsorPublic,
  SponsorsOrder,
  SponsorsOrderPublic,
} from "../../interfaces";
import { ApexOptions } from "apexcharts";
import { ColorPickerValue } from "react-rainbow-components/components/ColorPicker";
import fileDownload from "js-file-download";
import axios from "axios";
import {
  dateToString,
  normalizedString,
  toastrMessage,
} from "../../utils/generalFunctions";

const sponsorSkeleton: Sponsor = {
  name: "New Sponsor Name",
  level: "",
  svgPath: "",
  url: "",
};
const bracketSkeleton: SponsorBracketListItem = {
  name: "New Bracket",
  bottomMargin: 0,
  topMargin: 0,
  numColumns: 4,
};

const sponsorChartOptions: ApexOptions = {
  chart: {
    height: 350,
    type: "bar",
    stacked: true,
  },
  plotOptions: {
    bar: {
      borderRadius: 10,
      dataLabels: {
        position: "center", // top, center, bottom
      },
    },
  },
  dataLabels: {
    enabled: true,
    formatter: function (val: number, opts) {
      // let data: number[] = opts.w.config.series[0].data;
      // let sum = data.reduce((a, b) => a + b, 0);
      // const percent = (val / sum) * 100;
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    },
  },

  xaxis: {
    position: "top",
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    tooltip: {
      enabled: true,
    },
  },
  yaxis: {
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: true,
    },
    labels: {
      show: true,
      formatter: function (val) {
        return val.toString();
      },
    },
  },
};

/**
 * Updates company list to show on dropdown of bracket. Shows companies without any
 * sponsor bracket
 * @param search
 * @param sponsors
 * @param setDropdownResults
 */
const updateSponsorDropdown = (
  search: string,
  sponsors: [string, Sponsor][],
  setDropdownResults: Function
) => {
  const res = sponsors.filter(([sponId, sponsorVal]) => {
    let normSponsor = normalizedString(sponsorVal.name).toLowerCase();
    let normSearch = normalizedString(search).toLowerCase();
    return (
      (normSponsor.indexOf(normSearch) > -1 && !sponsorVal.level) ||
      (!normSearch && !sponsorVal.level)
    );
  });
  setDropdownResults(res);
};

/**
 * Removes sponsor from the entire database
 * @param sponsorId
 * @param bracketId
 */
const deleteSponsor = (sponsorId: string, bracketId: string | undefined) => {
  // retrieve board items from bracket to remove sponsor
  if (bracketId)
    db.ref("private/sponsors/brackets")
      .child(bracketId)
      .child("sponsorsBoardList")
      .once("value")
      .then((snapshot) => {
        let sponsorsList: string[] = snapshot.val();
        if (!sponsorsList) sponsorsList = [];
        const newSponsorsList = sponsorsList.filter((sponsor) => {
          return sponsor !== sponsorId;
        });

        // Update with new List
        db.ref("private/sponsors/brackets")
          .child(bracketId)
          .child("sponsorsBoardList")
          .set(newSponsorsList);

        // Remove sponsor from bracket sponsors
        db.ref("private/sponsors/brackets")
          .child(bracketId)
          .child("bracketSponsors")
          .child(sponsorId)
          .remove();
        // remove sponsor from inventory
        db.ref("private/sponsors/inventory").child(sponsorId).remove();
      });
  // remove sponsor from inventory
  else db.ref("private/sponsors/inventory").child(sponsorId).remove();

  toastrMessage("Sponsor Deleted", "success");
};

/**
 * Adds sponsor to selected bracket
 * @param sponsorId
 * @param sponsor
 * @param bracketId
 * @param bracketName
 */
const addSponsorToBracket = (
  sponsorId: string,
  sponsor: Sponsor,
  bracketId: string,
  bracketName: string
) => {
  // retrieve board items from bracket to add sponsor
  db.ref("private/sponsors/brackets")
    .child(bracketId)
    .child("sponsorsBoardList")
    .once("value")
    .then((snapshot) => {
      let sponsorsList: string[] = snapshot.val();
      if (!sponsorsList) sponsorsList = [];
      sponsorsList.push(sponsorId);

      // Update with new List
      db.ref("private/sponsors/brackets")
        .child(bracketId)
        .child("sponsorsBoardList")
        .set(sponsorsList);

      // Add sponsor to bracket sponsors
      db.ref("private/sponsors/brackets")
        .child(bracketId)
        .child("bracketSponsors")
        .child(sponsorId)
        .set({ ...sponsor, level: bracketName });
      // update sponsor in inventory with new bracket
      db.ref("private/sponsors/inventory")
        .child(sponsorId)
        .child("level")
        .set(bracketName);
    });
};

/**
 * Removes sponsor from bracket
 * @param sponsorId
 * @param bracketId
 */
const removeSponsorFromBracket = (sponsorId: string, bracketId: string) => {
  // retrieve board items from bracket
  db.ref("private/sponsors/brackets")
    .child(bracketId)
    .child("sponsorsBoardList")
    .once("value")
    .then((snapshot) => {
      const sponsorsList: string[] = snapshot.val();
      // remove from list
      const newSponsorsList = sponsorsList.filter((sponsor) => {
        return sponsor !== sponsorId;
      });

      // Update with new List
      db.ref("private/sponsors/brackets")
        .child(bracketId)
        .child("sponsorsBoardList")
        .set(newSponsorsList);

      // Remove sponsor from bracket sponsors
      db.ref("private/sponsors/brackets")
        .child(bracketId)
        .child("bracketSponsors")
        .child(sponsorId)
        .remove();
      // update sponsor in inventory with blank bracket
      db.ref("private/sponsors/inventory")
        .child(sponsorId)
        .child("level")
        .set("");
    });
};

/**
 * Deletes entire bracket, and replaces all sponsors with no bracket assigned
 * @param bracketId
 * @param sponsorsItems
 */
const deleteBracket = (bracketId: string, sponsorsItems: string[]) => {
  // Update name information in each sponsor of bracket to ""
  sponsorsItems.forEach((sponsorId) => {
    db.ref("private/sponsors/inventory")
      .child(sponsorId)
      .child("level")
      .set("");
    db.ref("private/sponsors/brackets")
      .child(bracketId)
      .child("bracketSponsors")
      .child(sponsorId)
      .child("level")
      .set("");
  });

  // delete from bracket list
  db.ref("private/sponsors/bracketsList").child(bracketId).remove();
  // Delete from board
  db.ref("private/sponsors/brackets").child(bracketId).remove();
};

/**
 * Save bracket with newly edited information
 * @param bracketId
 * @param bracketInfo
 * @param sponsorsItems
 * @param setBracketModalOpen
 * @returns
 */
const saveBracket = (
  bracketId: string,
  bracketInfo: SponsorBracketListItem | null,
  sponsorsItems: string[],
  setBracketModalOpen: Function
) => {
  if (!bracketInfo) return;
  if (bracketId) {
    db.ref("private/sponsors/bracketsList").child(bracketId).set(bracketInfo);

    // Update name information in each sponsor of bracket
    sponsorsItems.forEach((sponsorId) => {
      db.ref("private/sponsors/inventory")
        .child(sponsorId)
        .child("level")
        .set(bracketInfo.name);

      db.ref("private/sponsors/brackets")
        .child(bracketId)
        .child("bracketSponsors")
        .child(sponsorId)
        .child("level")
        .set(bracketInfo.name);
    });
  } else db.ref("private/sponsors/bracketsList").push(bracketInfo); // create new
  setBracketModalOpen(false);
};

/**
 * Handler for the bracket information input text
 * @param value
 * @param setBracketInfo
 * @returns
 */
const bracketInputHandler = (value: string, setBracketInfo: Function) => {
  if (!value) return;
  setBracketInfo((state: SponsorBracketListItem) => ({
    ...state,
    name: value,
  }));
};

/**
 * hHandler for the bracket info slider of number of columns
 * @param value
 * @param setBracketInfo
 * @returns
 */
const bracketSliderHandler = (value: string, setBracketInfo: Function) => {
  if (!value) return;
  let numVal = parseInt(value);
  if (numVal === 5) numVal = 6;
  if (
    numVal === 7 ||
    numVal === 8 ||
    numVal === 9 ||
    numVal === 10 ||
    numVal === 11
  )
    numVal = 12;
  setBracketInfo((state: SponsorBracketListItem) => ({
    ...state,
    numColumns: numVal,
  }));
};

/**
 * Handler for the bracket info margins
 * @param value
 * @param key
 * @param setBracketInfo
 */
const bracketMarginHandler = (
  value: number,
  key: string,
  setBracketInfo: Function
) => {
  if (!value) value = 0;
  setBracketInfo((state: SponsorBracketsDB) => ({ ...state, [key]: value }));
};

/**
 * Handler for the bracket color picker
 * @param value
 * @param setBracketInfo
 */
const bracketColorHandler = (
  value: ColorPickerValue,
  setBracketInfo: Function
) => {
  setBracketInfo((state: SponsorBracketsDB) => ({ ...state, color: value }));
};

/**
 * Delete a season from the sponsor
 * @param season
 * @param sponsorInfo
 * @param setSponsorInfo
 */
const deleteSeason = (
  season: string,
  sponsorInfo: Sponsor,
  setSponsorInfo: Function
) => {
  const newSponsorInfo: Sponsor = {
    ...sponsorInfo,
  };

  delete newSponsorInfo.history![season];
  setSponsorInfo(newSponsorInfo);
};

/**
 * Adds a new season to the sponsor
 * @param sponsorInfo
 * @param setSponsorInfo
 * @returns
 */
const addNewSeason = (
  sponsorInfo: Sponsor | null,
  setSponsorInfo: Function
) => {
  if (!sponsorInfo) return;
  if (sponsorInfo.history && Object.keys(sponsorInfo.history)) {
    const seasons = Object.entries(sponsorInfo.history).map(
      ([season, _]) => season
    );
    let lastSeasonYear = seasons[seasons.length - 1].split("-")[1];
    const newSeason =
      lastSeasonYear + "-" + (parseInt(lastSeasonYear) + 1).toString();
    const newSponsorInfo: Sponsor = {
      ...sponsorInfo,
      history: { ...sponsorInfo.history, [newSeason]: 0 },
    };
    setSponsorInfo(newSponsorInfo);
  } else {
    const newSeason = "2014-2015";
    const newSponsorInfo: Sponsor = {
      ...sponsorInfo,
      history: { ...sponsorInfo.history, [newSeason]: 0 },
    };
    setSponsorInfo(newSponsorInfo);
  }
};

/**
 * Handler for the sponsor season value
 * @param value
 * @param seasonToEdit
 * @param sponsorInfo
 * @param setSponsorInfo
 */
const editSeasonValueHandler = (
  value: number,
  seasonToEdit: string,
  sponsorInfo: Sponsor,
  setSponsorInfo: Function
) => {
  if (!value) value = 0;
  const newSponsorInfo: Sponsor = {
    ...sponsorInfo,
    history: { ...sponsorInfo.history, [seasonToEdit]: value },
  };
  setSponsorInfo(newSponsorInfo);
};

/**
 * Handler for the sponsor season date
 * @param value
 * @param seasonToEdit
 * @param sponsorInfo
 * @param setSponsorInfo
 * @param setFocusInput
 */
const editSeasonHandler = (
  value: string,
  seasonToEdit: string,
  sponsorInfo: Sponsor,
  setSponsorInfo: Function,
  setFocusInput: Function
) => {
  value = value.replace("/", "-");

  // Copy the old season value to the newly edited season
  let sponsorValue = 0;
  if (sponsorInfo.history && Object.keys(sponsorInfo.history)) {
    if (sponsorInfo.history[value]) value = "____/____";
    if (sponsorInfo.history[seasonToEdit])
      sponsorValue = sponsorInfo.history[seasonToEdit];
  }

  const newSponsorInfo: Sponsor = {
    ...sponsorInfo,
    history: { ...sponsorInfo.history, [value]: sponsorValue },
  };

  delete newSponsorInfo.history![seasonToEdit];

  setSponsorInfo(newSponsorInfo);
  // since we are deleting the input, we need to auto focus on the new one for typing
  setFocusInput(value);
};

/**
 * Handler for the sponsor input text information
 * @param value
 * @param key
 * @param setSponsorInfo
 */
const sponsorInputHandler = (
  value: number | string,
  key: string,
  setSponsorInfo: Function
) => {
  setSponsorInfo((state: Sponsor) => ({ ...state, [key]: value }));
};

/**
 * Saves sponsors in the database
 * @param sponsorInfo
 * @param sponsorId
 * @param bracketid
 * @param setModalIsOpen
 * @returns
 */
const saveSponsor = (
  sponsorInfo: Sponsor | null,
  sponsorId: string,
  bracketid: string | undefined,
  setModalIsOpen: Function | null
) => {
  if (!sponsorInfo) return;
  // save in bracket
  if (bracketid)
    db.ref("private/sponsors/brackets")
      .child(bracketid)
      .child("bracketSponsors")
      .child(sponsorId)
      .set(sponsorInfo);
  // save in inventory
  if (sponsorId !== "createNew") {
    db.ref("private/sponsors/inventory").child(sponsorId).set(sponsorInfo);
  } else db.ref("private/sponsors/inventory").push(sponsorInfo);
  if (setModalIsOpen) setModalIsOpen(false);
};

/**
 * Handler for the on drag start of sponsor
 * @param event
 * @param setActiveId
 */
const handleDragStart = (event: DragStartEvent, setActiveId: Function) => {
  setActiveId(event.active.id);
};

/**
 * Handler for the on sponsor drage end. It updates the database with a new order of
 * sponsors for the respective bracket
 * @param event
 * @param bracketId
 * @param setItems
 * @param setActiveId
 */
const handleDragEnd = (
  event: DragEndEvent,
  bracketId: string,
  setItems: Function,
  setActiveId: Function
) => {
  const { active, over } = event;

  if (active.id !== over!.id) {
    setItems((items: string[]) => {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over!.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);
      db.ref("private/sponsors/brackets")
        .child(bracketId)
        .child("sponsorsBoardList")
        .set(newOrder);
      // return newOrder;
    });
  }

  setActiveId(null);
};

/**
 * Handler on cancel drag of sponsor
 * @param setActiveId
 */
const handleDragCancel = (setActiveId: Function) => {
  setActiveId(null);
};

/**
 * Retrieves all existing sponsor brackets
 * @param setBrackets
 */
const getAllSponsorBrackets = (setBrackets: Function) => {
  db.ref("private/sponsors/bracketsList").on("value", (snapshot) => {
    const sponsorBrackets: SponsorBracketListItem = snapshot.val();
    if (!sponsorBrackets) return;
    setBrackets(
      Object.entries(sponsorBrackets).sort((a, b) => {
        let bracketA = a[1];
        let bracketB = b[1];

        if (bracketA.topMargin > bracketB.topMargin) return -1;
        if (bracketA.topMargin < bracketB.topMargin) return 1;
        return 0;
      })
    );
  });
};

/**
 * Retrieves sponsor list order from respective bracket
 * @param bracketId
 * @param setSponsorsItems
 * @param setSponsorsObj
 */
const getSponsorsListFromBrackets = (
  bracketId: string,
  setSponsorsItems: Function,
  setSponsorsObj: Function
) => {
  db.ref("private/sponsors/brackets")
    .child(bracketId)
    .on("value", (snapshot) => {
      const sponsorBracket: SponsorBracketsDB = snapshot.val();
      if (!sponsorBracket) {
        setSponsorsItems([]);
        return;
      } else {
        if (!sponsorBracket.sponsorsBoardList) setSponsorsItems([]);
        else setSponsorsItems(sponsorBracket.sponsorsBoardList);

        if (!sponsorBracket.bracketSponsors) setSponsorsObj({});
        else setSponsorsObj(sponsorBracket.bracketSponsors);
      }
      // setSponsorsItems(sponsorsList);
    });
};

/**
 * Replaces the values of width or height of the svg string with 100%
 * @param s
 * @param toReplace
 * @returns
 */
const replaceSVGWidthAndHeight = (s: string, toReplace: string) => {
  let wIdx = s.indexOf(toReplace) + toReplace.length;
  // split the string into two substrings, to replace the width
  let wSubString = s.substring(0, wIdx);
  let wRest = s.substring(wIdx);
  // find the closing " of the width="..."
  let wClosingIdx = wRest.indexOf(`"`);
  let finalWSub = wRest.substring(wClosingIdx);
  // add the width 100%
  wSubString += `100%` + finalWSub;
  // find the next "
  return wSubString;
};

/**
 * Returns all indexes of linear gradients in svg string
 * @param s
 * @returns
 */
const getStringMatches = (s: string, expr: string) => {
  // Find all linear gradients indexes in svg string

  let regexp = /<linearGradient id=/g;
  if (expr === "image") regexp = /<image id=/g;
  if (expr === "pattern") regexp = /<pattern id=/g;
  let match,
    matches = [];

  while ((match = regexp.exec(s)) != null) {
    matches.push(match.index);
  }
  return matches;
};

/**
 * Replaces all linear gradients id, with a unique identifier, so that all id's among
 * all svgs are unique and different, otherwise the colors will get mixed
 * @param s
 * @returns
 */
const replaceLinearGradients = (s: string, toFind: string, expr = "linear") => {
  let matches = getStringMatches(s, expr);
  // For each linear gradient, replace the id with a unique identifier
  matches.forEach((_, idx) => {
    // We need to do this for every occurrence, because each time we change the id, the
    // next indexes change
    let moreMatches = getStringMatches(s, expr);
    let matchIdx = moreMatches[idx];
    let subStr = s.substring(matchIdx + toFind.length);

    // Get the linear gradient Id
    let closureIdx = subStr.indexOf(`"`);
    let linearid = subStr.substring(0, closureIdx);
    // replace all linearId occurrences in svg, with a unique identifier
    s = s.replaceAll(linearid, uuid());
  });
  return s;
};

/**
 * Builds sponsor seasons chart to display on modal
 * @param data
 * @param retroActives
 * @param setChartSeries
 * @param setChartLabels
 * @returns
 */
const buildSponsorGraph = (
  data: SponsorHistory | undefined,
  retroActives: number[],
  setChartSeries: Function,
  setChartLabels: Function
) => {
  if (!data) return;

  const labels = Object.entries(data).map(([season, _]) => season);

  const { simpleValues, retroValues } = calculateRetroActives(
    data,
    retroActives
  );

  setChartSeries([
    { name: "Value", data: [...simpleValues] },
    { name: "RetroActives", data: [...retroValues] },
  ]);
  setChartLabels([...labels]);
};

/**
 * Calculates sponsor retroActives based on all seasons data and specified retroActives values
 * @param data
 * @param retroActives
 * @returns
 */
const calculateRetroActives = (
  data: SponsorHistory | undefined,
  retroActives: number[]
) => {
  if (!data) return { simpleValues: [], retroValues: [] };
  const simpleValues = Object.entries(data).map(([_, value]) => value);
  // Build retroactives array
  const retroValues = new Array(simpleValues.length).fill(0);

  for (let i = simpleValues.length - 1; i > 0; i--) {
    let retroSum = 0;
    for (let j = 0; j < retroActives.length; j++) {
      if (i - j < 0) break;
      if (simpleValues[i - j] === 0) break;
      if (retroActives[j] !== 1)
        retroSum += simpleValues[i - j] * retroActives[j];
    }
    retroValues[i] = retroSum;
  }
  return { simpleValues: simpleValues, retroValues: retroValues };
};

/**
 * Retrieves retroActives values from database
 * @param setRetroValues
 */
const getRetroActives = (setRetroValues: Function) => {
  db.ref("private/sponsors/retroActives").on("value", (snapshot) => {
    const retroVals: number[] = snapshot.val();
    if (!retroVals) setRetroValues([]);
    setRetroValues(retroVals);
  });
};

/**
 * Retrieve all sponsors from existing inventory in database
 * @param setSponsors
 * @param setExistingBrackets
 */
const getInventorySponsors = (
  setSponsors: Function,
  setExistingBrackets: Function
) => {
  db.ref("private/sponsors/inventory").on("value", (snapshot) => {
    const allSponsors: SponsorsOrder = snapshot.val();

    if (!allSponsors) return;

    // order by name
    const sortedSponsors = Object.entries(allSponsors).sort((a, b) => {
      let sponsorNameA = a[1].name;
      let sponsorNameB = b[1].name;

      if (sponsorNameA > sponsorNameB) return 1;
      if (sponsorNameA < sponsorNameB) return -1;
      return 0;
    });
    setSponsors(sortedSponsors);
  });
  db.ref("private/sponsors/bracketsList").on("value", (snapshot) => {
    const allBrackets: SponsorBracketsDB = snapshot.val();
    if (allBrackets) setExistingBrackets(allBrackets);
  });
};

/**
 * Retrieves bracketId based on sponsor info bracket name
 * @param sponsorInfo
 * @param existingBrackets
 * @param setCurrBracketId
 */
const getMatchingBracketId = (
  sponsorInfo: Sponsor,
  existingBrackets: SponsorBracketsListDB | undefined,
  setCurrBracketId: Function
) => {
  let bracketidToUpdate = undefined;
  if (existingBrackets)
    Object.entries(existingBrackets).forEach(([bracketId, bracket]) => {
      if (bracket.name === sponsorInfo.level) {
        bracketidToUpdate = bracketId;
        return;
      }
    });
  setCurrBracketId(bracketidToUpdate);
};

/**
 * Retrieves and builds an svg string from existing svg url on server
 * @param svgPath
 * @param setSvgString
 * @returns
 */
const getSvgStringFromPath = async (
  svgPath: string | undefined,
  setSvgString: Function
) => {
  if (!svgPath) return "";

  var myHeaders = new Headers();
  myHeaders.append("Cookie", "BACKENDID=backend_38pIL_omega04|YWtMs|YWtMs");

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  fetch(svgPath.replace("https", "http"), requestOptions)
    .then(async (response) => ({ ok: response.ok, txt: await response.text() }))
    .then((result) => {
      if (result.ok) {
        let s = replaceSVGWidthAndHeight(result.txt, `width="`);
        s = replaceSVGWidthAndHeight(s, `height="`);
        s = replaceLinearGradients(s, `<linearGradient id="`);
        s = replaceLinearGradients(s, `<image id="`, "image");
        s = replaceLinearGradients(s, `<pattern id="`, "pattern");
        setSvgString(s);
      } else {
        setSvgString(" ");
      }
    })
    .catch((error) => setSvgString("Logo to Upload"));
};

type UploadResponse = {
  error: boolean;
  msg: string;
};

/**
 * Uploads SVG file to server
 * @param filesList
 * @param sponsorInfo
 * @param sponsorId
 * @param bracketId
 * @param fileToDelete
 * @param logoType
 * @param setFileValue
 * @param setSponsorInfo
 * @returns
 */
const uploadSponsorSvgToServer = (
  filesList: FileList,
  sponsorInfo: Sponsor | null,
  sponsorId: string,
  bracketId: string | undefined,
  fileToDelete: string | undefined,
  logoType: "svgPath" | "logoWhite" | "logoBlack",
  userId: string | undefined,
  setFileValue: Function,
  setSponsorInfo: Function
) => {
  if (!filesList.length || !sponsorId || !sponsorInfo || !userId) return;
  // let headers = new Headers();
  // headers.append("Origin", "http://localhost:3005");

  var data = new FormData();
  data.append("sponsorId", sponsorId);
  data.append("fileToUpload", filesList[0]);
  data.append("fileToDelete", fileToDelete ? fileToDelete : "");
  data.append("allowedLogoType", logoType);
  data.append("userId", userId);

  fetch(
    "https://tecnicosolarboat.tecnico.ulisboa.pt/api/receiveAndSaveFile.php",
    {
      method: "POST",
      body: data,
    }
  )
    .then(function (res) {
      return res.json();
    })
    .then((r: UploadResponse) => {
      if (!r.error) {
        let urlPath = r.msg;
        const newSponsorInfo = { ...sponsorInfo, [logoType]: urlPath };
        setSponsorInfo(newSponsorInfo);
        saveSponsor(newSponsorInfo, sponsorId, bracketId, null);
        setFileValue(null);
        toastrMessage("File uploaded.", "success");
      } else {
        toastrMessage("Error sending file to server.", "error");
      }
    });
};

/**
 * Downloads respectie sponsor file
 * @param url
 * @param name
 * @returns
 */
const downloadSponsorFile = (url: string | undefined, name: string) => {
  if (!url) return;
  let filename = url.split("/").pop();
  if (!filename) return;
  axios
    .get(url, {
      responseType: "blob",
    })
    .then((res) => {
      // @ts-ignore
      fileDownload(res.data, filename);
    });
};

/**
 * Publishes a bracket to public database with all respective sponsors order and information
 * @param bracketId
 * @param bracketInfo
 * @param bracket
 */
const publishBracketToWebsite = (
  bracketId: string,
  bracketInfo: SponsorBracketListItem,
  bracket: SponsorBracket
) => {
  const newSponsorObject: SponsorsOrderPublic = {};
  Object.entries(bracket.bracketSponsors).forEach(([sponsorId, sponsor]) => {
    // Build a sponsor with public information (remove values and history)
    let newSponsorInfo: SponsorPublic = {
      name: sponsor.name,
      svgPath: sponsor.svgPath,
      url: sponsor.url,
    };
    newSponsorObject[sponsorId] = newSponsorInfo;
  });
  // Publish bracket
  const publicBracket: SponsorBracketPublic = {
    ...bracketInfo,
    sponsorsBoardList: bracket.sponsorsBoardList,
    bracketSponsors: { ...newSponsorObject },
  };

  // Publish public bracket to public database
  db.ref("public/officialWebsite/sponsors/brackets")
    .child(bracketId)
    .set(publicBracket)
    .catch((err) => {
      if (err)
        toastrMessage(
          `An error occurred while publishing ${bracketInfo.name}`,
          "error"
        );
    });
};

/**
 * Retrieves last publishing date of sponsors to website
 * @param setLastChangeDate
 */
const getLastEditionDate = (setLastChangeDate: Function) => {
  db.ref("public/officialWebsite/sponsors/lastChange").on(
    "value",
    (snapshot) => {
      const lastChangeTimestamp: number = snapshot.val();
      if (!lastChangeTimestamp) return;
      const lastChangeDate = dateToString(lastChangeTimestamp, true);
      setLastChangeDate(lastChangeDate);
    }
  );
};

/**
 * Updates new publish date to website, on the database
 */
const publishLastChangeDate = () => {
  const lastChangeTimeStamp = new Date().getTime();
  db.ref("public/officialWebsite/sponsors/lastChange").set(lastChangeTimeStamp);
};

/**
 * Publishes all sponsor brackets to public website database
 * @param existingBrackets
 * @returns
 */
const publishSponsorsToWebsite = async (
  existingBrackets: SponsorBracketsListDB | undefined
) => {
  if (!existingBrackets) return;
  // remove existing from website
  await db
    .ref("public/officialWebsite/sponsors")
    .remove()
    .catch((err) => {
      if (err)
        toastrMessage(`An error occurred while replacing sponsors`, "error");
    });

  // Get all existing brackets with sponsors
  db.ref("private/sponsors/brackets")
    .once("value")
    .then((snapshot) => {
      const allBrackets: SponsorBracketsDB = snapshot.val();
      if (!allBrackets) return;
      Object.entries(allBrackets).forEach(([bracketId, bracket]) => {
        // For each bracket, publish to public db of sponsors
        publishBracketToWebsite(
          bracketId,
          existingBrackets[bracketId],
          bracket
        );
      });
      // Publish last edition timestamp
      publishLastChangeDate();
      toastrMessage(`Publishing sponsors to website complete.`, "success");
    });
};

export {
  handleDragCancel,
  handleDragEnd,
  handleDragStart,
  getAllSponsorBrackets,
  getSponsorsListFromBrackets,
  replaceLinearGradients,
  getStringMatches,
  replaceSVGWidthAndHeight,
  sponsorInputHandler,
  saveSponsor,
  sponsorChartOptions,
  buildSponsorGraph,
  editSeasonHandler,
  editSeasonValueHandler,
  addNewSeason,
  deleteSeason,
  calculateRetroActives,
  getRetroActives,
  bracketInputHandler,
  bracketSliderHandler,
  bracketMarginHandler,
  bracketColorHandler,
  saveBracket,
  sponsorSkeleton,
  getInventorySponsors,
  getSvgStringFromPath,
  uploadSponsorSvgToServer,
  downloadSponsorFile,
  getMatchingBracketId,
  bracketSkeleton,
  deleteBracket,
  removeSponsorFromBracket,
  addSponsorToBracket,
  updateSponsorDropdown,
  deleteSponsor,
  publishSponsorsToWebsite,
  getLastEditionDate,
};
