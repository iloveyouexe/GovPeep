import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AgencyList from "./pages/AgencyList.tsx";
import Home from "./pages/Home.tsx";
import SignIn from "./pages/SignIn.tsx";
import SignUp from "./pages/SignUp.tsx";
import Profile from "./pages/Profile.tsx";
import Header from "./components/Header/Header.tsx";

const App: React.FC = () => {
    return (
        <>
            {/* Global Background Video - positioned fixed, lowest layer */}
            <video
                className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
                style={{
                    height: "120vh",
                }}
                src="/GovPeepBG.mp4"
                autoPlay
                loop
                muted
                playsInline
                disablePictureInPicture
                controlsList="nodownload nofullscreen noremoteplayback"
            />
            
            {/* App Content - above video */}
            <div className="relative z-10 min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                    <Router>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/agency-list" element={<AgencyList />} />
                            <Route path="/sign-in" element={<SignIn />} />
                            <Route path="/sign-up" element={<SignUp />} />
                            <Route path="/profile" element={<Profile />} />
                        </Routes>
                    </Router>
                </main>
            </div>
        </>
    );
};

export default App;
