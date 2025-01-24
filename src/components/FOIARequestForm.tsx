import { useState } from "react";
import { validateFOIAForm } from "../utils/helpers";

interface FOIARequestFormProps {
    agency: {
        "Agency Name": string;
        Description: string;
        Website: string;
        "Phone Number": string;
    };
    onClose: () => void;
}

const FOIARequestForm = ({ agency, onClose }: FOIARequestFormProps) => {
    const [reason, setReason] = useState("");

    const handleSubmit = () => {
        if (validateFOIAForm(reason)) {
            alert(`FOIA Request submitted for ${agency["Agency Name"]}`);
            onClose();
        } else {
            alert("Please provide a reason for your FOIA request.");
        }
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-90 z-50 flex items-center justify-center">
            <div className="w-2/3 bg-gray-800 rounded-lg shadow-lg p-8 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
                >
                    ✕
                </button>
                <h2 className="text-xl font-bold mb-4">Request an FOIA</h2>
                <p className="text-sm text-gray-500 mb-2">
                    Agency: <strong>{agency["Agency Name"]}</strong>
                </p>
                <p className="text-sm mb-4">{agency.Description}</p>

                {/* FOIA Request Reason */}
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason for FOIA request..."
                    className="w-full h-40 border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                    onClick={handleSubmit}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Submit Request
                </button>
            </div>
        </div>
    );
};

export default FOIARequestForm;
