import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                textAlign: 'center',
                margin: 'auto'
            }}
        >
            {/* Background Video */}
            <video
                className="fixed top-0 left-0 w-full h-full object-cover z-[-1]"
                src="/src/assets/bg/GovPeepBG.mp4"
                autoPlay
                loop
                muted
                playsInline
            ></video>
            
            {/* <div className="relative flex flex-col items-center justify-center min-h-screen p-8 bg-gray-900 bg-opacity-50 text-white"> */}
                <h1 className="text-4xl font-extrabold text-center mb-6">
                    Welcome to GovPeep
                </h1>
                <p className="text-lg text-white text-center mb-10 max-w-2xl">
                    The Freedom of Information Act (FOIA) grants you the right to access federal agency records. Use GovPeep to streamline your public records requests with ease.
                </p>
                <button
                    onClick={() => navigate('/agency-list')}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300"
                >
                    View Agencies
                </button>
            {/* </div> */}
        </Box>
    );
};

export default Home;
