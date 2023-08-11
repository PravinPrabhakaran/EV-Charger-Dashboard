
//Imports express.js
import Easee from 'easee-js-slim'
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { WebClient } from '@slack/web-api';


dotenv.config({ path: './keys.env' });

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// Initialize Slack API client
const slackToken = 'YOUR_SLACK_TOKEN';
const slackClient = new WebClient(slackToken);

// Maintain a queue of users
var chargerDetails = [{'chargerID': 'ECERZU7V','inUse':false,'assignedTo':undefined,'state':undefined},
                    {'chargerID': 'ECERZU7V','inUse':false,'assignedTo':undefined,'state':undefined},
                    {'chargerID': 'ECERZU7V','inUse':false,'assignedTo':undefined,'state':undefined},
                    {'chargerID': 'ECERZU7V','inUse':false,'assignedTo':undefined,'state':undefined},
                    {'chargerID': 'ECERZU7V','inUse':false,'assignedTo':undefined,'state':undefined},
                    {'chargerID': 'ECERZU7V','inUse':false,'assignedTo':undefined,'state':undefined}]
var allChargersInuse = false
var user_queue = []

chargerStates()
// Schedule charger status update and queue processing every 10 minutes
setInterval(() => {
    chargerStates();
}, 600000); // 10 minutes in milliseconds


function chargerStates() {
    allChargerStatus()

    if (user_queue.length > 0 && !allChargersInuse) {
        for (var charger of chargerDetails) {
            if (!charger['inuse']) {
                var person = processQueue()
                assignCharger(person, charger)
            }
            if (charger['state'] && charger['state'] != 0) {
                charger['state'] += 1;
            }
        }
    }

}

async function allChargerStatus() {
    const easee = new Easee()
    //Log in and set access token to global
    await easee.initAccessToken()
    var allTrue = true;
    for (var charger of chargerDetails) {
        const response = await easee.getChargerState(charger['chargerID']) 

        if (charger['assignedTo']) {
            if (response['cableLocked'] && charger['state'] == 0) {
                charger['state'] = 1
            }
            charger['inUse'] = true;
            continue
        }

        if (response['cableLocked']) {
            charger['inUse'] = true
        }
        else {
            charger['inUse'] = false
            allTrue = false
        }
    }
    allChargersInuse = allTrue;
}



app.listen(port, async ()=> {
    console.log(`Server is running on port ${port}`)
})