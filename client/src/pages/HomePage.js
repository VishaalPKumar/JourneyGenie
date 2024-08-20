import React from 'react';
import states from '../dummydata/states.json';
import cities from '../dummydata/cities.json';
import LazyTable from '../components/LazyTable';
import { Container, Box, Typography, Divider } from '@mui/material';
import { useUser } from '../ApplicationState';
import { NavLink, useLocation } from 'react-router-dom';


export default function HomePage() {

    const { userId } = useUser();
    console.log('Welcome User',userId);

    const stateColumns = [
        {
            field: 'name',
            headerName: 'Name',
            renderCell: (row) => <NavLink to={`/cities/${row.city_id}`}> {row.city_id} </NavLink>
        },
        {
            field: 'capital',
            headerName: 'Capital',
            renderCell: (row) => <div>{row.capital}</div>
        },
        {
            field: 'population',
            headerName: 'Population',
            renderCell: (row) => <div>{row.population}</div>
        }
    ];

    const city_rec_endpoint = `http://localhost:8080/${userId}/cities`;
    const cityColumns = [
        {
            field: 'city',
            headerName: 'City',
            renderCell: (row) => {
                return (
                    <NavLink to={`/listings/${row.city}`} state={{id:row.city_id}}> {row.city} </NavLink>
                );
            }
        },
        {
            field: 'state',
            headerName: 'State',
            renderCell: (row) => <div>{row.state_name}</div>
        },
        {
            field: 'listing_count',
            headerName: 'Available Listings',
            renderCell: (row) => <div>{row.listing_count}</div>
        },
        {
            field: 'income',
            headerName: 'Average Income',
            renderCell: (row) => <div>{row.city_income}</div>
        },
        {
            field: 'population',
            headerName: 'Population',
            renderCell: (row) => <div>{row.city_population}</div>
        },
        {
            field: 'walkability',
            headerName: 'Walkability',
            renderCell: (row) => <div>{row.city_walkability}</div>
        },
        {
            field: 'diversity',
            headerName: 'Diversity Score',
            renderCell: (row) => <div>{row.city_diversity}</div>
        },
        {
            field: 'public transport',
            headerName: 'Public Transport',
            renderCell: (row) => <div>{row.city_public_transport}</div>
        },
    ];

    return (
        <Container maxWidth="md">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
                <Typography variant="h4">Welcome to Journey Genie</Typography>
                {/* <Divider sx={{ width: '100%', my: 2 }} />
                <Typography variant="h6">States </Typography>
                <LazyTable dummydata={states.states} columns={stateColumns} defaultPageSize={5} rowsPerPageOptions={[5, 10, 25]} /> */}
                <Divider sx={{ width: '100%', my: 2 }} />
                <Typography variant="h6">Cities</Typography>
                <Divider sx={{ width: '100%', my: 2 }} />
                <LazyTable route={city_rec_endpoint} columns={cityColumns} defaultPageSize={5} rowsPerPageOptions={[5, 10, 25]} />
            </Box>
        </Container>

    );
}