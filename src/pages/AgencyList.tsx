import { useEffect, useState } from "react";
import FOIARequestForm from "../components/FOIARequestForm";
import AgencyCard from "../components/AgencyCard";
import { toggleIndex } from "../utils/helpers";
import { Agency } from "../types/types.ts";

const AgencyList = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAgencies = async () => {
            try {
                const q = searchQuery.trim();
                const baseUrl = import.meta.env.DEV ? "/api" : "https://govpeep-api.tech-hhamilton.workers.dev/api";
                const url = q ? `${baseUrl}/agencies?q=${encodeURIComponent(q)}` : `${baseUrl}/agencies`;

                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to fetch agencies");

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
                setError("Failed to load agencies. Please try again.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchAgencies();
    }, [searchQuery]);

    return (
        <div className="min-h-[calc(100vh-72px)] px-8 py-10 text-white">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-center mb-10">
                    <div className="text-center bg-black/40 backdrop-blur-sm rounded-2xl py-6 px-8">
                        <h1 className="text-4xl font-bold mb-2 text-white">
                            Federal Agencies
                        </h1>
                        <p className="text-gray-300">
                            Select an agency to submit a FOIA request
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="max-w-xl mx-auto mb-10">
                    <input
                        type="text"
                        placeholder="Search agencies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/50 backdrop-blur-md border border-white/10 rounded-xl px-5 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>

                {/* Loading & Error */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                    </div>
                )}
                {error && (
                    <p className="text-center text-red-400 py-10">{error}</p>
                )}

                {/* Agencies Grid */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {agencies.map((agency, index) => (
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
                    </div>
                )}

                {/* No Results */}
                {!loading && !error && agencies.length === 0 && (
                    <p className="text-center text-gray-400 py-20">
                        No agencies found. Try a different search term.
                    </p>
                )}
            </div>

            {/* FOIA Request Modal */}
            {selectedAgency && (
                <FOIARequestForm
                    agency={selectedAgency}
                    onClose={() => setSelectedAgency(null)}
                />
            )}
        </div>
    );
};

export default AgencyList;
