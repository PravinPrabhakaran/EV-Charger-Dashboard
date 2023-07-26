import React from 'react'



// api calls to get info on charger


const Charger = (props) => {
  console.log(props)
  console.log("bay" + (props.bayID-1))
  return (
    <div>
      <div className="chargerContainer" id={"bay" + (props.bayID-1)}>
        {props.data}
      </div>
      <div className="chargerContainer" id={"bay" + props.bayID}>
        {props.data}
      </div>
    </div>
  )
}

export default Charger