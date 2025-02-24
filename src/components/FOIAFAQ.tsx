const FOIAFAQ = () => {
    return (
        <div className="mt-12 bg-gray-900 text-white px-6 py-12">
            <h2 className="text-3xl font-bold text-center mb-6">
                Frequently Asked Questions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 border border-gray-700 bg-gray-800 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold">❓ What can I ask for under FOIA?</h3>
                    <p className="text-gray-300 mt-2">
                        You can request records from **federal agencies**. FOIA does not require agencies to **create new records**,
                        **answer questions**, or **conduct research** for you.
                    </p>
                </div>
                
                <div className="p-6 border border-gray-700 bg-gray-800 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold">⏳ How long will it take to get a response?</h3>
                    <p className="text-gray-300 mt-2">
                        Agencies typically respond **within 20 business days**, but complex requests may take longer.
                        You can check the **agency's backlog** to estimate the wait time.
                    </p>
                </div>

                <div className="p-6 border border-gray-700 bg-gray-800 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold">💰 Are there fees for FOIA requests?</h3>
                    <p className="text-gray-300 mt-2">
                        Agencies **may charge fees** for searching, reviewing, or duplicating records.
                        However, fees are often waived for **journalists, scholars, and non-commercial requests**.
                    </p>
                </div>
                
                <div className="p-6 border border-gray-700 bg-gray-800 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold">🔍 What if my request is denied?</h3>
                    <p className="text-gray-300 mt-2">
                        If your request is denied, the agency must provide a **reason** and explain your **right to appeal**.
                        You can challenge denials through the **Office of Government Information Services (OGIS)**.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FOIAFAQ;
