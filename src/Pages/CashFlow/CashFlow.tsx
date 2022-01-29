// Table

import "ag-grid-enterprise";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import "ag-grid-community/dist/styles/ag-theme-alpine-dark.css";

import { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { Flow, FlowDB, tableFlowData } from "../../interfaces";
import CashFlowTable from "./CashFlowTable";
import {
  apexChartOptions,
  closeFlowModal,
  createArrayBetweenDates,
  cumulativeSum,
  getCumSumAndTime,
  sortFlowsByDate,
} from "./cashFlowUtils";
import Chart from "react-apexcharts";
import CashFlowModal from "./CashFlowModal";
import { useAuth } from "../../contexts/AuthContext";
import { off, onValue, ref } from "firebase/database";

/** Creates the necessary arrays to build the cummulative sum arrays for the graph
 * @param  {FlowDB} flowDb flows from database
 */
const processFlows = (
  flowDb: FlowDB,
  tableFlow: tableFlowData,
  setChartSeries: Function,
  setTableFlow: Function
) => {
  let flowData: [string, Flow, number][] = [];
  let flowDataBank: [string, Flow, number][] = [];
  let flowDataIDMEC: [string, Flow, number][] = [];

  // Foreach is synchronous! Best thing ever
  Object.entries(flowDb).forEach(([flowId, flow]) => {
    // // Store data in it's entirety
    flowData.push([flowId, flow, 0]); // 0 is for the cummulative sum

    // Separate data into accounts
    if (flow.account === "IDMEC") {
      flowDataIDMEC.push([flowId, flow, 0]);
    } else {
      flowDataBank.push([flowId, flow, 0]);
    }
  });
  // Sort by most recent date, cumulative sum, fill and initialize table
  let sortedFlowData = sortFlowsByDate(flowData);
  let sortedFlowDataBank = sortFlowsByDate(flowDataBank);
  let sortedFlowDataIDMEC = sortFlowsByDate(flowDataIDMEC);
  // Calculate cumulative sum
  let summedFlowData = cumulativeSum(sortedFlowData);
  let summedFlowDataBank = cumulativeSum(sortedFlowDataBank);
  let summedFlowDataIDMEC = cumulativeSum(sortedFlowDataIDMEC);

  //   Create a new array with timestamps and cumsum values
  var TotalCumSumTime = getCumSumAndTime(summedFlowData);
  var BankCumSumTime = getCumSumAndTime(summedFlowDataBank);
  var IdmecCumSumTime = getCumSumAndTime(summedFlowDataIDMEC);
  // (We previously reversed the array ) -> last element is the oldest date
  var start = TotalCumSumTime[TotalCumSumTime.length - 1][0]; // first date
  var end = TotalCumSumTime[0][0]; // last date timestamp

  // Fill date gaps with cum sum
  let chartData = createArrayBetweenDates(TotalCumSumTime, start, end);
  let chartDataBank = createArrayBetweenDates(BankCumSumTime, start, end);
  let chartDataIDMEC = createArrayBetweenDates(IdmecCumSumTime, start, end);
  setChartSeries([
    { name: "Total", data: chartData },
    { name: "Bank", data: chartDataBank },
    { name: "IDMEC", data: chartDataIDMEC },
  ]);
  setTableFlow({
    ...tableFlow,
    bank: summedFlowDataBank,
    idmec: summedFlowDataIDMEC,
  });
};

const CashFlow = () => {
  const { isDarkMode } = useAuth();
  // Graph state
  const [chartSeries, setChartSeries] = useState([
    { name: "total", data: [] },
    { name: "bank", data: [] },
    { name: "idmec", data: [] },
  ]);
  const [tableFlow, setTableFlow] = useState<tableFlowData>({
    bank: [],
    idmec: [],
  });
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [flowInfo, setFlowInfo] = useState<Flow | null>(null);
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  useEffect(() => {
    onValue(ref(db, "private/finances/flow"), (snapshot) => {
      if (!snapshot.val()) return;
      processFlows(snapshot.val(), tableFlow, setChartSeries, setTableFlow);
    });
    return () => {
      off(ref(db, "private/finances/flow"));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="app-main__outer">
      <div className="app-main__inner">
        <div className="tab-content">
          <div className="row">
            <div className="col-md-12">
              <div className="main-card mb-3 card p-20">
                <div className="card-body">
                  <Chart
                    options={{
                      ...apexChartOptions,
                      theme: { mode: isDarkMode ? "dark" : "light" },
                    }}
                    series={chartSeries}
                    type="area"
                    width="100%"
                    height="350"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {
          <CashFlowTable
            tableTitle={"Santander"}
            tableFlow={tableFlow.bank}
            setModalOpen={setModalOpen}
            setFlowInfo={setFlowInfo}
            setShowDeleteButton={setShowDeleteButton}
          />
        }
        {
          <CashFlowTable
            tableTitle={"IDMEC"}
            tableFlow={tableFlow.idmec}
            setModalOpen={setModalOpen}
            setFlowInfo={setFlowInfo}
            setShowDeleteButton={setShowDeleteButton}
          />
        }
      </div>
      {
        <CashFlowModal
          isModalOpen={modalOpen}
          setFlowInfo={setFlowInfo}
          showDeleteButton={showDeleteButton}
          flowInfo={flowInfo}
          closeModal={() => {
            closeFlowModal(setModalOpen, setShowDeleteButton);
          }}
        />
      }
    </div>
  );
};

export default CashFlow;
