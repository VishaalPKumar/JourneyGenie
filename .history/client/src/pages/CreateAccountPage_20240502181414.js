import React, { useState } from 'react';
import { Container, Box, Typography, ThemeProvider, Button, TextField } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { safetyPreferenceMap, walkabilityPreferenceMap, weatherPreferenceMap } from '../helpers/preferences';
import { Carousel } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CustomCheckbox from '../components/CustomCheckbox';
import CustomSlider from '../components/CustomSlider';
import { useUser } from '../ApplicationState';
import config from '../config';


const theme = createTheme({
    palette: {
        primary: {
            main: '#990011'
        },
        secondary: {
            main: '#FCF6F5',
        }
    },
    typography: {
        fontFamily: 'Eczar, sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    fontFamily: 'Eczar',
                    fontSize: '1rem',
                    margin: '0.5rem',
                    backgroundColor: '#ffffff',
                    borderRadius: '1rem',
                    borderColor: '#000000',
                    borderWidth: '2px',
                    color: '#000000',
                    '&:hover': {
                        backgroundColor: '#000000',
                        color: '#ffffff',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    fontFamily: 'Eczar',
                    fontSize: '1.2rem',
                    width: '50%',
                    margin: '0.5rem',
                },
            },
        },
    },
});

const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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

function CarouselStep({ title, subtitle, children }) {
    return (
        <Box sx={{
            m: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <Typography variant="h3">{title}</Typography>
            <Typography variant="h5">{subtitle}</Typography>
            {children}
        </Box>
    );
}

export default function CreateAccountPage() {
    const { setUserId } = useUser();
    let navigate = useNavigate();
    const [index, setIndex] = useState(0);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [age, setAge] = useState('');
    const [preferences, setPreferences] = useState({
        weather: '',
        costPerMonth: [0, 100000],
        low_population: 100,
        high_population: 100000,
        employed_preferred: 'indifferent',
        walkability: 0,
        avg_income: 10000.00,
        public_transportation: 'important',
        mean_commute: 10.01,
        diversity: 'similar',
        room_type: 0,
    });

    const goToNextStep = () => {
        if (index === 0 && (!isValidEmail(email) || password.length === 0 || confirmPassword.length === 0 || password !== confirmPassword)) {
            alert('Please fill out all fields correctly.');
            return;
        }
        if (index === 1 && (firstName.length === 0 || lastName.length === 0 || isNaN(age) || parseInt(age) <= 0)) {
            alert('Please fill out all fields correctly.');
            return;
        }
        if (index === 2) {
            alert('Form submitted successfully!');
            fetch(`http://${config.server_host}:${config.server_port}/create_account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: {
                        email: email,
                        password: password,
                        first_name: firstName,
                        last_name: lastName,
                        age: age,
                    },
                    preferences: preferences,
                }),
            }).then(res => {
                if (res.status === 200) {
                    res.text().then(user_id => {
                        alert('Account created successfully!');
                        setUserId(user_id);
                        navigate('/home');
                    }
                    );
                } else {
                    alert('Error creating account');
                }
            });
            return;
        }
        setIndex(index + 1);
    };

    const handleBack = () => setIndex(index - 1);

    const handleChange = setter => e => setter(e.target.value);

    const steps = [
        <CarouselStep title="Step 1" subtitle="Create an Account">
            <FormField id="email" label="Email Address" value={email} onChange={handleChange(setEmail)} />
            <FormField id="password" label="Password" type="password" value={password} onChange={handleChange(setPassword)} />
            <FormField id="confirmPassword" label="Confirm Password" type="password" value={confirmPassword} onChange={handleChange(setConfirmPassword)} />
            <Button variant="contained" color="primary" onClick={goToNextStep}>Next</Button>
        </CarouselStep>,
        <CarouselStep title="Step 2" subtitle="Personal Information">
            <FormField id="firstName" label="First Name" value={firstName} onChange={handleChange(setFirstName)} />
            <FormField id="lastName" label="Last Name" value={lastName} onChange={handleChange(setLastName)} />
            <FormField id="age" label="Age" value={age} onChange={handleChange(setAge)} />
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mt: 2 }}>
                <Button variant="contained" color="primary" onClick={handleBack}>Back</Button>
                <Button variant="contained" color="primary" onClick={goToNextStep}>Next</Button>
            </Box>
        </CarouselStep>,
        <CarouselStep title="Step 3" subtitle="Your Preferences">
            <CustomSlider
                label="Annual Income"
                value={preferences.avg_income}
                onChange={(e, value) => setPreferences({ ...preferences, avg_income: value })}
                min={0}
                max={1000000}
                step={10000}
                marks={[
                    { value: 0, label: '$0' },
                    { value: 1000000, label: '$1,000,000' }
                ]}
                valueLabelFormat={value => `$${value}`}
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
            <CustomSlider
                label="Cost Per Month"
                value={preferences.costPerMonth}
                onChange={(e, value) => setPreferences({ ...preferences, costPerMonth: value })}
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
                label="Safety"
                value={preferences.safety}
                onChange={(e, value) => setPreferences({ ...preferences, safety: value })}
                min={0}
                max={3}
                step={null}
                marks={safetyPreferenceMap}
                valueLabelFormat={value => `${safetyPreferenceMap.find(mark => mark.value === value).label}`}
            />
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
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mt: 2 }}>
                <Button variant="contained" color="primary" onClick={() => setIndex(index - 1)}>
                    Back
                </Button>
                <Button variant="contained" color="primary" onClick={goToNextStep}>
                    Submit
                </Button>
            </Box>
        </CarouselStep>,
    ];
    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="md" data-bs-theme="dark" sx={{ mt: 10, height: '100vh' }}>
                <Carousel indicators={true} controls={false} activeIndex={index} onSelect={setIndex} interval={null}>
                    {steps.map((step, idx) => (
                        <Carousel.Item key={idx}>
                            {step}
                        </Carousel.Item>
                    ))}
                </Carousel>
            </Container>
        </ThemeProvider>
    );
}
