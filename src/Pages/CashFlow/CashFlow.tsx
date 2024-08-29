// Table

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-community/styles/ag-theme-alpine.min.css";
import "ag-grid-enterprise";

import { off, onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Flow, FlowDB, tableFlowData } from "../../interfaces";
import CashFlowModal from "./CashFlowModal";
import CashFlowTable from "./CashFlowTable";
import {
  apexChartOptions,
  closeFlowModal,
  createArrayBetweenDates,
  cumulativeSum,
  getCumSumAndTime,
  sortFlowsByDate,
} from "./cashFlowUtils";

/** Creates the necessary arrays to build the cummulative sum arrays for the graph
 * @param  {FlowDB} flowDb flows from database
 */
const processFlows = (
  flowDb: FlowDB,
  tableFlow: tableFlowData,
  setChartSeries: Function,
  setTableFlow: Function,
) => {
  const flowData: [string, Flow, number][] = [];
  const flowDataBank: [string, Flow, number][] = [];
  const flowDataIDMEC: [string, Flow, number][] = [];

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
  const sortedFlowData = sortFlowsByDate(flowData);
  const sortedFlowDataBank = sortFlowsByDate(flowDataBank);
  const sortedFlowDataIDMEC = sortFlowsByDate(flowDataIDMEC);
  // Calculate cumulative sum
  const summedFlowData = cumulativeSum(sortedFlowData);
  const summedFlowDataBank = cumulativeSum(sortedFlowDataBank);
  const summedFlowDataIDMEC = cumulativeSum(sortedFlowDataIDMEC);

  //   Create a new array with timestamps and cumsum values
  const TotalCumSumTime = getCumSumAndTime(summedFlowData);
  const BankCumSumTime = getCumSumAndTime(summedFlowDataBank);
  const IdmecCumSumTime = getCumSumAndTime(summedFlowDataIDMEC);
  // (We previously reversed the array ) -> last element is the oldest date
  const start = TotalCumSumTime[TotalCumSumTime.length - 1][0]; // first date
  const end = TotalCumSumTime[0][0]; // last date timestamp

  // Fill date gaps with cum sum
  const chartData = createArrayBetweenDates(TotalCumSumTime, start, end);
  const chartDataBank = createArrayBetweenDates(BankCumSumTime, start, end);
  const chartDataIDMEC = createArrayBetweenDates(IdmecCumSumTime, start, end);
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
