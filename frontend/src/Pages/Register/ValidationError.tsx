type Props = {
  msg: string;
};

const ValidationError = ({ msg }: Props) => {
  return (
    <em className="error invalid-feedback" style={{ display: "inline" }}>
      {msg}
    </em>
  );
};

export default ValidationError;
