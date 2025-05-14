import React from "react";
import { MdPhone } from "react-icons/md";
import { IconContext } from "react-icons";

const PhoneIcon = () => {
  return (
    <IconContext.Provider value={{ color: "#000", size: "2em" }}>
      <MdPhone style={{ marginRight: "5px" }} />
    </IconContext.Provider>
  );
};

export default PhoneIcon;
