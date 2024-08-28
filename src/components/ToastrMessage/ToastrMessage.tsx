type Props = {
  title: string;
  msg: string;
  type: string;
};
const ToastrMessage = ({ title, msg, type }: Props) => {
  const toastrIcon = (type: string) => {
    if (type === "info") {
      return "fas fa-info-circle";
    }
    if (type === "success") {
      return "fas fa-check";
    }
    if (type === "warning") {
      return "fas fa-exclamation-triangle";
    }
    if (type === "error") {
      return "fas fa-times";
    }
  };

  return (
    <div className="row">
      <div className="col-2 text-center">
        <div className="fsize-5">
          <i className={toastrIcon(type)}></i>
        </div>
      </div>
      <div className="col">
        <div className="toast-title">{title}</div>
        <div className="toast-message">{msg}</div>
      </div>
    </div>
  );
};

export default ToastrMessage;
