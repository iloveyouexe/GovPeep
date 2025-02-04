import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AgencyList from "./pages/AgencyList.tsx";
import Home from "./pages/Home.tsx";
import SignIn from "./pages/SignIn.tsx";
import SignUp from "./pages/SignUp.tsx";
import Profile from "./pages/Profile.tsx";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/agency-list" element={<AgencyList />} />
                <Route path="/sign-in" element={<SignIn/>} />
                <Route path="/sign-up" element={<SignUp/>} />
                <Route path="/profile" element={<Profile/>} />
            </Routes>
        </Router>
    );
};

export default App;
