import React from "react";
import { MdLocationPin } from "react-icons/md";
import { IconContext } from "react-icons";

const LocationIcon = () => {
  return (
    <IconContext.Provider value={{ color: "#000", size: "2em" }}>
      <MdLocationPin style={{ marginRight: "5px" }} />
    </IconContext.Provider>
  );
};

export default LocationIcon;
