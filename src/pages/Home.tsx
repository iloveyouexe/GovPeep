import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-72px)] px-8 text-white">
            <div className="max-w-3xl text-center bg-black/30 backdrop-blur-sm rounded-2xl p-12">
                <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Welcome to GovPeep
                </h1>
                <p className="text-lg text-gray-200 mb-10 leading-relaxed">
                    The Freedom of Information Act (FOIA) grants you the right to access federal agency records.
                    Use GovPeep to streamline your public records requests with ease.
                </p>
                <button
                    onClick={() => navigate('/agency-list')}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                >
                    Browse Agencies
                </button>
            </div>
        </div>
    );
};

export default Home;
