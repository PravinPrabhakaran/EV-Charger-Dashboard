import React, { useState, useEffect} from 'react';


// api calls to get info on charger

const getChargerDetails = async (chargerID, setBayData) => {
  try {
    const response = await fetch(`/api/chargerState/${chargerID}`)
    
    if (!response.ok) {
      console.log(response)
      console.error('Error sending message');
    }

    const data = await response.json();
    setBayData(data["data"])
  }

  catch (error) {
    console.error(error)
  }
}


function convertDecimalToTime(decimalHours) {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  console.log(hours, minutes)
  return { hours, minutes };
}


const Charger = (props) => {

  const [bay1Data, setBay1Data] = useState(undefined)
  const [bay2Data, setBay2Data] = useState(undefined)


  useEffect(() => {
    if (bay1Data === undefined) {
      getChargerDetails(props.chargerIDs[0], setBay1Data);
    }
  }, [bay1Data]);

  useEffect(() => {
    if (bay2Data === undefined) {
      getChargerDetails(props.chargerIDs[1], setBay2Data);
    }
  }, [bay2Data]);

  var inUseIndicator1 ={ backgroundColor: '#f5f507' };
  var inUseIndicator2 =  { backgroundColor: '#f5f507' };
  
  if (bay1Data) {
    inUseIndicator1 = bay1Data["cableLocked"] ? { backgroundColor: '#33ff00' } : { backgroundColor: '#f20202' };
  }

  if (bay2Data) {
    inUseIndicator2 = bay2Data["cableLocked"] ? { backgroundColor: '#33ff00' } : { backgroundColor: '#f20202' };
  }
  
  var displayExtraInfo = (data) => {
    console.log(data)

    var sessionDuration = convertDecimalToTime(parseFloat(data["sessionEnergy"])/parseFloat(data["energyPerHour"]))

    var cleanData = {"totalPower": data["totalPower"], 
                    "sessionEnergy": data["sessionEnergy"],
                     "sessionDuration": sessionDuration}
    props.setInfo([false, cleanData])
  }
  
  return (
    <div>
      <div className="chargerContainer" id={"bay" + (props.bayID-1)} style={{...inUseIndicator1}} onClick={() => {displayExtraInfo(bay1Data)}}>
        <h1 className="bayLabel">{props.bayID-1}</h1>
      </div>
      <div className="chargerContainer" id={"bay" + props.bayID} style={{...inUseIndicator2}} onClick={() => {displayExtraInfo(bay2Data)}}>
        <h1 className="bayLabel">{props.bayID}</h1>
      </div>
    </div>
  )
}





export default Charger



