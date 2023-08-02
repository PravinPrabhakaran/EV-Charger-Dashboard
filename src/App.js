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
          Total Power :
          {hiddenInfo[1]["totalPower"]}
          <br></br>
          Session Energy : 
          &nbsp;{hiddenInfo[1]["sessionEnergy"]}
          <br></br>
          Session Duration :
          &nbsp;{hiddenInfo[1]["sessionDuration"]["hours"]}
          &nbsp;hours 
          &nbsp;{hiddenInfo[1]["sessionDuration"]["minutes"]}
          minutes
        </div>
    )}
    <Charger bayID={2} chargerIDs={["ECDV245U", "ECF8REZ3"]} setInfo={setHiddenInfo} />
    <Charger bayID={4} chargerIDs={["ECDV245U", "ECF8REZ3"]} setInfo={setHiddenInfo} />
    <Charger bayID={6} chargerIDs={["ECDV245U", "ECF8REZ3"]} setInfo={setHiddenInfo} />
    <Charger bayID={8} chargerIDs={["ECDV245U", "ECF8REZ3"]} setInfo={setHiddenInfo} />
    <Charger bayID={10} chargerIDs={["ECDV245U", "ECF8REZ3"]} setInfo={setHiddenInfo} />
    <Charger bayID={12} chargerIDs={["ECDV245U", "ECF8REZ3"]} setInfo={setHiddenInfo} />
  </div>
  );
}

export default App;