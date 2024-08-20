import React from 'react';
import './stateinfocard.css';
import { Button, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';

const StateInfoCard = ({ state, showInfo, onClose }) => {
    if (!showInfo) return null;
    return (
      <div className="info-card-backdrop" onClick={onClose}>
        <div className="info-card" onClick={e => e.stopPropagation()}>
          <Typography variant="h4" gutterBottom>
            <NavLink to={`/state-info/${state.name}`}>
              {state.name} ({state.abbr})
            </NavLink>
          </Typography>
          <Typography variant="h6">Population: {state.population.toLocaleString()}</Typography>
          <Typography variant="h6">Employed Population: {state.employed_population.toLocaleString()}</Typography>
          <Typography variant="h6">Poverty Rate: {state.poverty_rate.toFixed(2)}%</Typography>
          <Typography variant="h6">Walkability: {state.walkability.toFixed(2)}</Typography>
          <Button variant="contained" color="primary" onClick={onClose}
            sx={{marginTop:2}}> Close </Button>
        </div>
      </div>
  );
};

export default StateInfoCard;