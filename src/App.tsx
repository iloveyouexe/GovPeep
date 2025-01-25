import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AgencyList from "./pages/AgencyList.tsx";
import Home from "./pages/Home.tsx";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/agency-list" element={<AgencyList />} />
                <Route path="/" element={<Home />} />
            </Routes>
        </Router>
    );
};

export default App;
