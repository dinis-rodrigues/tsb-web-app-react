import { useState } from "react";
import dinisAvatar from "../../assets/images/altcomp.png";
import dinisFullAvatar from "../../assets/images/alt.png";

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
        // console.log("On Error");
        compressed ? setImage(dinisAvatar) : setImage(dinisFullAvatar);
      }}
    ></img>
  );
};

export default ImageContainer;
