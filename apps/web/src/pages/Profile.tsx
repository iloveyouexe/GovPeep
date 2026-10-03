// a basic profile page that reads store.auth.user and displays the user's name, email, and last login date

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Chip, Grid2, Paper } from '@mui/material';

const Profile: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);

    if (!user) {
        return <h1>No user found.</h1>;
    }

    const displayAttribute = (obj: NonNullable<RootState['auth']['user']>) => {

        return Object.entries(obj).filter(([key]) => key !== 'password').map(([key, value]) => {
            return (
                <li key={key} style={{ marginBottom: 5 }}>
                    <strong>{key}: </strong>
                    <Chip variant="outlined" label={String(value)} />
                </li>
            );
        });
    };

    return (
        <Grid2 container spacing={3}>
            <Grid2>
                <h1>Profile</h1>
                <Paper sx={{ p: 3, bgcolor: '#999' }}>
                    <ul>
                        {displayAttribute(user)}
                    </ul>
                </Paper>
            </Grid2>
            <Grid2>
            <h1>Bookmarks</h1>
                <Paper sx={{ p: 3, bgcolor: '#999' }}>
                    <ul>
                        {/* {displayAttribute(user)} */}
                        will list bookmarked agencies
                    </ul>
                </Paper>
            </Grid2>
        </Grid2>
    );
};

export default Profile;
