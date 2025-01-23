import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";
import SearchResultsError from "./pages/SearchResultsError";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/results" element={<SearchResults />} />
                <Route path="/error" element={<SearchResultsError />} />
            </Routes>
        </Router>
    );
};

export default App;
