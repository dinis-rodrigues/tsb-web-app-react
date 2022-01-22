import React, { useEffect, useState } from "react";
import { db } from "../../../config/firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { ApplicationFeatures } from "../../../interfaces";
import FeatureEnable from "./FeatureEnable";

const FeatureManagement = () => {
  const { applicationFeatures } = useAuth();
  const setFeatures = () => {
    const features = {
      dashboard: {
        public: true,
        admin: true,
        god: true,
      },
      events: {
        public: true,
        admin: true,
        god: true,
      },
      gallery: {
        public: true,
        admin: true,
        god: true,
      },
      forum: {
        public: true,
        admin: true,
        god: true,
      },
      tasks: {
        public: true,
        admin: true,
        god: true,
      },
      attendance: {
        public: true,
        admin: true,
        god: true,
      },
      members: {
        public: true,
        admin: true,
        god: true,
      },
      recruitment: {
        public: true,
        admin: true,
        god: true,
      },
      budget: {
        public: true,
        admin: true,
        god: true,
      },
      cashflow: {
        public: true,
        admin: true,
        god: true,
      },
      sponsors: {
        public: true,
        admin: true,
        god: true,
      },
      userManagement: {
        public: true,
        admin: true,
        god: true,
      },
      departmentManagement: {
        public: true,
        admin: true,
        god: true,
      },
      featureManagement: {
        public: true,
        admin: true,
        god: true,
      },
    };

    db.ref("private/applicationFeatures").set(features);
  };

  const sortFeatures = (features: ApplicationFeatures) => {
    return Object.entries(features).sort((a, b) => {
      let nameA = a[0];
      let nameB = a[0];

      if (nameA < nameB) return -1;
      if (nameA > nameB) return -1;
      return 0;
    });
  };

  return (
    <div className="app-main__outer">
      <div className="app-main__inner">
        <div className="main-card mb-3 card">
          <div className="card-header">
            <i className="header-icon lnr-cog icon-gradient bg-plum-plate"></i>
            Enable Features for Users
          </div>
          {/* <button
            onClick={() => {
              setFeatures();
            }}
          >
            Set
          </button> */}
          <ul className="list-group list-group-flush">
            {applicationFeatures &&
              sortFeatures(applicationFeatures).map(
                ([featureName, permissions]) => (
                  <FeatureEnable
                    key={featureName}
                    featurePermissions={permissions}
                    featureName={featureName}
                  />
                )
              )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FeatureManagement;
