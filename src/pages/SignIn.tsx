import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, TextField } from '@mui/material';
import { signin } from '../store/authSlice';
import { RootState } from '../store/store';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';


const SignIn: React.FC = () => {

    const auth = useSelector((state: RootState) => state.auth);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (auth.user !== null) {
            navigate('/');
            
        } else if (auth.error) {
            setError(auth.error);
        }
    }, [auth, navigate]);

    const signIn = () => {
        if (email && password) {
            dispatch(signin({ email, password }));
        }
    }

    return (
        <Box className="sign-in-container" sx={{ '& .MuiTextField-root': { m: 1 } }}>
            <h1>Sign In</h1>
            <TextField
                label="Email"
                variant="outlined"
                className="w-[60%] -mb-[15px]"
                onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
                label="Password"
                variant="outlined"
                className="w-[60%] -mb-[15px]"
                onChange={(e) => setPassword(e.target.value)}
            />
            <button
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md w-1/5"
                onClick={signIn}
            >
                Sign In
            </button>
            {error && <p className="text-red-500">{error}</p>}
            <Link to="/sign-up" className="already-have">
                Don't have an account? Sign Up
            </Link>
        </Box>
    );
};

export default SignIn;