import {
  getSvgStringFromPath,
  replaceLinearGradients,
  replaceSVGWidthAndHeight,
} from "./sponsorsUtils";
import parse from "html-react-parser";
import { Spinner } from "react-rainbow-components";
import { useEffect, useState } from "react";
type Props = {
  svgPath: string | undefined;
};

const SponsorImage = ({ svgPath }: Props) => {
  const [svgString, setSvgString] = useState("");

  useEffect(() => {
    getSvgStringFromPath(svgPath, setSvgString);
  }, [svgPath]);

  if (!svgString) return <Spinner size="large" type="arc" variant="brand" />;

  //   const jsxEl = parse(s) as JSX.Element;

  return <div className="sponsor-content">{parse(svgString)}</div>;
};

export default SponsorImage;
