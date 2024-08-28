import parse from "html-react-parser";
import { useEffect, useState } from "react";
import { Spinner } from "react-rainbow-components";
import { getSvgStringFromPath } from "./sponsorsUtils";
type Props = {
  svgPath: string | undefined;
};

const SponsorImage = ({ svgPath }: Props) => {
  const [svgString, setSvgString] = useState("");

  useEffect(() => {
    getSvgStringFromPath(svgPath, setSvgString);
  }, [svgPath]);

  if (!svgPath) return null;
  if (!svgString) return <Spinner size="large" type="arc" variant="brand" />;

  //   const jsxEl = parse(s) as JSX.Element;

  return <div className="sponsor-content">{parse(svgString)}</div>;
};

export default SponsorImage;
