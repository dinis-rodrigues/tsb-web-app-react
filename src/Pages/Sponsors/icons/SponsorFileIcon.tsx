import cx from "classnames";
import { ReactComponent as AiIcon } from "./aiIcon.svg";
import { ReactComponent as EpsIcon } from "./epsIcon.svg";
import { ReactComponent as JpegIcon } from "./jpegIcon.svg";
import { ReactComponent as PdfIcon } from "./pdfIcon.svg";
import { ReactComponent as PngIcon } from "./pngIcon.svg";

type Props = {
  url: string;
  isFile?: boolean;
};

const SponsorFileIcon = ({ url, isFile = false }: Props) => {
  const errMsg = <span>Error retrieving file extension</span>;
  let filename = "";
  let fileExt = "";
  // @ts-ignore
  if (url) filename = url.split("/").pop();
  // @ts-ignore
  if (filename) fileExt = filename.split(".").pop();

  return (
    <>
      <div className="col">
        <span>{filename ? filename : errMsg}</span>
        <div className={cx({ "sponsor-content": !isFile, "file-content": isFile })}>
          {fileExt === "ai" ? (
            <AiIcon />
          ) : fileExt === "eps" ? (
            <EpsIcon />
          ) : fileExt === "jpg" ? (
            <EpsIcon />
          ) : fileExt === "pdf" ? (
            <PdfIcon />
          ) : fileExt === "png" ? (
            <PngIcon />
          ) : fileExt === "jpeg" ? (
            <JpegIcon />
          ) : (
            errMsg
          )}
        </div>
      </div>
    </>
  );
};

export default SponsorFileIcon;
