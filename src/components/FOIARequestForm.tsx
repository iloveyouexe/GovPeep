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
    return (
        <div className="p-4">
            <button
                onClick={onClose}
                className="text-red-500 underline hover:text-red-700 mb-4"
            >
                Close
            </button>
            <h2 className="text-xl font-bold mb-4">Request an FOIA</h2>
            <p className="text-sm text-gray-500 mb-2">
                Agency: <strong>{agency["Agency Name"]}</strong>
            </p>
            <p className="text-sm mb-4">{agency.Description}</p>

            {/* TODO: Add AI-generated FOIA babblings for selected agency */}
            <textarea
                placeholder="Reason for FOIA request..."
                className="w-full h-40 border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
                Submit Request
            </button>
        </div>
    );
};

export default FOIARequestForm;
