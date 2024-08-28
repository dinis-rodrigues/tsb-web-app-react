import { Button, Modal } from "react-rainbow-components";
import { useAuth } from "../../contexts/AuthContext";
import { GalleryPhoto } from "../../interfaces";
import { deletePhoto, photoInputHandler, saveEditedPhoto } from "./galleryUtils";

type Props = {
  imgInfo: GalleryPhoto | undefined;
  imgId: string;
  activeGallery: string;
  isModalOpen: boolean;
  setIsModalOpen: Function;
  setImgInfo: Function;
};

const EditPhotoModal = ({
  imgInfo,
  imgId,
  isModalOpen,
  activeGallery,
  setIsModalOpen,
  setImgInfo,
}: Props) => {
  const { USER, isMarketingOrAdmin, isDarkMode } = useAuth();
  return (
    <Modal
      className={isDarkMode ? "app-theme-dark app-modal-dark" : "app-theme-white"}
      isOpen={isModalOpen}
      size="medium"
      title={"Edit Photo"}
      onRequestClose={() => setIsModalOpen(false)}
      style={{ overflow: "hidden" }}
      footer={
        <div className="row">
          <div className="col">
            {isMarketingOrAdmin && (
              <Button
                className={"m-1"} // margin
                variant="destructive"
                label="Delete from Database"
                onClick={() => {
                  deletePhoto(activeGallery, imgInfo?.imagePath, imgId, USER?.id, setIsModalOpen);
                }}
              />
            )}
          </div>
          <div className="col">
            <div className="float-right">
              <Button label="Cancel" onClick={() => setIsModalOpen(false)} />

              <Button
                variant="brand"
                label={"Save"}
                onClick={() => saveEditedPhoto(imgInfo, activeGallery, imgId, setIsModalOpen)}
              />
            </div>
          </div>
        </div>
      }
    >
      <div className="form-group row text-center">
        <div className="col">
          <label>
            <span className="text-dark small text-uppercase">
              <i className="fas fa-quote-right"></i>
              <strong> Description</strong>
            </span>
          </label>

          <input
            value={imgInfo ? imgInfo.description : ""}
            onChange={(e) => photoInputHandler(e.target.value, setImgInfo)}
            type="text"
            className="form-control m-0 text-center"
            placeholder=""
          />
        </div>
      </div>
    </Modal>
  );
};

export default EditPhotoModal;
