import React from 'react';
import { Link } from 'react-router-dom';
import { Box, TextField } from '@mui/material';

const SignIn: React.FC = () => {
    return (
        <Box className="sign-in-container" sx={{ '& .MuiTextField-root': { m: 1 } }}>
            <h1>Sign In</h1>
            <TextField label="Email" variant="outlined" className="w-[60%] -mb-[15px]" />
            <TextField label="Password" variant="outlined" className="w-[60%] -mb-[15px]"/>
            <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md w-1/5">Sign In</button>
            <Link to="/sign-up" className="already-have">
                Don't have an account? Sign Up
            </Link>
        </Box>
    );
};

export default SignIn;