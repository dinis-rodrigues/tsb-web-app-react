import { useEffect, useState } from "react";
import { Modal, Button, DatePicker } from "react-rainbow-components";
import { useAuth } from "../../contexts/AuthContext";
import { GalleryItem } from "../../interfaces";
import { inputToDate } from "../../utils/generalFunctions";
import {
  createGallery,
  deleteAlbum,
  galleryDateInputHandler,
  galleryDescriptionInputHandler,
  galleryNameInputHandler,
} from "./galleryUtils";

type Props = {
  galleryInfo: GalleryItem | undefined;
  activeGallery: string;
  editGallery: boolean;
  setGalleryInfo: Function;
  isModalOpen: boolean;
  setIsModalOpen: Function;
};

const CreateGalleryModal = ({
  galleryInfo,
  editGallery,
  activeGallery,
  isModalOpen,
  setIsModalOpen,
}: Props) => {
  const { USER, isDarkMode } = useAuth();
  const [modalInfo, setModalInfo] = useState<GalleryItem>();

  useEffect(() => {
    if (editGallery) setModalInfo(galleryInfo);
    else
      setModalInfo({
        name: "",
        timestamp: new Date().getTime(),
        description: "",
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  const today = new Date();
  return (
    <Modal
      className={
        isDarkMode ? "app-theme-dark app-modal-dark" : "app-theme-white"
      }
      isOpen={isModalOpen}
      size="medium"
      title={editGallery ? "Edit Album" : "Create Album"}
      onRequestClose={() => setIsModalOpen(false)}
      style={{ overflow: "hidden" }}
      footer={
        <div className="row">
          <div className="col">
            {editGallery && (
              <Button
                className={"m-1"} // margin
                variant="destructive"
                label="Delete from Database"
                onClick={() => {
                  deleteAlbum(activeGallery, USER?.id, setIsModalOpen);
                }}
              />
            )}
          </div>
          <div className="col">
            <div className="float-right">
              <Button label="Cancel" onClick={() => setIsModalOpen(false)} />

              <Button
                variant="brand"
                label={editGallery ? "Save" : "Create"}
                onClick={() =>
                  createGallery(
                    modalInfo,
                    activeGallery,
                    editGallery,
                    setIsModalOpen
                  )
                }
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
              <strong> Name</strong>
            </span>
          </label>

          <input
            value={modalInfo ? modalInfo.name : ""}
            onChange={(e) =>
              galleryNameInputHandler(e.target.value, setModalInfo)
            }
            type="text"
            className="form-control m-0 text-center"
            placeholder=""
          />
        </div>
        <div className="col">
          <label>
            <span className="text-dark small text-uppercase">
              <i className="fas fa-quote-right"></i>
              <strong> Date</strong>
            </span>
          </label>

          <DatePicker
            value={modalInfo ? inputToDate(modalInfo.timestamp!) : today}
            onChange={(value) => galleryDateInputHandler(value, setModalInfo)}
            className={"datePicker"}
          />
        </div>
      </div>
      <div className="form-group row text-center">
        <div className="col">
          <label>
            <span className="text-dark small text-uppercase">
              <i className="fas fa-quote-right"></i>
              <strong> Description</strong>
            </span>
          </label>

          <input
            value={modalInfo ? modalInfo.description : ""}
            onChange={(e) =>
              galleryDescriptionInputHandler(e.target.value, setModalInfo)
            }
            type="text"
            className="form-control m-0 text-center"
            placeholder="Optional"
          />
        </div>
      </div>
    </Modal>
  );
};

export default CreateGalleryModal;
