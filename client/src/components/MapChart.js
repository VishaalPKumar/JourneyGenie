import React, { useState } from 'react';
import USAMap from "react-usa-map";
import "./mapchart.css";

export default function MapChart({ onClick }) {


  return (
    <div>
      <USAMap onClick={onClick} />
    </div>
  );
}