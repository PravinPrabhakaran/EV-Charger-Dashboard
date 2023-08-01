import './App.css';
import React, { useState, useEffect } from 'react';
import pegasusHouseImg from './PegasusHouseLayout.png';
import Charger from './components/Charger.jsx';


function App() {

  return (
  <div class="building-layout">
    <img class="pegasusClass" src={pegasusHouseImg} alt="Building Layout" />
    <Charger bayID={2} chargerIDs={["ECDV245U", "ECF8REZ3"]} />
    
    <Charger bayID={4} chargerIDs={["ECDV245U", "ECF8REZ3"]} />
    <Charger bayID={6} chargerIDs={["ECDV245U", "ECF8REZ3"]} />
    <Charger bayID={8} chargerIDs={["ECDV245U", "ECF8REZ3"]} />
    <Charger bayID={10} chargerIDs={["ECDV245U", "ECF8REZ3"]} />
    <Charger bayID={12} chargerIDs={["ECDV245U", "ECF8REZ3"]} />
  </div>
  );
}

export default App;