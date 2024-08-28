import { ColumnApi, GridApi, GridReadyEvent, RowClickedEvent } from "ag-grid-community";
import { ApexOptions } from "apexcharts";
import { Flow } from "../../interfaces";
import { dateToString, inputToDate } from "../../utils/generalFunctions";
import printDoc from "../../utils/pdfExport/printDoc";

/** Filters the table to show rows based on input text
 * @param  {event} e on change event of the input text
 * @param  {GridApi} gridApi ag grid grid Api of the table
 */
const filterTable = (e: React.ChangeEvent<HTMLInputElement>, gridApi: GridApi | null) => {
  if (!gridApi) return;
  gridApi.setQuickFilter(e.target.value);
};
/** Creates a filename for the table
 * @param  {string} tableTitle title of the table
 */
const exportedFilename = (tableTitle: string) => {
  const base = `TSB_Flow_${tableTitle}`;
  const year = new Date().getFullYear();
  return base + year;
};

/** Exports the table to an excel file
 * @param  {GridApi} gridApi ag-grid grid Api
 * @param  {ColumnApi} columnApi ag-grid column Api
 * @param  {string} tableTitle title of the table
 */
const excelExport = (gridApi: GridApi | null, tableTitle: string) => {
  if (!gridApi) return;
  gridApi.exportDataAsExcel({
    fileName: `${exportedFilename(tableTitle)}.xlsx`,
  });
};

/** Exports the table to the clipboard
 * @param  {GridApi} gridApi ag-grid grid Api
 */
const clipboardExport = (gridApi: GridApi | null) => {
  if (!gridApi) return;
  gridApi.selectAll();
  gridApi.copySelectedRowsToClipboard(true);
  gridApi.deselectAll();
};

/** Exports the table to a pdf file
 * @param  {string} tableTitle title of the table
 * @param  {GridApi} gridApi ag-grid grid Api
 * @param  {ColumnApi} columnApi ag-grid column Api
 */
const pdfExport = (tableTitle: string, gridApi: GridApi | null, columnApi: ColumnApi | null) => {
  printDoc(gridApi, columnApi, exportedFilename(tableTitle));
};

/** Gets the clicked flow data, and opens the modal with the corresponding data
 * @param  {RowClickedEvent} event ag grid parameters
 * @param  {Function} setFlowInfo flow info state function
 * @param  {Function} setModalOpen modal open state function
 * @param  {Function} setShowDeleteButton modal delete button state function
 */
const onRowClick = (
  event: RowClickedEvent,
  setFlowInfo: Function,
  setModalOpen: Function,
  setShowDeleteButton: Function,
) => {
  const flowData: Flow = event.data;
  setFlowInfo(flowData);
  setModalOpen(true);
  setShowDeleteButton(true);
};

/** Resizes the table to fit the data, and saves the grid api states
 * @param  {GridReadyEvent} params ag grid parameters
 * @param  {Function} setGridApi
 * @param  {Function} setColumnApi
 */
const onFirstDataRendered = (
  params: GridReadyEvent,
  setGridApi: Function,
  setColumnApi: Function,
) => {
  params.api.sizeColumnsToFit();
  // Initial sort by name
  params.columnApi.applyColumnState({
    state: [{ colId: "name", sort: "asc" }],
  });
  setGridApi(params.api);
  setColumnApi(params.columnApi);
};

/** Closes the modal and resets the flow info
 * @param  {Function} setModalOpen modal open state function
 * @param  {Function} setShowDeleteButton deletebutton state function
 */
const closeFlowModal = (setModalOpen: Function, setShowDeleteButton: Function) => {
  setModalOpen(false);
  setShowDeleteButton(false);
};

/** Opens the modal with respective clear flow info
 * @param  {Function} setModalOpen modal open state function
 * @param  {Function} setFlowInfo flow info state function
 * @param  {string} tableTitle title of the table
 */
const openFlowModal = (setModalOpen: Function, setFlowInfo: Function, tableTitle: string) => {
  const today = new Date();

  const todayDate = dateToString(today);
  setFlowInfo({
    description: "",
    date: todayDate,
    entity: "",
    value: "",
    account: tableTitle,
    type: "Expense",
  });
  setModalOpen(true);
  //   setCurrEventKey("");
  //   setShowDeleteEvent(false);
};

/** Creates an empty array with a step interval
 * @param  {number} start start date timestamp
 * @param  {number} end end at timestamp
 * @param  {number} step interval of values
 */
const createDateIntervals = (start: number, end: number, step: number) => {
  const len = Math.floor((end - start) / step) + 1;
  const arr1 = Array(len)
    .fill(0)
    .map((_, idx) => [start + idx * step, 0]);
  return arr1;
};

/** Creates a new array filling the missing dates between days wit the
respective cumulative value
 * @param  {[number, number][]} chartData [timestamp, cumSum]
 * @param  {number} start start date timestamp
 * @param  {number} chartData start date timestamp
 */
