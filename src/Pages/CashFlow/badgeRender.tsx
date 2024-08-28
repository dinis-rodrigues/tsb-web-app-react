import { ICellRendererParams } from "ag-grid-community";

const BadgeRender = (props: ICellRendererParams) => {
  const cellValue: string = props.valueFormatted ? props.valueFormatted : props.value;

  return cellValue === "Income" ? (
    <span className="badge badge-pill badge-success">Income</span>
  ) : (
    <span className="badge badge-pill badge-danger">Expense</span>
  );
};

export default BadgeRender;
