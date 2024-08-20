import React from 'react';
import LazyTable from '../components/LazyTable';
import { Container, Box, Typography, Divider } from '@mui/material';
import { useUser } from '../ApplicationState';
import { NavLink, useParams } from 'react-router-dom';


export default function Cities() {

    const { userId } = useUser();
    const { state } = useParams();
    const city_endpoint = `http://localhost:8080/${userId}/${state}/cities`;
    console.log(city_endpoint);
    console.log('Welcome User',userId);

    const cityColumns = [
        {
            field: 'city',
            headerName: 'Name',
            renderCell: (row) => {
                return (
                    <NavLink to={`/listings/${row.city}`}> {row.city} </NavLink>
                );
            }
        },
        {
            field: 'listing_count',
            headerName: 'Available Listings',
            renderCell: (row) => <div>{row.listing_count}</div>
        },
        {
            field: 'income',
            headerName: 'Average Income',
            renderCell: (row) => <div>{row.Avg_Income}</div>
        },
    ];

    return (
        <Container maxWidth="md">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
                <Typography variant="h4">Cities in {state}</Typography>
                <Divider sx={{ width: '100%', my: 2 }} />
                <LazyTable route={city_endpoint} columns={cityColumns} defaultPageSize={5} rowsPerPageOptions={[5, 10, 25]} />
            </Box>
        </Container>

    );
}