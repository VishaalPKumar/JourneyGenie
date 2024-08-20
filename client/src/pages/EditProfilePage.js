import React, { useEffect, useState } from 'react';
import { Typography, Button, TextField, Container, Box, CircularProgress } from '@mui/material'
import CustomCheckbox from '../components/CustomCheckbox';
import CustomSlider from '../components/CustomSlider';
import { walkabilityPreferenceMap, weatherPreferenceMap, employmentPreferenceMap, publicTransportPreferenceMap, diversityPreferenceMap, roomTypePreferenceMap } from '../helpers/preferences';
import { useUser } from '../ApplicationState';
import config from '../config';

export default function EditProfilePage() {
    const [loading, setLoading] = useState(true);

    const [userData, setUserData] = useState({
        first_name: '',
        last_name: '',
        email_address: '',
        age: '',
    });

    const [preferences, setPreferences] = useState({
        walkability: 0,
        min_cost_per_month: 0,
        max_cost_per_month: 0,
        safety: 0,
        weather: '',
        low_population: false,
        high_population: false,
        employed_preferred: false,
        avg_income: 0,
        public_transportation: false,
        diversity: false,
        room_type: 0,
    });
    const { userId } = useUser();

    useEffect(() => {
        console.log(userId);
        fetch(`http://${config.server_host}:${config.server_port}/get_user_preferences/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setPreferences(data);
            })
            .then(() => {
                fetch(`http://${config.server_host}:${config.server_port}/get_user_data/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                    .then(res => res.json())
                    .then(data => {
                        console.log(data);
                        setUserData(data);
                        setLoading(false);
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
    }, []);

    useEffect(() => {
        console.log(preferences.room_type);
    }, [preferences]);

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch(`http://${config.server_host}:${config.server_port}/update_user_preferences/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                preferences: preferences,
            })
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                alert('Preferences updated successfully!');
            })
            .catch(err => console.log(err));
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 5 }}>
                <Typography component="h1" variant="h5">
                    Edit Profile
                </Typography>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                        <CircularProgress />
                    </div>
                ) : (
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
                        <TextField
                            margin="normal"
                            disabled
                            fullWidth
                            id="name"
                            label="Name"
                            name="name"
                            autoComplete="name"
                            autoFocus
                            value={userData.first_name + ' ' + userData.last_name}
                        />
                        <TextField
                            margin="normal"
                            disabled
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            value={userData.email_address}
                        />
                        <TextField
                            margin="normal"
                            disabled
                            fullWidth
                            id="age"
                            label="Age"
                            name="age"
                            autoComplete="age"
                            value={userData.age}
                        />
                        <CustomSlider
                            label="Monthly Income"
                            value={preferences.avg_income}
                            onChange={(e, value) => setPreferences({ ...preferences, avg_income: value })}
                            min={0}
                            max={150000}
                            step={1000}
                            marks={[
                                { value: 0, label: '$0' },
                                { value: 150000, label: '$150000' }
                            ]}
                            valueLabelFormat={value => `$${value}`}
                        />
                        <CustomSlider
                            label="Cost Per Month"
                            value={[preferences.min_cost_per_month, preferences.max_cost_per_month]}
                            onChange={(e, value) => setPreferences({ ...preferences, min_cost_per_month: value[0], max_cost_per_month: value[1] })}
                            min={0}
                            max={100000}
                            step={100}
                            marks={[
                                { value: 0, label: '$0' },
                                { value: 100000, label: '$100,000' }
                            ]}
                            valueLabelFormat={value => `$${value}`}
                        />
                        <CustomSlider
                            label="Population"
                            value={[preferences.low_population, preferences.high_population]}
                            onChange={(e, value) => setPreferences({ ...preferences, low_population: value[0], high_population: value[1] })}
                            min={0}
                            max={1000000}
                            step={100}
                            marks={[
                                { value: 0, label: '0' },
                                { value: 1000000, label: '1,000,000' }
                            ]}
                            valueLabelFormat={value => `${value}`}
                        />
                        <CustomSlider
                            label="Walkability"
                            value={preferences.walkability}
                            onChange={(e, value) => setPreferences({ ...preferences, walkability: value })}
                            min={0}
                            max={3}
                            step={null}
                            marks={walkabilityPreferenceMap}
                            valueLabelFormat={value => `${walkabilityPreferenceMap.find(mark => mark.value === value).label}`}
                        />
                        <Typography>Employment</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mt: 1 }}>
                            {employmentPreferenceMap.map((em, idx) => (
                                <CustomCheckbox
                                    key={idx}
                                    label={em.label}
                                    checked={preferences.employed_preferred === em.value}
                                    onChange={() => {
                                        setPreferences({ ...preferences, employed_preferred: em.value });
                                    }}
                                />
                            ))}
                        </Box>
                        <Typography sx={{ mt: 3 }}>Public Transportation</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mt: 1 }}>
                            {publicTransportPreferenceMap.map((transport, idx) => (
                                <CustomCheckbox
                                    key={idx}
                                    label={transport.label}
                                    checked={preferences.public_transportation === transport.value}
                                    onChange={() => {
                                        setPreferences({ ...preferences, public_transportation: transport.value });
                                    }}
                                />
                            ))}
                        </Box>
                        <Typography>Weather</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mt: 2 }}>
                            {weatherPreferenceMap.map((weather, idx) => (
                                <CustomCheckbox
                                    key={idx}
                                    label={weather.label}
                                    checked={preferences.weather === weather.value}
                                    onChange={() => {
                                        setPreferences({ ...preferences, weather: weather.value });
                                    }}
                                />
                            ))}
                        </Box>
                        <Typography sx={{ mt: 3 }}>Diversity</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mt: 1 }}>
                            {diversityPreferenceMap.map((diversity, idx) => (
                                <CustomCheckbox
                                    key={idx}
                                    label={diversity.label}
                                    checked={preferences.diversity === diversity.value}
                                    onChange={() => {
                                        setPreferences({ ...preferences, diversity: diversity.value });
                                    }}
                                />
                            ))}
                        </Box>
                        <Typography sx={{ mt: 3 }}>Room Type</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mt: 1 }}>
                            {roomTypePreferenceMap.map((room_type, idx) => (
                                <CustomCheckbox
                                    key={idx}
                                    label={room_type.label}
                                    checked={preferences.room_type === room_type.value}
                                    onChange={() => {
                                        setPreferences({ ...preferences, room_type: room_type.value });
                                    }}
                                />
                            ))}
                        </Box>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Save
                        </Button>
                    </Box>)}
            </Box>
        </Container>

    );
}