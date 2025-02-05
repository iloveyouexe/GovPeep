import { useState } from "react";
import federalAgencies from "../not_fake_cia_data/agencies.json";
import FOIARequestForm from "../components/FOIARequestForm";
import AgencyCard from "../components/AgencyCard";
import { filterAgencies, toggleIndex } from "../utils/helpers";
import { Agency } from '../types/types.ts';
import { Grid2 } from "@mui/material";

const AgencyList = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);

    const filteredAgencies = filterAgencies(federalAgencies, searchQuery);

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Background Video */}
            <video
                className="fixed top-0 left-0 w-full h-full object-cover z-[-1]"
                src="/src/assets/bg/GovPeepBG.mp4"
                autoPlay
                loop
                muted
                playsInline
            ></video>

            {/* Overlay for content */}
            <div className="relative flex flex-col items-center justify-center min-h-screen p-8 bg-gray-900 bg-opacity-50 text-white">
                <h1 className="text-4xl font-extrabold text-center mb-6">
                    Welcome to GovPeep
                </h1>
                
                {/* Search Section */}
                <div className="w-full max-w-2xl mb-12">
                    <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-300 text-center mb-2">
                        Search by Name:
                    </label>
                    <input
                        id="searchQuery"
                        type="text"
                        placeholder="Search for an agency..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-gray-700 bg-gray-800 text-gray-200 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Agencies Grid */}
                <Grid2 container spacing={3}>
                    {filteredAgencies.map((agency, index) => (
                        <AgencyCard
                            key={index}
                            agency={agency}
                            isExpanded={expandedIndex === index}
                            onToggleExpand={() =>
                                setExpandedIndex((prev) => toggleIndex(prev, index))
                            }
                            onRequestFOIA={(agency) => setSelectedAgency(agency)}
                        />
                    ))}
                </Grid2>

                {/* No Results Message */}
                {filteredAgencies.length === 0 && (
                    <p className="text-center text-gray-400 mt-10">
                        No agencies found. Try adjusting your search.
                    </p>
                )}

                {/* FOIA Request Form */}
                //TODO WILL CHANGE
                {selectedAgency && (
                    <FOIARequestForm
                        agency={selectedAgency}
                        onClose={() => setSelectedAgency(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default AgencyList;
