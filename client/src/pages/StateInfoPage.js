import React, { useEffect, useState } from 'react';
import { Grid, Typography, Paper, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import config from '../config';
import LazyTable from '../components/LazyTable';


const cityColumns = [
    {
        field: 'City',
        headerName: 'City',
        renderCell: (row) => <div>{row.City}</div>
    },
    {
        field: 'County',
        headerName: 'County',
        renderCell: (row) => <div>{row.County}</div>
    }
];



const StateInfoPage = () => {
    const { stateName } = useParams();
    const [stateInfoLoading, setStateInfoLoading] = useState(true);
    const [stateInfo, setStateInfo] = useState([]);
    const getStateInfoRoute = `http://${config.server_host}:${config.server_port}/get_state_info/${stateName}`
    const getCitiesInStateRoute = `http://${config.server_host}:${config.server_port}/get_cities/${stateName}`

    useEffect(() => {
        setStateInfoLoading(true);
        fetch(getStateInfoRoute, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(res => res.json())
            .then(data => {
                setStateInfoLoading(false);
                setStateInfo(data);
                console.log(data);
            })
            .catch(err => {
                console.log(err);
                setStateInfoLoading(false);
            });
    }, []);


    return (
        <div style={{ padding: '20px' }}>
        <br />
        <h1 style={{ textAlign: 'center' }}>{stateName}</h1>
        <br />
        <div style={{ display: 'flex', justifyContent: 'center', spacing: 3 }}>
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper elevation={3}>
                    <Typography variant="h5" align="center" gutterBottom>State Information</Typography>
                    <Grid container justifyContent="center">
                        {stateInfoLoading || stateInfo.length === 0 ? <CircularProgress /> :
                            <>
                                <Grid item xs={6}>
                                    <Paper elevation={2} style={{ padding: '10px' }}>
                                        <Typography variant="h6" align="center">2015 Data</Typography>
                                        <div>
                                            <Typography variant="body1">Population: {stateInfo[0]?.total_population}</Typography>
                                            <Typography variant="body1">Employed Population: {stateInfo[0]?.total_employed_population}</Typography>
                                            <Typography variant="body1">Average Income: ${stateInfo[0]?.avg_avg_income}</Typography>
                                            <Typography variant="body1">Poverty Rate: {stateInfo[0].avg_poverty_percent}</Typography>
                                            <Typography variant="body1">Walkability: {stateInfo[0].avg_walkability}</Typography>
                                            <Typography variant="body1">Diversity: {stateInfo[0].diversity}</Typography>
                                            <Typography variant="body1">Job Diversity: {stateInfo[0].job_diversity}</Typography>
                                            <Typography variant="body1"> Top Mode of Transport: {stateInfo[0].top_mode_of_transport}</Typography>
                                            <Typography variant="body1"> Work from Home: {stateInfo[0].work_from_home}</Typography>
                                        </div>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6}>
                                    <Paper elevation={2} style={{ padding: '10px' }}>
                                        <Typography variant="h6" align="center">2017 Data</Typography>
                                        <div>
                                            <Typography variant="body1">Population: {stateInfo[1]?.total_population}</Typography>
                                            <Typography variant="body1">Employed Population: {stateInfo[1]?.total_employed_population}</Typography>
                                            <Typography variant="body1">Average Income: ${stateInfo[1]?.avg_avg_income}</Typography>
                                            <Typography variant="body1">Poverty Rate: {stateInfo[1].avg_poverty_percent}</Typography>
                                            <Typography variant="body1">Walkability: {stateInfo[1].avg_walkability}</Typography>
                                            <Typography variant="body1">Diversity: {stateInfo[1].diversity}</Typography>
                                            <Typography variant="body1">Job Diversity: {stateInfo[1].job_diversity}</Typography>
                                            <Typography variant="body1"> Top Mode of Transport: {stateInfo[1].top_mode_of_transport}</Typography>
                                            <Typography variant="body1"> Work from Home: {stateInfo[1].work_from_home}</Typography>
                                            
                                        </div>
                                    </Paper>
                                </Grid>
                            </>
                        }
                    </Grid>
                </Paper>
            </Grid>
        </Grid>
        </div >
        <br />
        <Typography variant="h5" align="center" gutterBottom>Top Cities</Typography>
        <LazyTable route={getCitiesInStateRoute} columns={cityColumns} defaultPageSize={5} rowsPerPageOptions={[5,10]}/>
        </div>
    );
};

export default StateInfoPage;