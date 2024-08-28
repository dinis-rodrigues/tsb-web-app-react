import { ref, set } from "firebase/database";
import { useState } from "react";
import NumberFormat, { NumberFormatValues } from "react-number-format";
import { Button, Modal } from "react-rainbow-components";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { selectOption } from "../../interfaces";
import { sortSeasonsArray } from "./budgetUtils";

type Props = {
  isSeasonModalOpen: boolean;
  setIsSeasonModalOpen: Function;
  seasonsOptions: selectOption[];
};

/** Handlers for the season input
 * @param  {NumberFormatValues} value season to create
 * @param  {Function} setSeasonToCreate season to create state function
 */
const seasonToCreateHandler = (value: NumberFormatValues, setSeasonToCreate: Function) => {
  setSeasonToCreate(value.formattedValue);
};

/** Validates the new season to create, agains severall conditions
 * @param  {string} seasonToCreate season to create
 * @param  {string[]} array existing seasons
 * @returns  {boolean} all good or not
 */
const validateSeasonToCreate = (seasonToCreate: string, seasonArray: string[]) => {
  const [firstYear, secondYear] = seasonToCreate.split("/");

  if (seasonArray.includes(seasonToCreate)) return false;
  if (!firstYear || !secondYear) return false;
  if (parseInt(secondYear) < 2000 || parseInt(firstYear) < 2000) return false;
  if (parseInt(secondYear) !== parseInt(firstYear) + 1) return false;
  return true;
};

/** Create a new season in the database, by inserting it into the seasons list
 * @param  {string} seasonToCreate season to create
 * @param  {selectOption[]} seasonsOptions existing seasons options, in select options form
 * @param  {Function} setIsSeasonModalOpen update IsSeasonModalOpen state
 */
const createNewSeason = (
  seasonToCreate: string,
  seasonsOptions: selectOption[],
  setIsSeasonModalOpen: Function,
  setSeasonToCreate: Function,
) => {
  // season options is an array of objects, we want it in a simple array
  const seasonArray = seasonsOptions.map((obj) => obj.value);
  if (!validateSeasonToCreate(seasonToCreate, seasonArray)) return;
  // push new season to the list
  seasonArray.push(seasonToCreate);
  // sort the list
  const sortedSeasons = sortSeasonsArray(seasonArray);
  //   Push the array to the DB
  set(ref(db, "private/bom/seasons"), sortedSeasons);
  setIsSeasonModalOpen(false);
  setSeasonToCreate("");
};

const CreateSeasonModal = ({ isSeasonModalOpen, setIsSeasonModalOpen, seasonsOptions }: Props) => {
  const [seasonToCreate, setSeasonToCreate] = useState("");
  const { isDarkMode } = useAuth();
  return (
    <Modal
      className={isDarkMode ? "app-theme-dark app-modal-dark" : "app-theme-white"}
      isOpen={isSeasonModalOpen}
      onRequestClose={() => setIsSeasonModalOpen(false)}
      footer={
        <div className="row justify-content-sm-center">
          <div className="mr-1">
            <Button label="Cancel" onClick={() => setIsSeasonModalOpen(false)} />
          </div>
          <div className="mr-1">
            <Button
              variant="brand"
              label="Create"
              onClick={() =>
                createNewSeason(
                  seasonToCreate,
                  seasonsOptions,
                  setIsSeasonModalOpen,
                  setSeasonToCreate,
                )
              }
            />
          </div>
        </div>
      }
    >
      <div className="col">
        <label>
          <span className="text-dark small text-uppercase">
            <i className="fas fa-users"></i>
            <strong> Create new season</strong>
          </span>
        </label>

        <NumberFormat
          value={seasonToCreate}
          onValueChange={(value) => seasonToCreateHandler(value, setSeasonToCreate)}
          format="####/####"
          mask="_"
          className="form-control text-center"
          allowEmptyFormatting
        />
      </div>
    </Modal>
  );
};

export default CreateSeasonModal;
