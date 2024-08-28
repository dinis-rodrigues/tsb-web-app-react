import { Button, UncontrolledTooltip } from "reactstrap";

const DashboardContent = () => {
  return (
    <div>
      Hello from dashboard!
      <div className="widget-content-right header-user-info ml-3">
        <Button className="btn-shadow p-1" size="sm" color="info" id="Tooltip-2">
          Hover me
        </Button>

        <UncontrolledTooltip placement="right" target={"Tooltip-2"}>
          Click for Toastify Notifications!
        </UncontrolledTooltip>
      </div>
    </div>
  );
};

export default DashboardContent;
