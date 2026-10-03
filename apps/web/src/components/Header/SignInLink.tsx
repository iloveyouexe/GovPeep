import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const SignInLink: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);

    useEffect(() => {
        console.log('user', user);
    }, [user]);

    return (
        <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, textTransform: 'uppercase' }}>
            {!user ?
                (
                    <li style={{ marginLeft: '1rem' }}><a href="/sign-in">Sign In</a></li>
                ) : (

                    <>
                        <li><a href="/profile" style={{ marginLeft: '1rem', fontWeight: 600 }}>{user?.name}</a></li>
                        <li style={{ marginLeft: '1rem' }}>|</li>
                        <li style={{ marginLeft: '1rem' }}><a href="/sign-out">Sign Out</a></li>
                    </>
                )}
        </ul>
    );
};

export default SignInLink;