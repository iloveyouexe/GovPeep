import React from 'react';

const SignInLink: React.FC = () => {
    const isSignedIn = true;

    return (
        <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, textTransform: 'uppercase' }}>
            {isSignedIn ? (
                <li style={{ marginLeft: '1rem' }}><a href="/sign-in">Sign In</a></li>
            ) : (
                <li style={{ marginLeft: '1rem' }}><a href="/sign-out">Sign Out</a></li>
            )}
        </ul>
    );
};

export default SignInLink;