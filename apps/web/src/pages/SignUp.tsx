import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signup } from '../store/authSlice';
import { RootState } from '../store/store';

const SignUp: React.FC = () => {
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

    const signUp = () => {
        if (email && password) {
            dispatch(signup({ email, password }));
        } else {
            setError('Please fill all the fields');
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-cover bg-center">
            <div className="absolute inset-0"></div>

            <form className="relative z-10 flex flex-col gap-6 p-6 bg-transparent text-white text-lg">
                <h1 className="text-3xl font-bold text-center">Sign Up</h1>

                <fieldset className="border-2 border-white rounded-md focus-within:border-red-600">
                    <legend className="ml-3 px-2 text-lg">Email *</legend>
                    <input
                        type="email"
                        className="w-[220px] bg-transparent text-white text-xl p-2 outline-none"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </fieldset>

                <fieldset className="border-2 border-white rounded-md focus-within:border-red-600">
                    <legend className="ml-3 px-2 text-lg">Password *</legend>
                    <input
                        type="password"
                        className="w-[220px] bg-transparent text-white text-xl p-2 outline-none"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </fieldset>

                <button
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold rounded-md transition"
                    onClick={signUp}
                >
                    Sign Up
                </button>

                {error && <p className="text-red-400">{error}</p>}

                <Link to="/sign-in" className="text-white text-center underline hover:text-gray-300">
                    Already have an account? Sign In
                </Link>
            </form>
        </div>
    );
};

export default SignUp;
