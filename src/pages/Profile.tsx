// a basic profile page that reads store.auth.user and displays the user's name, email, and last login date

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const Profile: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);

    if (!user) {
        return <h1>No user found.</h1>;
    }

    return (
        <div>
            <h1>Profile</h1>
            <h2>{user?.name}</h2>
            <h3>{user?.email}</h3>
            <p>Last login: {JSON.stringify(user?.lastLogin)}</p>
        </div>
    );
};

export default Profile;