
//Imports express.js
import Easee from 'easee-js-slim'
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: './keys.env' });
//Makes an instance of the express application
const app = express();
const easee = new Easee()

//Parses incoming JSON 
app.use(express.json());


app.get('/api/chargerState/:chargerID', async (req, res) => {
  //Log in and set access token to global
  const { chargerID } = req.params;
  const response = await easee.getChargerState(chargerID) 
  console.log(response)
  
  //FILTER RESPONSE
  res.json({ data: response });
  });




const port = 5000;
app.listen(port, async ()=> {
    console.log(`Server is running on port ${port}`)
    await easee.initAccessToken()
})



app.get('/api/chat', (req, res) => {




    res.send('Server is reachable!');
  });