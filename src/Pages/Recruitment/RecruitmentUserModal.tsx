import { Button, Modal } from "react-rainbow-components";
import { RecruitmentUser } from "../../interfaces";
import TextareaAutosize from "react-textarea-autosize";
import {
  deleteRecruitmentMemberFromDB,
  swalDeleteApplication,
} from "./recruitmentUtils";
import { useAuth } from "../../contexts/AuthContext";

type Props = {
  tableName: string | boolean;
  modalIsOpen: boolean;
  info: RecruitmentUser;
  setModalIsOpen: Function;
};
const RecruitmentUserModal = ({
  tableName,
  setModalIsOpen,
  modalIsOpen,
  info,
}: Props) => {
  const { isMarketingOrAdmin, isDarkMode } = useAuth();
  return (
    <Modal
      className={
        isDarkMode ? "app-theme-dark app-modal-dark" : "app-theme-white"
      }
      size="large"
      isOpen={modalIsOpen}
      title={"Individual Information"}
      onRequestClose={() => {
        setModalIsOpen(false);
      }}
      footer={
        <div className="row justify-content-sm-center">
          <div className="col">
            {isMarketingOrAdmin && (
              <Button
                variant="destructive"
                label="Delete"
                onClick={() =>
                  swalDeleteApplication(() =>
                    deleteRecruitmentMemberFromDB(
                      tableName,
                      info.applicationId,
                      setModalIsOpen
                    )
                  )
                }
              />
            )}
          </div>
          <div className="col">
            <div className="float-right">
              <Button label="Close" onClick={() => setModalIsOpen(false)} />
            </div>
          </div>
        </div>
      }
    >
      <div className="widget-content text-center">
        <div className="form-group row">
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Name</strong>
            </span>
            <input
              readOnly
              value={info.name || ""}
              type="text"
              className="form-control m-0 text-center"
              placeholder=""
            />
          </div>

          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Degree</strong>
            </span>
            <input
              readOnly
              value={info.degree || ""}
              type="text"
              className="form-control m-0 text-center"
              placeholder=""
            />
          </div>
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Year</strong>
            </span>
            <input
              readOnly
              value={info.year || ""}
              type="text"
              className="form-control m-0 text-center"
              placeholder=""
            />
          </div>
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Departments</strong>
            </span>
            <input
              readOnly
              value={info.departments.join(", ").toUpperCase() || ""}
              type="text"
              className="form-control m-0 text-center"
              placeholder=""
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Country</strong>
            </span>
            <input
              readOnly
              value={info.country || ""}
              type="text"
              className="form-control m-0 text-center"
              placeholder=""
            />
          </div>
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Phone</strong>
            </span>
            <input
              readOnly
              value={info.phone || ""}
              type="text"
              className="form-control m-0 text-center"
              placeholder=""
            />
          </div>
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Date</strong>
            </span>
            <input
              readOnly
              value={info.timestamp || ""}
              type="text"
              className="form-control m-0 text-center"
              placeholder=""
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>email</strong>
            </span>
            <input
              readOnly
              value={info.email || ""}
              type="text"
              className="form-control m-0 text-center"
              placeholder=""
            />
          </div>
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Link</strong>
            </span>
            <input
              readOnly
              value={info.link || ""}
              type="text"
              className="form-control m-0 text-center"
              placeholder=""
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Message</strong>
            </span>
            <TextareaAutosize
              cacheMeasurements
              value={info.message || ""}
              readOnly
              className="form-control m-0"
            />
            {/* <textarea
              readOnly
              value={info.message || ""}
              className="form-control m-0"
              placeholder=""
            /> */}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RecruitmentUserModal;
