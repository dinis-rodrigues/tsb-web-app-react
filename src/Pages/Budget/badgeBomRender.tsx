import { ICellRendererParams } from "ag-grid-community";

const BadgeBomRender = (props: ICellRendererParams) => {
  const cellValue: string = props.valueFormatted
    ? props.valueFormatted
    : props.value;

  return cellValue === "Acquired" ? (
    <span className="badge badge-pill badge-success">Acquired</span>
  ) : cellValue === "Required" ? (
    <span className="badge badge-pill badge-danger">Required</span>
  ) : cellValue === "In Progress" ? (
    <span className="badge badge-pill badge-warning">In Progress</span>
  ) : cellValue === "Sponsor" ? (
    <span className="badge badge-pill badge-info">Sponsor</span>
  ) : cellValue === "To Buy" ? (
    <span className="badge badge-pill badge-orange">To Buy</span>
  ) : (
    <span>"Format error"</span>
  );
};

export default BadgeBomRender;
