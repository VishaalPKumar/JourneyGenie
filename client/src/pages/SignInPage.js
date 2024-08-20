import React, { useEffect, useState } from 'react';
import { Button, TextField, Container, Box, Link, Typography, keyframes, CircularProgress } from '@mui/material';
import logo from '../assets/logo.png';
import config from '../config';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../ApplicationState';

export default function SignInPage() {
    let navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
    `;

    const { userId, setUserId } = useUser();

    const handleSignIn = (e) => {
        e.preventDefault();
        setLoading(true);
        console.log(email, password);
        fetch(`http://${config.server_host}:${config.server_port}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        })
            .then(res => res.text())
            .then(data => {
                setLoading(false);
                if (data) {
                    alert('Login successful!');
                    setUserId(data);
                    navigate('/home');
                } else {
                    alert('Login failed!');
                }
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (userId) {
            setUserId('');
        }
    }, []);


    return (
        <Container maxWidth="sm">
            <Box sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Eczar',
            }}>
                <Box
                    component="img"
                    sx={{ width: 200, height: 200 }}
                    alt="Journey Genie Logo"
                    src={logo} />
                <Typography
                    variant="h3"
                    sx={{
                        fontFamily: "Eczar",
                        mt: 2,
                        animation: `${fadeIn} 2s ease-out`
                    }}>
                    Journey Genie
                </Typography>
                <Box sx={{ mt: 1 }}>
                    <TextField
                        id="email"
                        label="Email Address"
                        value={email}
                        name="email"
                        autoComplete="email"
                        type="email"
                        required
                        margin="normal"
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        autoFocus
                    />
                    <TextField
                        id="password"
                        value={password}
                        label="Password"
                        name="password"
                        type="password"
                        required
                        margin="normal"
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        onClick={handleSignIn}
                        disabled={!email || !password || loading}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Sign In'}
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Link href="/create-account" variant="body2" sx={{ mb: 1 }}>
                        Create An Account
                    </Link>
                </Box>
            </Box>
        </Container>
    );
};