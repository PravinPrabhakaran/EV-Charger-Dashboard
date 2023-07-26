import './App.css';
import React, { useState, useEffect } from 'react';
import pegasusHouseImg from './PegasusHouseLayout.png';

function App() {
  
  return (
  <div class="building-layout">
    <img class="pegasusClass" src={pegasusHouseImg} alt="Building Layout" />
    <div class="overlay-container" id="rectangle1">
      
    </div>
    <div class="overlay-container" id="rectangle2"></div>
 
  </div>
  );
}

export default App;