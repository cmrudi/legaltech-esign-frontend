import React, { useState } from "react";
import SelectDocument from "../SelectDocument";
import Stepper from "../../commons/Stepper";

import PlaceField from "../PlaceField";
import selectIcon from "../../../assets/images/document tab icon.svg";
import placeFieldIcon from "../../../assets/images/document tab icon.svg";
import reviewSendIcon from "../../../assets/images/document tab icon.svg";
import { useTranslation } from "react-i18next";
import { useData } from "../../../contexts/DataContext";
// import personAddIcon from "../../../assets/images/Progress Bar - Step 1 Icon.svg";
// import placeFieldIcon from "../../../assets/images/Progress Bar - Step 2 Icon.svg";
// import reviewSendIcon from "../../../assets/images/Progress Bar - Step 3 Icon.svg";

const Me = () => {
  const [activeItem, setActiveItem] = useState(0);
  const availableLevel = activeItem;
  const { setFileUrl } = useData();

  const { t } = useTranslation();

  const stepperData = [
    {
      name: t("sign.selectDocument.text"),
      icon: selectIcon,
      component: (
        <SelectDocument
          activeItem={activeItem}
          availableLevel={availableLevel}
          setFileUrl={setFileUrl}
          setActiveItem={setActiveItem}
        />
      ),
    },
    {
      name: t("sign.placeFields.text"),
      icon: placeFieldIcon,
      component: (
        <PlaceField
          activeItem={activeItem}
          availableLevel={availableLevel}
          setFileUrl={setFileUrl}
          setActiveItem={setActiveItem}
        />
      ),
    },
    {
      name: t("sign.reviewSend.text"),
      icon: reviewSendIcon,
    },
  ];

  return (
    <div>
      <Stepper
        items={stepperData}
        activeItem={activeItem}
        setActiveItem={(inc) =>
          activeItem + inc >= 0 &&
          activeItem + inc < stepperData?.length &&
          activeItem + inc <= availableLevel &&
          setActiveItem(activeItem + inc)
        }
        availableLevel={availableLevel}
      />
      {stepperData?.[activeItem]?.component}
    </div>
  );
};

export default Me;
