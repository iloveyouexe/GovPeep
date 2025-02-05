import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, TextField } from '@mui/material';
import { signup } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';
import { useSelector, useDispatch } from 'react-redux';

const SignUp: React.FC = () => {

    const auth = useSelector((state: RootState) => state.auth);

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        console.log('auth', auth);
        if (auth.user !== null) {
            navigate('/');
        } else if (auth.error) {
            setError(auth.error);
        }

    }, [auth, navigate]);

    const signUp = () => {
        console.log('email : password - ', email + ' : ' + password);
        if (email && password) {
            dispatch(signup({ email, password }));
        } else {
            setError('Please fill all the fields');
        }
    };

    return (
        <Box className="sign-in-container" sx={{ '& .MuiTextField-root': { m: 1 } }}>
            <h1>Sign Up</h1>
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
                onClick={signUp}
            >
                Sign Up
            </button>
            {error && <p className="text-red-500">{error}</p>}
            <Link to="/sign-in" className="already-have">
                Already have an account? Sign In
            </Link>
        </Box>
    );
};
export default SignUp;