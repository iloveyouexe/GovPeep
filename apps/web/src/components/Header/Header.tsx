import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="flex justify-between items-center px-8 py-4 bg-black/40 backdrop-blur-md border-b border-white/10">
            <a href="/" className="text-2xl font-bold text-white hover:text-blue-400 transition-colors">
                GovPeep
            </a>
        </header>
    );
};

export default Header;