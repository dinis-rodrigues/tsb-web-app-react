import { useState } from "react";
import altUserImg from "../../assets/images/altUserImg.png";
import altUserImgComp from "../../assets/images/altUserImgComp.png";

type Props = {
  imageSrc: string;
  classNames?: string;
  width?: number | undefined;
  id?: string;
  compressed?: boolean;
};

const ImageContainer = ({
  imageSrc,
  classNames = "",
  width = undefined,
  id = "",
  compressed = true,
}: Props) => {
  const [image, setImage] = useState(imageSrc);
  // useEffect(() => {
  //   setImage(imageSrc);
  // }, [imageSrc]);
  return (
    <img
      alt={""}
      id={id}
      className={classNames}
      width={width && width}
      src={image}
      onError={() => {
        compressed ? setImage(altUserImgComp) : setImage(altUserImg);
      }}
    ></img>
  );
};

export default ImageContainer;
