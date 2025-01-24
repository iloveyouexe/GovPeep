import React from "react";
import { Agency } from "../types/types.ts";

interface Props {
    agency: Agency;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onRequestFOIA: (agency: Agency) => void;
}

const AgencyCard: React.FC<Props> = ({ agency, isExpanded, onToggleExpand, onRequestFOIA }) => {
    const logoPath = agency.Logo ? `/src/assets/${agency.Logo}` : null;

    return (
        <div
            className={`border border-gray-700 rounded-lg p-6 bg-gray-800 shadow-lg transition-transform duration-300 ${
                isExpanded ? "scale-105" : "scale-100"
            }`}
        >
            {/* Header Section */}
            <div className="flex justify-between items-center cursor-pointer" onClick={onToggleExpand}>
                <h2 className="text-xl font-bold">{agency["Agency Name"]}</h2>
                <span className="text-gray-400">{isExpanded ? "▲" : "▼"}</span>
            </div>

            {/* Expanded Section */}
            {isExpanded && (
                <div className="mt-4">
                    {logoPath && (
                        <img
                            src={logoPath}
                            alt={`${agency["Agency Name"]} logo`}
                            className="h-16 w-16 object-contain mx-auto mb-4"
                        />
                    )}

                    <p className="text-sm text-gray-300 mb-2">{agency.Description}</p>

                    {/* Website */}
                    {agency.Website && (
                        <p className="text-sm mb-2">
                            <strong>Website: </strong>
                            <a
                                href={agency.Website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 underline hover:text-blue-500"
                            >
                                {agency.Website}
                            </a>
                        </p>
                    )}

                    {/* Phone Number */}
                    {agency["Phone Number"] && (
                        <p className="text-sm">
                            <strong>Phone: </strong>
                            {agency["Phone Number"]}
                        </p>
                    )}

                    {/* Request FOIA Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the expand toggle
                            onRequestFOIA(agency);
                        }}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Request an FOIA
                    </button>
                </div>
            )}
        </div>
    );
};

export default AgencyCard;
