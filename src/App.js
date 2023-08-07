import './App.css';
import React, { useState, useEffect } from 'react';
import pegasusHouseImg from './PegasusHouseLayout.png';
import Charger from './components/Charger.jsx';


function App() {

  const [hiddenInfo, setHiddenInfo] = useState([true, ""])

  return (
  <div class="building-layout">
    <img class="pegasusClass" src={pegasusHouseImg} alt="Building Layout" />

    {hiddenInfo[0] ? null : (
        <div className="hiddenInfo">
          <h1>Charger {hiddenInfo[1]["chargerID"]}</h1>
          <p>Total Power : {hiddenInfo[1]["totalPower"]}</p>
          <p>Session Energy : {hiddenInfo[1]["sessionEnergy"]}</p>
          <p>Session Duration : {hiddenInfo[1]["sessionDuration"]["hours"]} hours {hiddenInfo[1]["sessionDuration"]["minutes"]} minutes</p>
        </div>
    )}
    <Charger bayID={2} chargerIDs={["ECERZU7V", "EC29NMHG"]} setInfo={setHiddenInfo} />
    <Charger bayID={4} chargerIDs={["ECVTV7GM", "ECXGAPSZ"]} setInfo={setHiddenInfo} />
    <Charger bayID={6} chargerIDs={["ECDV245U", "ECF8REZ3"]} setInfo={setHiddenInfo} />
    <Charger bayID={8} chargerIDs={["EC829ST7", "ECHJ6TK6"]} setInfo={setHiddenInfo} />
    <Charger bayID={10} chargerIDs={["ECT5QPVT", "ECUTYZ5J"]} setInfo={setHiddenInfo} />
    <Charger bayID={12} chargerIDs={["ECAV2G5J", "EC6Z2XA6"]} setInfo={setHiddenInfo} />
  </div>
  );
}

export default App;