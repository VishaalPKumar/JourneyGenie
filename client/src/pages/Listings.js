//import React from 'react';
import React, { useState, useEffect } from 'react';
import LazyTable from '../components/LazyTable';
import { Container, Box, Typography, Divider, TextField, Button, FormControl, FormLabel, 
    RadioGroup, Radio, FormControlLabel} from '@mui/material';
import { useUser } from '../ApplicationState';
import { useLocation, useParams } from 'react-router-dom';
import CustomSlider from '../components/CustomSlider';
import CustomCheckbox from '../components/CustomCheckbox';
import { DataGrid } from '@mui/x-data-grid';

function FormField({ id, label, type = 'text', value, onChange, fullWidth = true }) {
    return (
        <TextField
            id={id}
            label={label}
            type={type}
            name={id}
            value={value}
            onChange={onChange}
            fullWidth={fullWidth}
        />
    );
}


export default function Listings() {

    const { userId } = useUser();
    const city_name = useParams().city;
    const loc = useLocation();
    const city_id = loc.state.id;
    console.log('Welcome User',userId);


    const [filter, setFilter] = useState({
        price: [0, 100000],
        roomT: -1,
        done: false
    });

    const changePriceLow = (e) => {
        var p = filter.price;
        setFilter({...filter, price : [e.target.value, p[1]]});
    }
    const changePriceHigh = (e) => {
        var p = filter.price;
        setFilter({...filter, price : [p[0], e.target.value]});
    }

    const changeRoomT = (v) => {
        setFilter({...filter, roomT : v});
    }

    const [listings, setListings] = useState([]);
    const [pageSize, setPageSize] = useState(5);


    useEffect(() => {
        if (filter.done) {
            return;
        }
        console.log("use effect");
        var e = `http://localhost:8080/get_user_preferences/${userId}`;
        fetch(e).then(r => r.json())
        .then(j => {
            var low = j.min_cost_per_month / 30;
            low = low.toFixed(2);
            var high = j.max_cost_per_month / 30;
            high = high.toFixed(2);
            var r = j.room_type % 3;
            setFilter({roomT : r, price: [low, high], done : true});
            console.log(filter);
            var e = `http://localhost:8080/${city_name}/listings?city_id=${city_id}&price_low=${low}&price_high=${high}&roomT=${r}`;
            fetch(e).then(r => r.json())
            .then(j => {
                //console.log(j);
                const toDisplay = j.map((r) => ({id: r.listing_id, ...r}));
                console.log(toDisplay);
                setListings(toDisplay);
            });
        });   
    }, [filter.done]);

    console.log(filter);

    const update = () => {
        console.log('updating');
        var e = `http://localhost:8080/${city_name}/listings?city_id=${city_id}&price_low=${filter.price[0]}&price_high=${filter.price[1]}&roomT=${filter.roomT}`;
        fetch(e).then(r => r.json())
        .then(j => {
            const toDisplay = j.map((r) => ({id: r.listing_id, ...r}));
            setListings(toDisplay);
        });
    }

    //const [endpoint, setEndpoint] = useState(`http://localhost:8080/${city_name}/listings?city_id=${city_id}&price_low=${filter.price_low}$price_high=${filter.price_high}`);

    const listingColumns = [ 
        {
            field: 'id',
            headerName: 'Listing id',
            width : 100,
            renderCell : (p) => {
                return <a href="https://www.airbnb.com" target="_blank">{p.value}</a>;
            }
        },
        {
            field: 'description',
            headerName: 'Description',
            width: 500,
        },
        {
            field: 'price',
            headerName: 'Price',
            width: 100
        },
        {
            field: 'host_name',
            headerName: 'Host',
        }
    ]; 

    return (
        <Container maxWidth="md">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
                <Typography variant="h4">Listings in {city_name}</Typography>
                <FormField id="price_low" label="Price Low" value={filter.price[0]} onChange={changePriceLow} />
                <Divider sx={{ width: '100%', my: 2 }} />
                <FormField id="price_high" label="Price High" value={filter.price[1]} onChange={changePriceHigh} />
                <Divider sx={{ width: '100%', my: 2 }} />
                <FormControl>
                    <FormLabel id="room_type_select_label">Room Type</FormLabel>
                    <RadioGroup
                        aria-labelledby="room-type-buttons-group-label"
                        name="room_type_radio_group"
                        value={(filter.roomT)}
                        onChange={(e) => {changeRoomT(e.target.value)}}
                    >
                        <FormControlLabel value="0" control={<Radio />} label="Entire home/apt" />
                        <FormControlLabel value="1" control={<Radio />} label="Private room" />
                        <FormControlLabel value="2" control={<Radio />} label="Shared room" />
                        <FormControlLabel value="3" control={<Radio />} label="Hotel room" />
                    </RadioGroup>
                    </FormControl>
                <Divider sx={{ width: '100%', my: 2 }} />
                <Button variant="contained" color="primary" onClick={update}>Update</Button>
                <Divider sx={{ width: '100%', my: 2 }} />
                <div style={{ height: 300, width: '100%' }}>
                <DataGrid rows={listings} columns={listingColumns} pageSize={pageSize} rowsPerPageOptions={[5, 10, 25]} onPageSizeChange={(newPageSize) => setPageSize(newPageSize)} autoHeight />
                </div>
            </Box>
        </Container>

    );
}