import React from 'react';
import { Slider, Typography, Box } from '@mui/material';

function CustomSlider({ label, value, onChange, min, max, step, marks, valueLabelFormat }) {
    return (
        <Box sx={{ mt: 2, width: '100%' }}>
            <Typography>{label}</Typography>
            <Slider
                value={value}
                onChange={onChange}
                valueLabelDisplay="auto"
                min={min}
                max={max}
                step={step}
                marks={marks}
                valueLabelFormat={valueLabelFormat}
            />
        </Box>
    );
}

export default CustomSlider;

