const FOIAInfoSection = () => {
    return (
        <div className="mt-16 bg-gray-900 text-white px-6 py-12">
            <h2 className="text-3xl font-bold text-center mb-6">
                Learn About FOIA Requests
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Research */}
                <div className="p-6 border border-gray-700 bg-gray-800 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold flex items-center">
                        📖 Do research before requesting
                    </h3>
                    <p className="text-gray-300 mt-2">
                        Before submitting a FOIA request, check if the information is already available.
                        You can search government websites or use{" "}
                        <a href="#" className="text-blue-400 underline">this search tool</a> for assistance.
                    </p>
                </div>

                {/* Identify Agency */}
                <div className="p-6 border border-gray-700 bg-gray-800 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold flex items-center">
                        🏛️ Identify the right agency
                    </h3>
                    <p className="text-gray-300 mt-2">
                        Each agency handles its own FOIA requests. You can use{" "}
                        <a href="#" className="text-blue-400 underline">our search tool</a> to find the right agency.
                    </p>
                </div>

                {/* What Happens Next */}
                <div className="p-6 border border-gray-700 bg-gray-800 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold flex items-center">
                        📅 What happens next?
                    </h3>
                    <p className="text-gray-300 mt-2">
                        Agencies review requests and determine what can be released. Some records may be withheld due to **exemptions**.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FOIAInfoSection;
