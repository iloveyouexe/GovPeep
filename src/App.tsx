import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AgencyList from "./pages/AgencyList.tsx";
import Home from "./pages/Home.tsx";
import SignIn from "./pages/SignIn.tsx";
import SignUp from "./pages/SignUp.tsx";
import Profile from "./pages/Profile.tsx";
import { Box, Container } from "@mui/material";
import Header from "./components/Header/Header.tsx";

const App: React.FC = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh'
            }}
        >
            <Header />
            <Container sx={{
                p: 6, 
                flex: 1, 
                display: 'flex',
            }} className="bg-gray-900" disableGutters maxWidth={false}>
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/agency-list" element={<AgencyList />} />
                        <Route path="/sign-in" element={<SignIn />} />
                        <Route path="/sign-up" element={<SignUp />} />
                        <Route path="/profile" element={<Profile />} />
                    </Routes>
                </Router>
            </Container>
        </Box>
    );
};

export default App;
