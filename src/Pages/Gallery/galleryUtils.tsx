import { off, onValue, push, ref, remove, set } from "firebase/database";
import { db } from "../../config/firebase";
import {
  GalleryAlbum,
  GalleryItem,
  GalleryPhoto,
  PublicGallery,
  UploadedImgResponse,
  UploadingImages,
} from "../../interfaces";
import { toastrMessage } from "../../utils/generalFunctions";

/**
 * Opens the album model in creation mode
 * @param setModalIsOpen
 * @param setEditGallery
 */
const openCreateGalleryModal = (
  setModalIsOpen: Function,
  setEditGallery: Function
) => {
  setModalIsOpen(true);
  setEditGallery(false);
};

/**
 * Opens album modal in edit mode
 * @param setModalIsOpen
 * @param setEditGallery
 */
const openEditGalleryModal = (
  setModalIsOpen: Function,
  setEditGallery: Function
) => {
  setModalIsOpen(true);
  setEditGallery(true);
};

/**
 * Opens the photo modal
 * @param imgInfo
 * @param imgId
 * @param setActivePhoto
 * @param setImgInfo
 * @param setIsModalOpen
 */
const openEditPhotoModal = (
  imgInfo: GalleryPhoto,
  imgId: string,
  setActivePhoto: Function,
  setImgInfo: Function,
  setIsModalOpen: Function
) => {
  setActivePhoto(imgId);
  setImgInfo(imgInfo);
  setIsModalOpen(true);
};

/**
 * Handler for the photo description
 * @param value
 * @param setImgInfo
 */
const photoInputHandler = (value: string, setImgInfo: Function) => {
  setImgInfo((img: GalleryPhoto) => ({ ...img, description: value }));
};

/**
 * Handler for the gallery date input
 * @param value
 * @param setGalleryInfo
 */
const galleryDateInputHandler = (value: Date, setGalleryInfo: Function) => {
  let dateTimestamp = value.getTime();
  setGalleryInfo((gallery: GalleryItem) => ({
    ...gallery,
    timestamp: dateTimestamp,
  }));
};

/**
 * Handler for the gallery name input
 * @param value
 * @param setGalleryInfo
 */
const galleryNameInputHandler = (value: string, setGalleryInfo: Function) => {
  setGalleryInfo((gallery: GalleryItem) => ({ ...gallery, name: value }));
};

/**
 * Handler for the gallery description input
 * @param value
 * @param setGalleryInfo
 */
const galleryDescriptionInputHandler = (
  value: string,
  setGalleryInfo: Function
) => {
  setGalleryInfo((gallery: GalleryItem) => ({
    ...gallery,
    description: value,
  }));
};

/**
 * Sorst the galleries by date
 * @param publicGallery
 * @returns
 */
const sortPublicGallery = (publicGallery: PublicGallery) => {
  return Object.entries(publicGallery).sort((a, b) => {
    let galleryA = a[1];
    let galleryB = b[1];

    if (galleryA.timestamp > galleryB.timestamp) return -1;
    if (galleryA.timestamp < galleryB.timestamp) return 1;
    return 0;
  });
};

/**
 * Retrieves the gallery by matching the provided gallery ID
 * @param activeGallery
 * @param galleryList
 * @returns
 */
const getCorrespondingGalleryInfo = (
  activeGallery: string,
  galleryList: [string, GalleryItem][]
) => {
  for (const [galleryId, galInfo] of galleryList) {
    if (galleryId === activeGallery) return galInfo;
  }
};

/**
 * Retrieves the gallery based on the current active gallery ID
 * @param galleryList
 * @param setGalleryInfo
 * @param setActiveGallery
 * @param setActiveGalleryDbRef
 */
const getActiveGallery = (
  galleryList: [string, GalleryItem][],
  setGalleryInfo: Function,
  setActiveGallery: Function,
  setActiveGalleryDbRef: Function
) => {
  setActiveGallery((activeGallery: string) => {
    if (!activeGallery) {
      setGalleryInfo(galleryList[0][1]);
      setActiveGalleryDbRef(galleryList[0][0]);
      return galleryList[0][0];
    } else {
      setGalleryInfo(getCorrespondingGalleryInfo(activeGallery, galleryList));
      setActiveGalleryDbRef(activeGallery);
      return activeGallery;
    }
  });
};

/**
 * Retrieves all galleries from the database
 * @param setGalleryList
 * @param setGalleryInfo
 * @param setActiveGallery
 * @param setActiveGalleryDbRef
 */
