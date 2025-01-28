import React from 'react';
import SignInLink from './SignInLink';

const Header: React.FC = () => {

    return (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px 45px' }}>
            <h1 className="text-4xl font-extrabold text-center">GovPeep</h1>
            <nav>
                <SignInLink />
            </nav>
        </header>
    );
};

export default Header;