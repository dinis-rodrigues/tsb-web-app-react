import { useState } from "react";
import dinisAvatar from "../../assets/images/altcomp.png";

type Props = {
  imageSrc: string;
};

const ImageContainer = ({ imageSrc }: Props) => {
  const [image, setImage] = useState(imageSrc);
  // useEffect(() => {
  //   setImage(imageSrc);
  // }, [imageSrc]);
  return (
    <img
      alt={""}
      src={image}
      onError={() => {
        // console.log("On Error");
        setImage(dinisAvatar);
      }}
    ></img>
  );
};

export default ImageContainer;