const getGalleryList = (
  setGalleryList: Function,
  setGalleryInfo: Function,
  setActiveGallery: Function,
  setActiveGalleryDbRef: Function
) => {
  onValue(ref(db, "public/officialWebsite/gallery/galleryList"), (snapshot) => {
    const publicGallery: PublicGallery = snapshot.val();
    if (!publicGallery) return;
    const sortedGallery = sortPublicGallery(publicGallery);

    setGalleryList(sortedGallery);
    // Get current gallery info and photos
    getActiveGallery(
      sortedGallery,
      setGalleryInfo,
      setActiveGallery,
      setActiveGalleryDbRef
    );
  });
};

/**
 * Creates a new gallery entry in the database
 * @param galleryInfo
 * @param activeGallery
 * @param editGallery
 * @param setModalIsOpen
 * @returns
 */
const createGallery = (
  galleryInfo: GalleryItem | undefined,
  activeGallery: string,
  editGallery: boolean,
  setModalIsOpen: Function
) => {
  if (!galleryInfo || galleryInfo.name.length <= 0) return;

  if (!editGallery)
    push(ref(db, "public/officialWebsite/gallery/galleryList"), galleryInfo);
  else
    set(
      ref(db, `public/officialWebsite/gallery/galleryList/${activeGallery}`),
      galleryInfo
    );
  setModalIsOpen(false);
};

/**
 * Retrieves all photos from the gallery in the database
 * @param newActiveGallery
 * @param galleryList
 * @param setActiveGallery
 * @param setGalleryInfo
 * @param setGalleryPhotos
 * @param setActiveGalleryDbRef
 * @returns
 */
const getGalleryPhotos = (
  newActiveGallery: string,
  galleryList: [string, GalleryItem][],
  setActiveGallery: Function,
  setGalleryInfo: Function,
  setGalleryPhotos: Function,
  setActiveGalleryDbRef: Function
) => {
  if (!newActiveGallery) return;
  onValue(
    ref(db, `public/officialWebsite/gallery/galleryPhotos/${newActiveGallery}`),
    (snapshot) => {
      const allPhotos: GalleryAlbum = snapshot.val();

      // get all photos of album
      setGalleryPhotos(allPhotos);

      // set new gallery info
      setGalleryInfo(
        getCorrespondingGalleryInfo(newActiveGallery, galleryList)
      );

      // remove old reference
      setActiveGalleryDbRef((oldRef: string) => {
        off(
          ref(db, `"public/officialWebsite/gallery/galleryPhotos/${oldRef}"`)
        );
        return newActiveGallery;
      });

      // Set new active gallery
      setActiveGallery(newActiveGallery);
    }
  );
};

/**
 * Async loop for uploading photos to the server
 * @param galleryInfo
 * @param activeGallery
 * @param imageFilesToUpload
 * @param setUploadingImgs
 */
const uploadLoop = async (
  galleryInfo: GalleryItem,
  activeGallery: string,
  imageFilesToUpload: [string, File][],
  userId: string,
  setUploadingImgs: Function
) => {
  for (var i = 0; i < imageFilesToUpload.length; i++) {
    // let headers = new Headers();
    // headers.append("Origin", "http://localhost:3005");

    var data = new FormData();
    data.append("galleryId", activeGallery);
    data.append("fileToUpload", imageFilesToUpload[i][1]);
    data.append("userId", userId);
    try {
      const res = await fetch(
        "https://tecnicosolarboat.tecnico.ulisboa.pt/api/uploadImageToServer.php",
        {
          method: "POST",
          body: data,
        }
      );
      const resData = await res.json();

      if (resData.success) {
        let imgPath = resData.msg;
        let rzImgPath = resData.rzImg;
        saveUploadedImg(activeGallery, imgPath, rzImgPath, galleryInfo.name);
      } else {
        toastrMessage(
          resData.msg + " File: " + imageFilesToUpload[i][1].name,
          "error",
          false
        );
      }
    } catch (error) {
      toastrMessage(
        "Internal Server error while uploading file. " +
          imageFilesToUpload[i][1].name,
        "error",
        false
      );
    }
    setUploadingImgs((uploadingImgs: UploadingImages) => {
      let stillUploading = true;
      if (uploadingImgs.current === uploadingImgs.total - 1) {
        stillUploading = false;
        toastrMessage("Operation completed.", "success");
      }
      let newCurr = uploadingImgs.current + 1;

      return {
        ...uploadingImgs,
        current: newCurr,
        isUploading: stillUploading,
      };
    });
  }
};

/**
 * Upload provided photos to the server
 * @param filesList
 * @param activeGallery
 * @param galleryInfo
 * @param setFileValue
 * @param setUploadingImgs
 * @returns
 */
const uploadPhotosToServer = async (
  filesList: FileList,
  activeGallery: string,
  galleryInfo: GalleryItem | undefined,
  userId: string | undefined,
  setFileValue: Function,
  setUploadingImgs: Function
) => {
  if (!galleryInfo || !activeGallery || !filesList || !userId) {
    return;
  }
  const imageFilesToUpload = Object.entries(filesList);
  setUploadingImgs({
    current: 0,
    total: imageFilesToUpload.length,
    isUploading: true,
  });

  // imageFilesToUpload.forEach(([_, imgFile]) => {});
  await uploadLoop(
    galleryInfo,
    activeGallery,
    imageFilesToUpload,
    userId,
    setUploadingImgs
  );
  setFileValue(null);
};

