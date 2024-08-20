import MapChart from "../components/MapChart";
import StateInfoCard from "../components/StateInfoCard";
import React, { useEffect, useState } from 'react';
import config from '../config';
import { Typography } from "@mui/material";


export default function ExplorePage() {

    const [state, setState] = useState({
        abbr: "",
        name: "",
        population: "",
        employed_population: "",
        poverty_rate: "",
        walkability: "",
    });

    const [mapInfo, setMapInfo] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`http://${config.server_host}:${config.server_port}/get_map_info`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setMapInfo(data);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
            });
    }, []);
            
    const [showInfo, setShowInfo] = useState(false);

    const mapHandler = (event) => {
        setShowInfo(true);
        console.log(event.target.dataset.name);
        const state_info = mapInfo.find(state => state.abbr === event.target.dataset.name);
        console.log(state_info);
        setState({
            abbr: state_info.abbr,
            name: state_info.name,
            population: state_info.pop,
            employed_population: state_info.employed_pop,
            poverty_rate: state_info.pov_perc,
            walkability: state_info.walk,
        });
    };

    const closeInfo = () => {
        setShowInfo(false);
    };
    return (
        <div>
            <Typography 
                variant="h4"
                align="center"
                sx={{marginTop: 2, marginBottom: 2, fontWeight: 'bold'}}
                >
                Explore the U.S. 
            </Typography>
            {loading ? 
                <div>Loading...</div> : 
                <div style={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center'}}>
                <MapChart onClick={mapHandler}/>
                </div>}
            {showInfo && <StateInfoCard state={state} showInfo={closeInfo} onClose={closeInfo}/>}
        </div>
    );
}