const createArrayBetweenDates = (chartData: [number, number][], start: number, end: number) => {
  // create a copy of the object
  // let newChartData = JSON.parse(JSON.stringify(chartData));
  //   create an array with intervals of one day in milliseconds
  const dateArray = createDateIntervals(start, end, 86400000);
  //   last element of array
  const arrLen = chartData.length - 1;
  let x = arrLen;

  for (let i = 0; i < dateArray.length; i++) {
    if (x > 0) {
      if (dateArray[i][0] >= chartData[x][0] && dateArray[i][0] < chartData[x - 1][0]) {
        //   if date is between existing values
        dateArray[i][1] = parseFloat(Number(chartData[x][1]).toFixed(2));
      } else if (dateArray[i][0] === chartData[x - 1][0]) {
        //   if the date is equal to the next value
        // decrease to the next target (equal dates may exist)
        x -= 1;
        if (x - 1 >= 0) {
          // while we do not reach the nex ttarget, decrease x
          while (chartData[x][0] === chartData[x - 1][0]) {
            x -= 1;
            if (x - 1 < 0) {
              break;
            }
          }
          //   store the value
          dateArray[i][1] = parseFloat(Number(chartData[x][1]).toFixed(2));
        }
        dateArray[i][1] = parseFloat(Number(chartData[x][1]).toFixed(2));
      } else if (dateArray[i][0] < chartData[x][0]) {
        //   if we haven't reached the target, it's zero
        dateArray[i][1] = 0;
      }
    } else if (x === 0) {
      // if there are no more targets, ore only one target exists
      if (dateArray[i][0] < chartData[0][0]) {
        //   if we haven't reached the target
        if (i - 1 >= 0) {
          // if there is more than one target, it's equal to the previous one
          dateArray[i][1] = dateArray[i - 1][1];
        } else {
          // if only one target, and we haven't reached it yet, then it's zero
          dateArray[i][1] = 0;
        }
      } else {
        // if we are above and equal the target, it's equal to the last (first) value
        dateArray[i][1] = chartData[0][1];
      }
    }
  }

  return dateArray;
};

/** Creates a new array with the date and respective cumulative value
 * @param  {[string, Flow, number][]} flowData [flowID, Flow, cumSum]
 */
const getCumSumAndTime = (flowData: [string, Flow, number][]) => {
  const data: [number, number][] = [];
  for (let i = 0; i < flowData.length; i++) {
    const val = flowData[i][2]; // respective cumulative sum
    const d = inputToDate(flowData[i][1].date).getTime();
    data.push([d, val]);
  }
  return data;
};

/** Calculates the cummulative sum based on the date
 * @param  {[string, Flow, number][]} flowData [flowID, Flow, cumSum]
 */
const cumulativeSum = (sortedFlowData: [string, Flow, number][]) => {
  const multiplier = { Expense: -1, Income: 1 };
  // We need to make copies of the Object, fuck this shit.
  //   Otherwise it's just a reference to the original object
  // Calculate cumulative sum
  const flowsLength = sortedFlowData.length - 1; // Last element remains the same
  // start from last Element, last date
  for (let flowIdx = flowsLength; flowIdx >= 0; flowIdx--) {
    const currFlow = sortedFlowData[flowIdx][1];
    let currCumSum = sortedFlowData[flowIdx][2];

    // If first element, it's equal to its value
    if (flowIdx === flowsLength) {
      currCumSum =
        multiplier[currFlow.type] *
        parseFloat(currFlow.value.replace(" €", "").replaceAll(",", ""));
    } else {
      const prevCumSUm = sortedFlowData[flowIdx + 1][2];
      currCumSum =
        prevCumSUm +
        multiplier[currFlow.type] *
          parseFloat(currFlow.value.replace(" €", "").replaceAll(",", ""));
    }
    sortedFlowData[flowIdx][2] = currCumSum;
  }
  return sortedFlowData;
};

/** Sorts the flows by date
 * @param  {[string, Flow, number][]} flowData [flowID, Flow, cumSum]
 */
const sortFlowsByDate = (flowData: [string, Flow, number][]) => {
  //   let toSort = JSON.parse(JSON.stringify(data));
  flowData.sort((a, b) => {
    const flowA = a[1];
    const flowB = b[1];
    const dateA = inputToDate(flowA.date);
    const dateB = inputToDate(flowB.date);
    if (dateA < dateB) return 1;
    if (dateA > dateB) return -1;
    return 0;
  });
  return flowData;
};

const apexChartOptions: ApexOptions = {
  series: [
    {
      name: "Total",
      data: [],
    },
    {
      name: "Bank",
      data: [],
    },
    {
      name: "IDMEC",
      data: [],
    },
  ],
  chart: {
    id: "area-datetime",
    height: 350,
    zoom: {
      autoScaleYaxis: true,
    },
  },
  stroke: {
    show: true,
    width: 2,
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 0,
  },
  xaxis: {
    type: "datetime",
    tooltip: {
      enabled: false,
    },
    //   min: chartData[0][0],
    //   tickAmount: 6,
  },
  tooltip: {
    x: {
      format: "dd MMM yyyy",
    },
    y: {
      formatter: (value: number) => `${Number(value).toFixed(2)} €`,
    },
  },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 100],
    },
  },
  title: {
    text: "Técnico Solar Boat Balance",
  },
};

export {
  filterTable,
  excelExport,
  clipboardExport,
  pdfExport,
  onRowClick,
  onFirstDataRendered,
  apexChartOptions,
  sortFlowsByDate,
  createDateIntervals,
  createArrayBetweenDates,
  getCumSumAndTime,
  cumulativeSum,
  closeFlowModal,
  openFlowModal,
};
