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

  var inUseIndicator1 ={ backgroundColor: 'yellow' };
  var inUseIndicator2 =  { backgroundColor: 'yellow' };
  
  if (bay1Data) {
    inUseIndicator1 = bay1Data["cableLocked"] ? { backgroundColor: 'green' } : { backgroundColor: 'red' };
  }

  if (bay2Data) {
    inUseIndicator2 = bay2Data["cableLocked"] ? { backgroundColor: 'green' } : { backgroundColor: 'red' };
  }
  
  
  return (
    <div>
      <div className="chargerContainer" id={"bay" + (props.bayID-1)} style={{...inUseIndicator1}}>
        {props.data}
      </div>
      <div className="chargerContainer" id={"bay" + props.bayID} style={{...inUseIndicator2}}>
        {props.data}
      </div>
    </div>
  )
}





export default Charger



