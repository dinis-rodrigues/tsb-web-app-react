import { useEffect, useState } from "react";
import { Button, Modal, RadioGroup } from "react-rainbow-components";
import Select from "react-select";
import { useAuth } from "../../contexts/AuthContext";
import { ForumMetadata, selectOption, userContext } from "../../interfaces";
import { getDecodedString } from "../../utils/generalFunctions";
import { createNewForumSection, radioHandler } from "./forumUtils";

type Props = {
  isSectionModalOpen: boolean;
  setIsSectionModalOpen: Function;
  forumMetadata: ForumMetadata;
  user: userContext | null;
  forumSectionOrder: string[];
};

const ForumCreateModal = ({
  isSectionModalOpen,
  setIsSectionModalOpen,
  forumMetadata,
  user,
  forumSectionOrder,
}: Props) => {
  const { isDarkMode } = useAuth();
  const [sectionOptions, setSectionOptions] = useState<selectOption[]>([]);
  const [radioOption, setRadioOption] = useState("AddTo");
  const [sectionValue, setSectionValue] = useState<selectOption | null>({
    value: "General",
    label: "General",
  });
  const [topicInputValue, setTopicInputValue] = useState("");
  const [newSectionValue, setNewSectionValue] = useState("");

  const radioGroupOptions = [
    { value: "AddTo", label: "Existing Section" },
    { value: "Create", label: "New Section" },
  ];

  useEffect(() => {
    // build section options
    let existingSections = Object.entries(forumMetadata).map(
      ([encodedSectionName, topicsFromSection]) => ({
        value: encodedSectionName,
        label: getDecodedString(encodedSectionName),
      })
    );
    setSectionOptions(existingSections);

    return () => {};
  }, [forumMetadata]);
  return (
    <Modal
      className={
        isDarkMode ? "app-theme-dark app-modal-dark" : "app-theme-white"
      }
      isOpen={isSectionModalOpen}
      onRequestClose={() => setIsSectionModalOpen(false)}
      style={{ overflow: "hidden" }}
      footer={
        <div className="row justify-content-sm-center">
          <div className="mr-1">
            <Button
              label="Cancel"
              onClick={() => setIsSectionModalOpen(false)}
            />
          </div>
          <div className="mr-1">
            <Button
              variant="brand"
              label="Create"
              onClick={() =>
                createNewForumSection(
                  radioOption,
                  sectionValue,
                  newSectionValue,
                  topicInputValue,
                  forumMetadata,
                  forumSectionOrder,
                  user,
                  setTopicInputValue,
                  setIsSectionModalOpen
                )
              }
            />
          </div>
        </div>
      }
    >
      <RadioGroup
        style={{ borderRadius: "50px" }}
        options={radioGroupOptions}
        value={radioOption}
        onChange={(e) => radioHandler(e, setRadioOption, setNewSectionValue)}
        label="Create topic in:"
      />
      <div className="divider"></div>
      <div className="form-group row text-center">
        <div className="col">
          {/* User assignment */}

          <label>
            <span className="pr-2 text-dark small text-uppercase">
              <strong>
                {" "}
                {radioOption === "AddTo"
                  ? "Select Existing Section"
                  : "Section to create"}
              </strong>
            </span>
          </label>
          {radioOption === "AddTo" ? (
            <Select
              classNamePrefix="react-select-container"
              options={sectionOptions}
              menuPortalTarget={document.body}
              value={sectionValue}
              onChange={(selected) => {
                setSectionValue(selected);
              }}
              styles={{
                // Fixes the overlapping problem of the component with the datepicker
                menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
              }}
            />
          ) : (
            <input
              value={newSectionValue}
              onChange={(e) => setNewSectionValue(e.target.value)}
              type="text"
              className="form-control m-0 text-center"
              placeholder=""
            />
          )}
        </div>
        <div className="col">
          <label>
            <span className="text-dark small text-uppercase">
              <strong> Topic To Create</strong>
            </span>
          </label>

          <input
            value={topicInputValue}
            onChange={(e) => setTopicInputValue(e.target.value)}
            type="text"
            className="form-control m-0 text-center"
            placeholder=""
          />
        </div>
      </div>
    </Modal>
  );
};

export default ForumCreateModal;
