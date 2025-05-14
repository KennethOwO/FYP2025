// Form.tsx
import React, { useState } from "react";
import "./DataCollection.css";
import DataSubmissionForm from "../DataSubmissionForm/DataSubmissionForm";
import PopupModal from "../PopupModal/PopupModal";

interface DataCollectionProps {
    user: string;
}

const DataCollection: React.FC<DataCollectionProps> = ({ user }) => {
    //Modal Control (Onsubmit popup)
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [showInstructionPopup, setShowInstructionPopup] = useState(false);

    const handleOpenModal = () => {
        setIsSubmitModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsSubmitModalOpen(false);
    };

    return (
        <div>
            {isSubmitModalOpen && <div className="dimmed-overlay"></div>}
            {showPopup && <div className="dimmed-overlay"></div>}
            {showInstructionPopup && <div className="dimmed-overlay"></div>}
            <div className={`dataForm-bg`}>
                <DataSubmissionForm user={user} isSubmitModalOpen={isSubmitModalOpen} onOpenModal={handleOpenModal} showPopup={showPopup} setShowPopup={setShowPopup} showInstructionPopup={showInstructionPopup} setShowInstructionPopup={setShowInstructionPopup} />
            </div>
            <PopupModal isOpen={isSubmitModalOpen} onClose={handleCloseModal} />
        </div>
    );
};

export default DataCollection;
