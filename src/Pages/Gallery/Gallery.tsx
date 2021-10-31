import { Fragment, useEffect, useState } from "react";
import {
  GalleryAlbum,
  GalleryItem,
  GalleryPhoto,
  UploadingImages,
} from "../../interfaces";
import CreateGalleryModal from "./CreateGalleryModal";
import { FileSelector, ProgressBar } from "react-rainbow-components";
import SimpleReactLightbox, { SRLWrapper } from "simple-react-lightbox";
import {
  deletePhoto,
  getGalleryList,
  getGalleryPhotos,
  openCreateGalleryModal,
  openEditGalleryModal,
  openEditPhotoModal,
  uploadPhotosToServer,
} from "./galleryUtils";
import cx from "classnames";
import { db } from "../../config/firebase";
import { dateToString } from "../../utils/generalFunctions";
import EditPhotoModal from "./EditPhotoModal";

const Gallery = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [galleryInfo, setGalleryInfo] = useState<GalleryItem>();
  const [galleryList, setGalleryList] = useState<[string, GalleryItem][]>([]);
  const [activeGallery, setActiveGallery] = useState("");
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryAlbum>();
  const [activeGalleryDbRef, setActiveGalleryDbRef] = useState("");
  const [editGallery, setEditGallery] = useState(false);
  const [fileValue, setFileValue] = useState<FileList | undefined>();
  const [imgInfo, setImgInfo] = useState<GalleryPhoto>();
  const [activePhoto, setActivePhoto] = useState("");
  const [editPhotoModalOpen, setEditPhotoModalOpen] = useState(false);

  const [uploadingImgs, setUploadingImgs] = useState<UploadingImages>({
    current: 0,
    total: 0,
    isUploading: false,
  });

  useEffect(() => {
    getGalleryList(
      setGalleryList,
      setGalleryInfo,
      setActiveGallery,
      setActiveGalleryDbRef
    );
    return () => {
      if (activeGalleryDbRef) db.ref(activeGalleryDbRef).off("value");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getGalleryPhotos(
      activeGallery,
      galleryList,
      setActiveGallery,
      setGalleryInfo,
      setGalleryPhotos,
      setActiveGalleryDbRef
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGallery]);
  return (
    <Fragment>
      <div className="app-main__outer">
        <div className="app-main__inner">
          <div className="row">
            <div className="col-md-3">
              <div className="main-card card p-2">
                <div className="metismenu vertical-nav-menu">
                  <ul className="metismenu-container">
                    {galleryList.length > 0
                      ? galleryList.map(([galleryId, galInfo]) => (
                          <li key={galleryId} className="metismenu-item">
                            <span
                              className={cx("gallery-link", {
                                active: galleryId === activeGallery,
                              })}
                              onClick={() => {
                                if (uploadingImgs.isUploading) return;
                                setActiveGallery(galleryId);
                              }}
                            >
                              {galInfo.name}
                            </span>
                          </li>
                        ))
                      : "Create an Album"}
                  </ul>
                  <button
                    className="btn btn-outline-info w-100 my-2"
                    onClick={() => {
                      if (uploadingImgs.isUploading) return;
                      openCreateGalleryModal(setModalIsOpen, setEditGallery);
                    }}
                  >
                    Create Album
                  </button>
                  {activeGallery && (
                    <Fragment>
                      <div className="galleryDrop">
                        <FileSelector
                          accept=".png,.jpeg,.jpg"
                          value={fileValue}
                          placeholder="Drop to Upload"
                          variant="multiline"
                          multiple
                          onChange={(e) => {
                            setFileValue(e);
                            uploadPhotosToServer(
                              e,
                              activeGallery,
                              galleryInfo,
                              setFileValue,
                              setUploadingImgs
                            );
                          }}
                        />
                      </div>

                      {uploadingImgs.total > 0 && (
                        <Fragment>
                          <div className="row my-2">
                            <div className="col" style={{ width: "80%" }}>
                              {`${uploadingImgs.current} out of ${uploadingImgs.total}`}
                              <ProgressBar
                                value={Math.round(
                                  (uploadingImgs.current /
                                    uploadingImgs.total) *
                                    100
                                )}
                                variant="success"
                              />
                            </div>
                          </div>
                        </Fragment>
                      )}
                    </Fragment>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md">
              <div className="main-card card">
                <div className="card-header">
                  {galleryInfo ? `${galleryInfo?.name}` : "No Info"}
                  <div className="btn-actions-pane-right">
                    {galleryInfo && `${dateToString(galleryInfo.timestamp)}`}
                    <button
                      className="btn btn-outline-info ml-2"
                      onClick={() => {
                        if (uploadingImgs.isUploading) return;
                        openEditGalleryModal(setModalIsOpen, setEditGallery);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
                <SimpleReactLightbox>
                  <SRLWrapper>
                    <div className="row card-body">
                      {galleryPhotos &&
                        Object.entries(galleryPhotos).map(([imgId, img]) => {
                          return (
                            <div
                              className="col-sm-6 col-md-3 col-lg-3"
                              key={imgId}
                            >
                              <div className="gallery-item">
                                <div className="gallery-image">
                                  <button
                                    style={{
                                      position: "absolute",
                                      top: -2,
                                      left: -2,
                                    }}
                                    className="btn border-0 btn-transition btn-outline-info zIndex-inf"
                                    onClick={() =>
                                      openEditPhotoModal(
                                        img,
                                        imgId,
                                        setActivePhoto,
                                        setImgInfo,
                                        setEditPhotoModalOpen
                                      )
                                    }
                                  >
                                    <i className="fa fa-edit "></i>
                                  </button>
                                  <button
                                    style={{
                                      position: "absolute",
                                      top: -2,
                                      right: -2,
                                    }}
                                    className="btn border-0 btn-transition btn-outline-danger zIndex-inf"
                                    onClick={() => {
                                      deletePhoto(
                                        activeGallery,
                                        img.imagePath,
                                        imgId,
                                        setModalIsOpen
                                      );
                                    }}
                                  >
                                    <i className="fa fa-times "></i>
                                  </button>
                                  <a href={img.imagePath}>
                                    <img
                                      src={img.rzImgPath}
                                      alt={img.description}
                                    />
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </SRLWrapper>
                </SimpleReactLightbox>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CreateGalleryModal
        editGallery={editGallery}
        activeGallery={activeGallery}
        isModalOpen={modalIsOpen}
        setIsModalOpen={setModalIsOpen}
        galleryInfo={galleryInfo}
        setGalleryInfo={setGalleryInfo}
      />
      <EditPhotoModal
        activeGallery={activeGallery}
        imgId={activePhoto}
        imgInfo={imgInfo}
        isModalOpen={editPhotoModalOpen}
        setIsModalOpen={setEditPhotoModalOpen}
        setImgInfo={setImgInfo}
      />
    </Fragment>
  );
};

export default Gallery;
