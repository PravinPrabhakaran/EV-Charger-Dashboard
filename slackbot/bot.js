
//Imports express.js
import Easee from 'easee-js-slim'
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { WebClient } from '@slack/web-api';


dotenv.config({ path: './keys.env' });

const app = express();
const port = process.env.PORT || 3000;

// Initialize Slack API client
const slackToken = 'YOUR_SLACK_TOKEN';
const slackClient = new WebClient(slackToken);

// Maintain a queue of users
const userQueue = [];
const allChargersFull = true;

app.use(express.json());

function notifyQueue() {
    //If all chargers are taken and people are waiting in a queue
    if (userQueue.length > 0 && allChargersFull == true) {
        const message = `Hey everyone! Charging slots are full. If you have enough charge, please consider freeing up a slot.`;
        sendMessage('#ev-drivers', message);
    }
}

function processQueue() {
    if (userQueue.length > 0) {
        const nextUser = userQueue[0];
        const message = `A charging slot is available for you, <@${nextUser}>. Do you want to accept? (Yes/No)`;
        sendMessage('#ev-drivers', message);

        // Wait for user response or timeout
        setTimeout(() => {
            // Check user's response
            // Handle cases based on response and queue management
        }, 480000); // 8 minutes
    }
}

// Simulate charger status update and trigger queue processing
function simulateChargerStatusUpdate() {
    allChargersFull = true; // Replace with actual logic
    if (allChargersFull) {
        notifyQueue();
        processQueue();
    }
}

// Schedule charger status update and queue processing every 10 minutes
setInterval(() => {
    simulateChargerStatusUpdate();
}, 600000); // 10 minutes in milliseconds

function sendMessage(channel, message) {
    try {
        slackClient.chat.postMessage({
            channel: channel,
            text: message
        });
    } catch (error) {
        console.error(`Error sending message: ${error}`);
    }
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});




// Endpoint for handling events from Slack
app.post('/event', async (req, res) => {
  const payload = req.body;

  // Handle member join events
  if (payload.event && payload.event.type === 'member_joined_channel' && payload.event.channel_type === 'channel') {
      const channelId = payload.event.channel;
      const userId = payload.event.user;

      // Send DM to new member
      await sendWelcomeDM(userId);
  }

  res.sendStatus(200);
});







//OLD

app.get('/api/chargerState/:chargerID', async (req, res) => {
  const easee = new Easee()
  //Log in and set access token to global
  await easee.initAccessToken()

  const { chargerID } = req.params;
  const response = await easee.getChargerState(chargerID) 
  console.log(response)
  //FILTER RESPONSE
  res.json({ data: response });
  });



app.listen(port, async ()=> {
    console.log(`Server is running on port ${port}`)
})