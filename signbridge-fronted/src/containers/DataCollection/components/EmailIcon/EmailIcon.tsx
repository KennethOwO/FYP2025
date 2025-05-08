import React from "react";
import { MdEmail } from "react-icons/md";
import { IconContext } from "react-icons";

const EmailIcon = () => {
  return (
    <IconContext.Provider value={{ color: "#000", size: "30px" }}>
      <MdEmail style={{ marginRight: "5px" }} />
    </IconContext.Provider>
  );
};

export default EmailIcon;
