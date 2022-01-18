import { Fragment, useEffect, useState } from "react";
import NumberFormat from "react-number-format";
import { Button, Modal, FileSelector, Spinner } from "react-rainbow-components";
import cx from "classnames";
import { Nav, NavItem, NavLink } from "reactstrap";
import { Sponsor } from "../../interfaces";
import SponsorFileIcon from "./icons/SponsorFileIcon";
import SponsorChart from "./SponsorChart";
import SponsorImage from "./SponsorImage";
import {
  addNewSeason,
  deleteSeason,
  deleteSponsor,
  downloadSponsorFile,
  editSeasonHandler,
  editSeasonValueHandler,
  saveSponsor,
  sponsorInputHandler,
  uploadSponsorSvgToServer,
} from "./sponsorsUtils";
import { useAuth } from "../../contexts/AuthContext";

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: Function;
  bracketId?: string;
  sponsorId: string;
  sponsorInfo: Sponsor | null;
  retroActives: number[];
  setSponsorInfo: Function;
};
const SponsorModal = ({
  isModalOpen,
  setIsModalOpen,
  bracketId,
  sponsorInfo,
  setSponsorInfo,
  retroActives,
  sponsorId,
}: Props) => {
  const { USER, isMarketingOrAdmin } = useAuth();
  const [focusInput, setFocusInput] = useState("");
  let sponsorValue = 0;
  if (sponsorInfo?.history) {
    let vals = Object.entries(sponsorInfo.history).map(([_, val]) => val);
    sponsorValue = vals[vals.length - 1];
  }
  const [fileValue, setFileValue] = useState<FileList | undefined>();
  const [activeTab, setActiveTab] = useState("0");
  useEffect(() => {
    setActiveTab("0");
  }, [sponsorId]);

  return (
    <Modal
      isOpen={isModalOpen}
      size="medium"
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
              Files
            </NavLink>
          </NavItem>
        </Nav>
      </div>
      {activeTab === "0" && (
        <Fragment>
          <div className="form-group row text-center">
            <div className="col">
              <label>
                <span className="text-dark small text-uppercase">
                  <i className="fas fa-quote-right"></i>
                  <strong> Name</strong>
                </span>
              </label>

              <input
                value={sponsorInfo ? sponsorInfo.name : ""}
                readOnly={isMarketingOrAdmin ? false : true}
                onChange={(e) =>
                  sponsorInputHandler(e.target.value, "name", setSponsorInfo)
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
                  <strong> Bracket</strong>
                </span>
              </label>

              <input
                value={sponsorInfo ? sponsorInfo.level : ""}
                readOnly
                type="text"
                className="form-control m-0 text-center"
                placeholder=""
              />
            </div>
            <div className="col">
              <label>
                <span className="text-dark small text-uppercase">
                  <i className="fas fa-euro-sign"></i>
                  <strong> Value</strong>
                </span>
              </label>

              <NumberFormat
                value={sponsorValue}
                readOnly
                onValueChange={(value) =>
                  sponsorInputHandler(
                    value.floatValue ? value.floatValue : 0,
                    "value",
                    setSponsorInfo
                  )
                }
                decimalScale={2}
                fixedDecimalScale={true}
                suffix={" €"}
                thousandSeparator={" "}
                className="form-control text-center"
                placeholder="  €"
              />
            </div>
          </div>

          <div className="row">
            <div className="col">
              <SponsorChart
                sponsorInfo={sponsorInfo}
                retroActives={retroActives}
              />
            </div>
          </div>

          <hr className="divider" />

          <div className="row form-group text-center">
            <div className="col-1"></div>
            <div className="col-5 text-dark small text-uppercase">Season</div>
            <div className="col-5 text-dark small text-uppercase">Value</div>
            <div className="col-1"></div>
            {sponsorInfo?.history &&
              Object.entries(sponsorInfo?.history).map(([season, value]) => {
                return (
                  <Fragment key={season}>
                    <div className="col-1"></div>
                    <div className="col-5">
                      <NumberFormat
                        value={season.replace("-", "/")}
                        readOnly={isMarketingOrAdmin ? false : true}
                        className="form-control text-center"
                        format={"####/####"}
                        allowEmptyFormatting
                        mask="_"
                        autoFocus={season === focusInput}
                        onValueChange={(val) =>
                          editSeasonHandler(
                            val.formattedValue,
                            season,
                            sponsorInfo,
                            setSponsorInfo,
                            setFocusInput
                          )
                        }
                      />
                    </div>
                    <div className="col-5">
                      <NumberFormat
                        value={value}
                        readOnly={isMarketingOrAdmin ? false : true}
                        onValueChange={(value) =>
                          editSeasonValueHandler(
                            value.floatValue ? value.floatValue : 0,
                            season,
                            sponsorInfo,
                            setSponsorInfo
                          )
                        }
                        decimalScale={2}
                        fixedDecimalScale={true}
                        suffix={" €"}
                        thousandSeparator={" "}
                        className="form-control text-center"
                        placeholder="  €"
                      />
                    </div>

                    <div className="col-1 justify-content-center d-flex align-items-center">
                      {isMarketingOrAdmin && (
                        <span
                          className={"float-right cursor-pointer text-danger"}
                          onClick={() =>
                            deleteSeason(season, sponsorInfo, setSponsorInfo)
                          }
                        >
                          <i className="fa fa-times"></i>
                        </span>
                      )}
                    </div>
                  </Fragment>
                );
              })}
          </div>
          {isMarketingOrAdmin && (
            <div className="row">
              <div className="col-4"></div>
              <div className="col d-flex justify-content-center">
                <button
                  className="btn btn-outline-success"
                  onClick={() => addNewSeason(sponsorInfo, setSponsorInfo)}
                >
                  Add Season
                </button>
              </div>
              <div className="col-4"></div>
            </div>
          )}
        </Fragment>
      )}

      {/* Sponsor files */}
      {activeTab === "1" && (
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
                        className="btn btn-success"
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
                      <SponsorFileIcon url={sponsorInfo?.logoWhite} />
                      <button
                        className="btn btn-success"
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
                      <SponsorFileIcon url={sponsorInfo?.logoBlack} />
                      <button
                        className="btn btn-success"
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
