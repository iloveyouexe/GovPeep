import { useState } from "react";
import federalAgencies from "../not_fake_cia_data/agencies.json";
import FOIARequestForm from "../components/FOIARequestForm.tsx";

interface Agency {
    "Agency Name": string;
    Description: string;
    Website: string;
    "Phone Number": string;
    Logo?: string;
}

const Home = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);

    const filteredAgencies = federalAgencies.filter((agency: Agency) =>
        agency["Agency Name"].toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleExpand = (index: number) => {
        setExpandedIndex((prevIndex) => (prevIndex === index ? null : index));
    };

    const handleFOIARequest = (agency: Agency) => {
        setSelectedAgency(agency);
    };

    const closeFOIARequest = () => {
        setSelectedAgency(null);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-900 text-white">
            <h1 className="text-4xl font-extrabold text-center mb-6">
                Welcome to GovPeep
            </h1>
            <p className="text-lg text-gray-400 text-center mb-10">
                Streamline public records requests with ease.
            </p>

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
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
                {filteredAgencies.map((agency, index) => {
                    const isExpanded = expandedIndex === index;
                    const logoPath = agency.Logo ? `/src/assets/${agency.Logo}` : null;

                    return (
                        <div
                            key={index}
                            className={`border border-gray-700 rounded-lg p-6 bg-gray-800 shadow-lg transition-all duration-300 ${
                                isExpanded ? "scale-105" : "scale-100"
                            }`}
                        >
                            <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => toggleExpand(index)}
                            >
                                <h2 className="text-xl font-bold">{agency["Agency Name"]}</h2>
                                <span className="text-gray-400">{isExpanded ? "▲" : "▼"}</span>
                            </div>

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
                                    <p className="text-sm">
                                        <strong>Phone: </strong>
                                        {agency["Phone Number"]}
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFOIARequest(agency);
                                        }}
                                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        Request an FOIA
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* No Results Message */}
            {filteredAgencies.length === 0 && (
                <p className="text-center text-gray-400 mt-10">
                    No agencies found. Try adjusting your search.
                </p>
            )}

            {/* FOIA Request Form */}
            {selectedAgency && (
                <div
                    className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-90 z-50 flex items-center justify-center"
                >
                    <div className="w-2/3 bg-gray-800 rounded-lg shadow-lg p-8 relative">
                        <button
                            onClick={closeFOIARequest}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
                        >
                            ✕
                        </button>
                        <FOIARequestForm agency={selectedAgency} onClose={closeFOIARequest} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
