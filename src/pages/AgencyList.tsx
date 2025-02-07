import { useEffect, useState } from "react";
import FOIARequestForm from "../components/FOIARequestForm";
import AgencyCard from "../components/AgencyCard";
import { filterAgencies, toggleIndex } from "../utils/helpers";
import { Agency } from "../types/types.ts";
import { Grid2 } from "@mui/material";

const AgencyList = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // API time
    useEffect(() => {
        const fetchAgencies = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8080/api/agencies");
                if (!response.ok) throw new Error("COOKED COOKED COOKED");

                const rawData = await response.json();

                const formattedData: Agency[] = rawData.map((agency: Record<string, unknown>) => ({
                    id: agency.id,
                    Name: agency.name,
                    Description: agency.description,
                    Website: agency.website,
                    "Phone Number": agency.phone_number ? String(agency.phone_number) : "N/A",
                    Logo: agency.logo,
                    Governance: agency.governance,
                    created_at: agency.created_at,
                    updated_at: agency.updated_at
                }));

                setAgencies(formattedData);
            } catch (error) {
                setError("WE'RE COOKED!");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchAgencies();
    }, []);


    const filteredAgencies = filterAgencies(agencies, searchQuery);

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

                {/* Loading & Error Messages */}
                {loading && <p className="text-gray-400">Loading agencies...</p>}
                {error && <p className="text-red-400">{error}</p>}

                {/* Agencies Grid */}
                {!loading && !error && (
                    <Grid2 container spacing={3}>
                        {filteredAgencies.map((agency, index) => (
                            <AgencyCard
                                key={agency.id}
                                agency={agency}
                                isExpanded={expandedIndex === index}
                                onToggleExpand={() =>
                                    setExpandedIndex((prev) => toggleIndex(prev, index))
                                }
                                onRequestFOIA={(agency) => setSelectedAgency(agency)}
                            />
                        ))}
                    </Grid2>
                )}

                {/* No Results Message */}
                {!loading && !error && filteredAgencies.length === 0 && (
                    <p className="text-center text-gray-400 mt-10">
                        No agencies found. Try adjusting your search.
                    </p>
                )}

                {/* FOIA Request Form */}
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
