import React from 'react';
import SignInLink from './SignInLink';

const Header: React.FC = () => {

    return (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px 45px', backgroundColor: '#555' }}>
            <a href="/" className="text-4xl font-extrabold text-center">GovPeep</a>
            <nav>
                <SignInLink />
            </nav>
        </header>
    );
};

export default Header;