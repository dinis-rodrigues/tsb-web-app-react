import "lightgallery/css/lg-autoplay.css";
import "lightgallery/css/lg-fullscreen.css";
import "lightgallery/css/lg-rotate.css";
import "lightgallery/css/lg-thumbnail.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lightgallery.css";
import { useEffect, useState } from "react";

import LightGallery from "lightgallery/react";

import lgAutoplay from "lightgallery/plugins/autoplay";
import lgFullscreen from "lightgallery/plugins/fullscreen";
import lgRotate from "lightgallery/plugins/rotate";
// import plugins if you need
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";

import cx from "classnames";
import { off, ref } from "firebase/database";
import { FileSelector, ProgressBar } from "react-rainbow-components";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { GalleryAlbum, GalleryItem, GalleryPhoto, UploadingImages } from "../../interfaces";
import { dateToString } from "../../utils/generalFunctions";
import CreateGalleryModal from "./CreateGalleryModal";
import EditPhotoModal from "./EditPhotoModal";
import {
  deletePhoto,
  getGalleryList,
  getGalleryPhotos,
  openCreateGalleryModal,
  openEditGalleryModal,
  openEditPhotoModal,
  uploadPhotosToServer,
} from "./galleryUtils";

const Gallery = () => {
  const { USER, isMarketingOrAdmin } = useAuth();
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
    getGalleryList(setGalleryList, setGalleryInfo, setActiveGallery, setActiveGalleryDbRef);
    return () => {
      if (activeGalleryDbRef) off(ref(db, activeGalleryDbRef));
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
      setActiveGalleryDbRef,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGallery]);
  return (
    <>
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
                  {isMarketingOrAdmin && (
                    <button
                      type="button"
                      className="btn btn-outline-info w-100 my-2"
                      onClick={() => {
                        if (uploadingImgs.isUploading) return;
                        openCreateGalleryModal(setModalIsOpen, setEditGallery);
                      }}
                    >
                      Create Album
                    </button>
                  )}
                  {activeGallery && isMarketingOrAdmin && (
                    <>
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
                              USER?.id,
                              setFileValue,
                              setUploadingImgs,
                            );
                          }}
                        />
                      </div>

                      {uploadingImgs.total > 0 && (
                        <>
                          <div className="row my-2">
                            <div className="col" style={{ width: "80%" }}>
                              {`${uploadingImgs.current} out of ${uploadingImgs.total}`}
                              <ProgressBar
                                value={Math.round(
                                  (uploadingImgs.current / uploadingImgs.total) * 100,
                                )}
                                variant="success"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </>
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
                    {isMarketingOrAdmin && (
                      <button
                        type="button"
                        className="btn btn-outline-info ml-2"
                        onClick={() => {
                          if (uploadingImgs.isUploading) return;
                          openEditGalleryModal(setModalIsOpen, setEditGallery);
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
                {galleryPhotos && Object.entries(galleryPhotos).length > 0 && (
                  <LightGallery
                    mode="lg-fade"
                    speed={500}
                    plugins={[lgThumbnail, lgZoom, lgAutoplay, lgFullscreen, lgRotate]}
                    elementClassNames="row card-body"
                  >
                    {galleryPhotos &&
                      Object.entries(galleryPhotos).map(([imgId, img]) => {
                        return (
                          <div
                            data-src={img.imagePath}
                            className="col-sm-6 col-md-3 col-lg-3"
                            key={imgId}
                          >
                            <div className="gallery-item">
                              <div className="gallery-image">
                                {isMarketingOrAdmin && (
                                  <>
                                    <button
                                      type="button"
                                      style={{
                                        position: "absolute",
                                        top: -2,
                                        left: -2,
                                      }}
                                      className="btn border-0 btn-transition btn-info zIndex-inf"
                                      onClickCapture={(e) => {
                                        e.stopPropagation(); // dont open the gallery modal
                                        openEditPhotoModal(
                                          img,
                                          imgId,
                                          setActivePhoto,
                                          setImgInfo,
                                          setEditPhotoModalOpen,
                                        );
                                      }}
                                    >
                                      <i className="fa fa-edit"></i>
                                    </button>
                                    <button
                                      type="button"
                                      style={{
                                        position: "absolute",
                                        top: -2,
                                        right: -2,
                                      }}
                                      className="btn border-0 btn-transition btn-danger zIndex-inf"
                                      onClickCapture={(e) => {
                                        e.preventDefault();
                                        deletePhoto(
                                          activeGallery,
                                          img.imagePath,
                                          imgId,
                                          USER?.id,
                                          setModalIsOpen,
                                        );
                                      }}
                                    >
                                      <i className="fa fa-times "></i>
                                    </button>
                                  </>
                                )}

                                <img src={img.rzImgPath} alt={img.description} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </LightGallery>
                )}
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
    </>
  );
};

export default Gallery;
