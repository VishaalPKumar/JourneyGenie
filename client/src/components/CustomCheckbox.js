import React from 'react';
import { Checkbox, Typography, Box } from '@mui/material';


function CustomCheckbox({ label, checked, onChange }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 2 }}>
            <Checkbox checked={checked} onChange={onChange} />
            <Typography>{label}</Typography>
        </Box>
    );
}

export default CustomCheckbox;