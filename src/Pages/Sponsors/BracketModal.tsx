import NumberFormat from "react-number-format";
import { Button, ColorPicker, Modal, Slider } from "react-rainbow-components";
import { useAuth } from "../../contexts/AuthContext";
import { SponsorBracketListItem } from "../../interfaces";
import {
  bracketColorHandler,
  bracketInputHandler,
  bracketMarginHandler,
  bracketSliderHandler,
  deleteBracket,
  saveBracket,
} from "./sponsorsUtils";

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: Function;
  bracketId: string;
  bracketInfo: SponsorBracketListItem | null;
  setBracketInfo: Function;
  sponsorsItems: string[];
};

const BracketModal = ({
  isModalOpen,
  setIsModalOpen,
  bracketId,
  bracketInfo,
  setBracketInfo,
  sponsorsItems,
}: Props) => {
  const { isDarkMode } = useAuth();
  return (
    <Modal
      className={isDarkMode ? "app-theme-dark app-modal-dark" : "app-theme-white"}
      isOpen={isModalOpen}
      size="medium"
      title={bracketInfo?.name}
      onRequestClose={() => setIsModalOpen(false)}
      style={{ overflow: "hidden" }}
      footer={
        <div className="row">
          <div className="col">
            {bracketId && (
              <Button
                className={"m-1"} // margin
                variant="destructive"
                label="Delete"
                onClick={() => {
                  deleteBracket(bracketId, sponsorsItems);
                }}
              />
            )}
          </div>
          <div className="col">
            <div className="float-right">
              <Button label="Cancel" onClick={() => setIsModalOpen(false)} className={"m-1"} />
              <Button
                className={"m-1"}
                variant="brand"
                label={bracketId ? "Save" : "Create"}
                onClick={() => saveBracket(bracketId, bracketInfo, sponsorsItems, setIsModalOpen)}
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
            value={bracketInfo ? bracketInfo.name : ""}
            onChange={(e) => bracketInputHandler(e.target.value, setBracketInfo)}
            type="text"
            className="form-control m-0 text-center"
            placeholder=""
          />
        </div>
        <div className="col">
          <label>
            <span className="text-dark small text-uppercase">
              <i className="fas fa-quote-right"></i>
              <strong> Number of Columns</strong>
            </span>
          </label>

          <Slider
            value={bracketInfo?.numColumns}
            min={1}
            max={12}
            onChange={(e) => bracketSliderHandler(e.target.value, setBracketInfo)}
          />
        </div>
        <div className="col">
          <label>
            <span className="text-dark small text-uppercase">
              <i className="fas fa-quote-right"></i>
              <strong> Top Margin</strong>
            </span>
          </label>

          <NumberFormat
            value={bracketInfo?.topMargin}
            onValueChange={(value) =>
              bracketMarginHandler(
                value.floatValue ? value.floatValue : 0,
                "topMargin",
                setBracketInfo,
              )
            }
            suffix={" €"}
            thousandSeparator={" "}
            className="form-control text-center"
            placeholder="  €"
          />
        </div>
        <div className="col">
          <label>
            <span className="text-dark small text-uppercase">
              <i className="fas fa-quote-right"></i>
              <strong> Bottom Margin</strong>
            </span>
          </label>

          <NumberFormat
            value={bracketInfo?.bottomMargin}
            onValueChange={(value) =>
              bracketMarginHandler(
                value.floatValue ? value.floatValue : 0,
                "bottomMargin",
                setBracketInfo,
              )
            }
            suffix={" €"}
            thousandSeparator={" "}
            className="form-control text-center"
            placeholder="  €"
          />
        </div>
      </div>
      <div className="row">
        <div className="col-2"></div>
        <div className="col">
          <ColorPicker
            defaultColors={[]}
            variant={"default"}
            value={bracketInfo?.color ? bracketInfo?.color : undefined}
            onChange={(value) => bracketColorHandler(value, setBracketInfo)}
          />
        </div>

        <div className="col-2"></div>
      </div>
    </Modal>
  );
};

export default BracketModal;
