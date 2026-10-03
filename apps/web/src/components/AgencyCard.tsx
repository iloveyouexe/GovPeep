import React from "react";
import { Agency } from '../types/types.ts';

interface AgencyCardProps {
    agency: Agency;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onRequestFOIA: (agency: Agency) => void;
}

const AgencyCard: React.FC<AgencyCardProps> = ({ agency, isExpanded, onToggleExpand, onRequestFOIA }) => {
    const logoPath = agency.Logo && agency.Logo !== "No logo available"
        ? `/logos/${agency.Logo.split("\\").pop()}`
        : null;

    return (
        <div
            className={`bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:bg-black/70 hover:border-white/20 hover:scale-[1.02] ${
                isExpanded ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={onToggleExpand}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-center mb-4">
                {logoPath ? (
                    <img 
                        src={logoPath} 
                        alt={`${agency.Name} logo`} 
                        className="h-14 w-auto object-contain"
                    />
                ) : (
                    <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white/50">
                            {agency.Name.charAt(0)}
                        </span>
                    </div>
                )}
            </div>

            {/* Agency Name */}
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                {agency.Name}
            </h3>

            {/* Description */}
            <p className={`text-sm text-gray-300 mb-3 ${isExpanded ? "" : "line-clamp-3"}`}>
                {agency.Description}
            </p>

            {/* Website */}
            <a
                href={agency.Website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                Visit Website →
            </a>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRequestFOIA(agency);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-medium transition-colors"
                    >
                        Submit FOIA Request
                    </button>
                </div>
            )}
        </div>
    );
};

export default AgencyCard;
