import { Fragment, useEffect, useState } from "react";

import { Button, Modal, FileSelector, Spinner } from "react-rainbow-components";
import { CheckboxToggle } from "react-rainbow-components";
import cx from "classnames";
import { Nav, NavItem, NavLink } from "reactstrap";
import { Sponsor, SponsorRetroactives } from "../../interfaces";
import SponsorFileIcon from "./icons/SponsorFileIcon";
import SponsorChart from "./SponsorChart";
import SponsorImage from "./SponsorImage";
import {
  deleteSponsor,
  downloadSponsorFile,
  saveSponsor,
  sponsorLogoQualityHandler,
  sponsorRetroHandler,
  uploadSponsorSvgToServer,
} from "./sponsorsUtils";
import { useAuth } from "../../contexts/AuthContext";
import SponsorModalInfo from "./SponsorModalInfo";
import SponsorModalAddSeason from "./SponsorModalAddSeason";

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: Function;
  bracketId?: string;
  sponsorId: string;
  mockSponsorInfo: Sponsor | null;
  retroActives: SponsorRetroactives;
  setSponsorInfo: Function;
};
const SponsorModal = ({
  isModalOpen,
  setIsModalOpen,
  bracketId,
  mockSponsorInfo,
  retroActives,
  sponsorId,
}: Props) => {
  const { USER, isMarketingOrAdmin, isDarkMode } = useAuth();

  const [sponsorInfo, setSponsorInfo] = useState<Sponsor | null>(
    mockSponsorInfo
  );
  const [refreshChart, setRefreshChart] = useState(false);

  useEffect(() => {
    setSponsorInfo(mockSponsorInfo);
  }, [mockSponsorInfo]);

  const [fileValue, setFileValue] = useState<FileList | undefined>();
  const [activeTab, setActiveTab] = useState("0");

  useEffect(() => {
    setActiveTab("0");
  }, [sponsorId]);

  return (
    <Modal
      className={
        isDarkMode ? "app-theme-dark app-modal-dark" : "app-theme-white"
      }
      isOpen={isModalOpen}
      size="large"
      title={sponsorInfo?.name}
      onRequestClose={() => setIsModalOpen(false)}
      style={{ overflow: "hidden" }}
      footer={
        <div className="row">
          <div className="col">
            {sponsorId !== "createNew" && isMarketingOrAdmin && (
              <Button
                className={"m-1"} // margin
                variant="destructive"
                label="Delete from Database"
                onClick={() => {
                  deleteSponsor(sponsorId, bracketId);
                  setIsModalOpen(false);
                }}
              />
            )}
          </div>
          <div className="col">
            <div className="float-right">
              <Button label="Close" onClick={() => setIsModalOpen(false)} />

              {isMarketingOrAdmin && (
                <Button
                  variant="brand"
                  label={sponsorId !== "createNew" ? "Save" : "Create"}
                  onClick={() =>
                    saveSponsor(
                      sponsorInfo,
                      sponsorId,
                      bracketId,
                      setIsModalOpen
                    )
                  }
                />
              )}
            </div>
          </div>
        </div>
      }
    >
      <div className="card-header mb-2">
        <Nav className={"body-tabs-shadow tabs-animated body-tabs-animated"}>
          <NavItem>
            <NavLink
              className={cx({ active: activeTab === "0" }, "card-title")}
              onClick={() => setActiveTab("0")}
            >
              Indormation
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={cx({ active: activeTab === "1" }, "card-title")}
              onClick={() => setActiveTab("1")}
            >
              Sponsor Values
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={cx({ active: activeTab === "2" }, "card-title")}
              onClick={() => setActiveTab("2")}
            >
              Files
            </NavLink>
          </NavItem>
        </Nav>
      </div>
      {activeTab === "0" && (
        <Fragment>
          <SponsorModalInfo
            sponsorInfo={sponsorInfo}
            setSponsorInfo={setSponsorInfo}
          />

          <div className="row">
            <div className="col">
              <SponsorChart
                values={sponsorInfo?.history ? sponsorInfo.history : {}}
                retroActives={retroActives}
                refreshChart={refreshChart}
                addRetroActives={sponsorInfo?.isRetroActive}
              />
              <CheckboxToggle
                label="Toggle Retro-actives:"
                labelAlignment="left"
                value={
                  sponsorInfo?.isRetroActive === undefined
                    ? true
                    : sponsorInfo?.isRetroActive
                }
                onChange={() => sponsorRetroHandler(setSponsorInfo)}
              />
              <CheckboxToggle
                label="Bad Quality Logo:"
                labelAlignment="left"
                value={sponsorInfo?.isBadQualityLogo}
                onChange={() => sponsorLogoQualityHandler(setSponsorInfo)}
              />
            </div>
          </div>
        </Fragment>
      )}

      {activeTab === "1" && (
        <SponsorModalAddSeason
          sponsorInfo={sponsorInfo}
          setSponsorInfo={setSponsorInfo}
          setRefreshChart={setRefreshChart}
        />
      )}

      {/* Sponsor files */}
      {activeTab === "2" && (
        <Fragment>
          <div className="form-group row text-center">
            {isMarketingOrAdmin && (
              <div className="col">
                <label>
                  <span className="text-dark small text-uppercase">
                    <i className="fas fa-code"></i>
                    <strong> SVG File</strong>
                  </span>
                </label>
                <div>
                  <FileSelector
                    accept=".svg"
                    value={fileValue}
                    placeholder={
                      sponsorId === "createNew"
                        ? "Create sponsor to upload files"
                        : `Drop or Browse svg`
                    }
                    variant="multiline"
                    disabled={sponsorId === "createNew" ? true : false}
                    onChange={(e) => {
                      setFileValue(e);
                      uploadSponsorSvgToServer(
                        e,
                        sponsorInfo,
                        sponsorId,
                        bracketId,
                        sponsorInfo?.svgPath,
                        "svgPath",
                        USER?.id,
                        setFileValue,
                        setSponsorInfo
                      );
                    }}
                  />
                </div>
              </div>
            )}
            <div className="col">
              <label>
                <span className="text-dark small text-uppercase">
                  <i className="fas fa-image"></i>
                  <strong> Logo</strong>
                </span>
              </label>

              {sponsorInfo?.svgPath ? (
                <Fragment>
                  {!fileValue ? (
                    <Fragment>
                      <SponsorImage svgPath={sponsorInfo?.svgPath} />
                      <button
                        className="btn btn-info"
                        onClick={() =>
                          downloadSponsorFile(
                            sponsorInfo.svgPath,
                            sponsorInfo.name
                          )
                        }
                      >
                        Download
                      </button>
                    </Fragment>
                  ) : (
                    <Spinner size="large" type="arc" variant="brand" />
                  )}
                </Fragment>
              ) : (
                <div>No file has been uploaded yet</div>
              )}
            </div>
          </div>

          <hr className="divider" />

          <div className="form-group row text-center">
            {isMarketingOrAdmin && (
              <div className="col">
                <label>
                  <span className="text-dark small text-uppercase">
                    <i className="fas fa-code"></i>
                    <strong> Logo White</strong>
                  </span>
                </label>
                <div>
                  <FileSelector
                    accept=".eps,.pdf,.png,.jpg,.ai"
                    value={fileValue}
                    placeholder={
                      sponsorId === "createNew"
                        ? "Create sponsor to upload files"
                        : `Drop or Browse ai / eps / pdf / png / jpg`
                    }
                    variant="multiline"
                    disabled={sponsorId === "createNew" ? true : false}
                    onChange={(e) => {
                      setFileValue(e);
                      uploadSponsorSvgToServer(
                        e,
                        sponsorInfo,
                        sponsorId,
                        bracketId,
                        sponsorInfo?.logoWhite,
                        "logoWhite",
                        USER?.id,
                        setFileValue,
                        setSponsorInfo
                      );
                    }}
                  />
                </div>
              </div>
            )}
            <div className="col">
              <label>
                <span className="text-dark small text-uppercase">
                  <i className="fas fa-image"></i>
                  <strong> File</strong>
                </span>
              </label>

              {sponsorInfo?.logoWhite ? (
                <Fragment>
                  {!fileValue ? (
                    <Fragment>
                      <SponsorFileIcon url={sponsorInfo?.logoWhite} isFile />
                      <button
                        className="btn btn-info"
                        onClick={() =>
                          downloadSponsorFile(
                            sponsorInfo.logoWhite,
                            sponsorInfo.name
                          )
                        }
                      >
                        Download
                      </button>
                    </Fragment>
                  ) : (
                    <Spinner size="large" type="arc" variant="brand" />
                  )}
                </Fragment>
              ) : (
                <div>No file has been uploaded yet</div>
              )}
            </div>
          </div>
          <hr className="divider" />

          <div className="form-group row text-center">
            {isMarketingOrAdmin && (
              <div className="col">
                <label>
                  <span className="text-dark small text-uppercase">
                    <i className="fas fa-code"></i>
                    <strong> Logo Black</strong>
                  </span>
                </label>
                <div>
                  <FileSelector
                    accept=".eps,.pdf,.png,.jpg,.ai"
                    value={fileValue}
                    placeholder={
                      sponsorId === "createNew"
                        ? "Create sponsor to upload files"
                        : `Drop or Browse ai / eps / pdf / png / jpg`
                    }
                    variant="multiline"
                    disabled={sponsorId === "createNew" ? true : false}
                    onChange={(e) => {
                      setFileValue(e);
                      uploadSponsorSvgToServer(
                        e,
                        sponsorInfo,
                        sponsorId,
                        bracketId,
                        sponsorInfo?.logoBlack,
                        "logoBlack",
                        USER?.id,
                        setFileValue,
                        setSponsorInfo
                      );
                    }}
                  />
                </div>
              </div>
            )}
            <div className="col">
              <label>
                <span className="text-dark small text-uppercase">
                  <i className="fas fa-image"></i>
                  <strong> File</strong>
                </span>
              </label>

              {sponsorInfo?.logoBlack ? (
                <Fragment>
                  {!fileValue ? (
                    <Fragment>
                      <SponsorFileIcon url={sponsorInfo?.logoBlack} isFile />
                      <button
                        className="btn btn-info"
                        onClick={() =>
                          downloadSponsorFile(
                            sponsorInfo.logoBlack,
                            sponsorInfo.name
                          )
                        }
                      >
                        Download
                      </button>
                    </Fragment>
                  ) : (
                    <Spinner size="large" type="arc" variant="brand" />
                  )}
                </Fragment>
              ) : (
                <div>No file has been uploaded yet</div>
              )}
            </div>
          </div>
        </Fragment>
      )}
    </Modal>
  );
};

export default SponsorModal;
