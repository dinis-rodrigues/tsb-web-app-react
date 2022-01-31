import { useState } from "react";
import { ChromePicker, ColorResult, Color } from "react-color";
import { Department } from "../../../interfaces";

const handleClick = (
  colorPicker: colorPickerState,
  setColorPicker: Function
) => {
  setColorPicker({
    ...colorPicker,
    displayColorPicker: !colorPicker.displayColorPicker,
  });
};

const handleClose = (
  colorPicker: colorPickerState,
  setColorPicker: Function
) => {
  setColorPicker({ ...colorPicker, displayColorPicker: false });
};

const handleChange = (
  color: ColorResult,
  colorPicker: colorPickerState,
  setColorPicker: Function,
  setDepartmentInfo: Function
) => {
  setDepartmentInfo((materialInfo: Department) => ({
    ...materialInfo,
    color: color.hex,
  }));
  setColorPicker({ ...colorPicker, color: color.rgb });
};

type colorPickerState = {
  displayColorPicker: boolean;
  color: Color;
};
type Props = {
  setDepartmentInfo: Function;
  departmentColor: string;
};
const DepartmentColorPicker = ({
  setDepartmentInfo,
  departmentColor,
}: Props) => {
  const [colorPicker, setColorPicker] = useState<colorPickerState>({
    displayColorPicker: false,
    color: "#0052D1",
  });
  const styles = {
    color: {
      width: "36px",
      height: "14px",
      borderRadius: "2px",
      background: departmentColor,
    },
    swatch: {
      padding: "5px",
      background: "#fff",
      borderRadius: "1px",
      boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
      display: "inline-block",
      cursor: "pointer",
    },
    popover: {
      zIndex: 999999999999,
      top: "150px",
      right: "-20px",
    },
    cover: {
      top: "100px",
      right: "0px",
      bottom: "0px",
      left: "0px",
    },
  };

  return (
    <div style={{ marginTop: ".5rem", zIndex: 99999 }}>
      <div
        style={styles.swatch}
        onClick={() => handleClick(colorPicker, setColorPicker)}
      >
        <div style={styles.color} />
      </div>
      {colorPicker.displayColorPicker ? (
        <div style={{ ...styles.popover, position: "fixed" }}>
          <div
            style={{ ...styles.cover, position: "absolute" }}
            onClick={() => handleClose(colorPicker, setColorPicker)}
          />
          <ChromePicker
            color={colorPicker.color}
            disableAlpha
            onChange={(color) =>
              handleChange(
                color,
                colorPicker,
                setColorPicker,
                setDepartmentInfo
              )
            }
          />
        </div>
      ) : null}
    </div>
  );
};

export default DepartmentColorPicker;