/**
 * Saves uploaded image metadata in database
 * @param activeGallery
 * @param imgPath
 * @param rzImgPath
 * @param desc
 */
const saveUploadedImg = (
  activeGallery: string,
  imgPath: string,
  rzImgPath: string,
  desc: string | undefined
) => {
  const imgObj: GalleryPhoto = {
    imagePath: imgPath,
    rzImgPath: rzImgPath,
    description: desc,
    createdAt: new Date().getTime(),
  };
  push(
    ref(db, `public/officialWebsite/gallery/galleryPhotos/${activeGallery}`),
    imgObj
  );
};

/**
 * Saves edited photo in database
 * @param photoInfo
 * @param activeGallery
 * @param imgId
 * @param setModalIsOpen
 */
const saveEditedPhoto = (
  photoInfo: GalleryPhoto | undefined,
  activeGallery: string,
  imgId: string,
  setModalIsOpen: Function
) => {
  if (activeGallery && imgId && photoInfo) {
    set(
      ref(
        db,
        `public/officialWebsite/gallery/galleryPhotos/${activeGallery}/${imgId}`
      ),
      photoInfo
    );
    setModalIsOpen(false);
  }
};

/**
 * Deletes photo from databse and server
 * @param activeGallery
 * @param imgFilePath
 * @param imgId
 * @param setModalIsOpen
 * @returns
 */
const deletePhoto = (
  activeGallery: string,
  imgFilePath: string | undefined,
  imgId: string,
  userId: string | undefined,
  setModalIsOpen: Function
) => {
  if (!userId) return;
  if (activeGallery && imgFilePath) {
    // Get the basename of the image
    let baseNameImg = imgFilePath.split(/[\\/]/).pop();
    if (baseNameImg)
      baseNameImg = baseNameImg.substring(0, baseNameImg.lastIndexOf("."));
    else return;

    // let headers = new Headers();
    // headers.append("Origin", "http://localhost:3005");

    var data = new FormData();
    data.append("galleryId", activeGallery);
    data.append("deleteGallery", "FALSE");
    data.append("imgId", baseNameImg);
    data.append("userId", userId);

    fetch(
      "https://tecnicosolarboat.tecnico.ulisboa.pt/api/deleteFromGallery.php",
      {
        method: "POST",
        body: data,
      }
    )
      .then(function (res) {
        return res.json();
      })
      .then((r: UploadedImgResponse) => {
        if (r.success) {
          remove(
            ref(
              db,
              `public/officialWebsite/gallery/galleryPhotos/${activeGallery}/${imgId}`
            )
          );

          setModalIsOpen(false);
          toastrMessage(r.msg, "success");
        } else {
          toastrMessage(r.msg, "error");
        }
      });
  }
};

/**
 * Deletes album from database and all associated photos from DB and server
 * @param galleryId
 * @param setModalIsOpen
 * @returns
 */
const deleteAlbum = (
  galleryId: string,
  userId: string | undefined,
  setModalIsOpen: Function
) => {
  if (!galleryId || !userId) return;
  // let headers = new Headers();
  // headers.append("Origin", "http://localhost:3005");

  var data = new FormData();
  data.append("galleryId", galleryId);
  data.append("deleteGallery", "TRUE");
  data.append("imgId", "null");
  data.append("userId", userId);

  fetch(
    "https://tecnicosolarboat.tecnico.ulisboa.pt/api/deleteFromGallery.php",
    {
      method: "POST",
      body: data,
    }
  )
    .then(function (res) {
      return res.json();
    })
    .then((r: UploadedImgResponse) => {
      // Reload page -> Easy way :)
      remove(
        ref(db, `public/officialWebsite/gallery/galleryPhotos/${galleryId}`)
      );
      remove(
        ref(db, `public/officialWebsite/gallery/galleryList/${galleryId}`)
      );

      if (r.success) {
        setModalIsOpen(false);
        toastrMessage("Album deleted successfully.", "success");
        window.location.reload();
      } else {
        toastrMessage(
          "Error deleting album from server. Please contact the admin",
          "error"
        );
      }
    });
};

export {
  getGalleryList,
  galleryNameInputHandler,
  galleryDateInputHandler,
  galleryDescriptionInputHandler,
  createGallery,
  openCreateGalleryModal,
  openEditGalleryModal,
  getGalleryPhotos,
  uploadPhotosToServer,
  openEditPhotoModal,
  photoInputHandler,
  saveEditedPhoto,
  deletePhoto,
  deleteAlbum,
};
