import './App.css';
import React, { useState, useEffect } from 'react';
import pegasusHouseImg from './PegasusHouseLayout.png';
import Charger from './components/Charger';


function App() {
  
  return (
  <div class="building-layout">
    <img class="pegasusClass" src={pegasusHouseImg} alt="Building Layout" />
    <Charger bayID={2} />
    <Charger bayID={4} />
    <Charger bayID={6} />
    <Charger bayID={8} />
    <Charger bayID={10} />
    <Charger bayID={12} />
    
    <div class="overlay-container" id="rectangle1">
      
    </div>
    <div class="overlay-container" id="rectangle2"></div>
 
  </div>
  );
}

export default App;