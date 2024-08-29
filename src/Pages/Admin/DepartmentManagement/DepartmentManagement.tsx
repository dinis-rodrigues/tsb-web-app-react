import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Department, DepartmentModalText } from "../../../interfaces";
import DepartmentBlock from "./DepartmentBlock";
import DepartmentModal from "./DepartmentModal";
import { openModalToCreateDepartment } from "./departmentManagementUtils";

const DepartmentManagement = () => {
  const { departments } = useAuth();
  const departmentEntries = Object.entries(departments);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [departmentInfo, setDepartmentInfo] = useState<Department>();
  const [modalText, setModalText] = useState<DepartmentModalText>({
    title: "Edit Department",
    saveButton: "Save",
    creatingNewDepartment: false,
  });

  return (
    <div className="app-main__outer">
      <div className="app-main__inner">
        {departmentEntries &&
          departmentEntries.map(([acronym, department]) => (
            <DepartmentBlock
              key={acronym}
              department={department}
              setDepartmentInfo={setDepartmentInfo}
              setIsDepartmentModalOpen={setIsDepartmentModalOpen}
              setModalText={setModalText}
            />
          ))}
        <div className="row">
          <div className="col">
            <button
              type="button"
              className="btn-icon btn-icon-only btn btn-outline-success w-100"
              onClick={() =>
                openModalToCreateDepartment(
                  setDepartmentInfo,
                  setIsDepartmentModalOpen,
                  setModalText,
                )
              }
            >
              Create a new Department
            </button>
          </div>
        </div>
        <DepartmentModal
          departments={departments}
          departmentInfo={departmentInfo}
          setDepartmentInfo={setDepartmentInfo}
          issDepartmentModalOpen={isDepartmentModalOpen}
          setIsDepartmentModalOpen={setIsDepartmentModalOpen}
          modalText={modalText}
        />
      </div>
    </div>
  );
};

export default DepartmentManagement;
