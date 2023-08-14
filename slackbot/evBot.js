
//Imports express.js
import Easee from 'easee-js-slim'
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createEventAdapter } from '@slack/events-api';
import { WebClient } from '@slack/web-api';


dotenv.config({ path: './keys.env' });

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// Initialize Slack API client
const slackToken = process.env.SLACK_TOKEN;
const slackClient = new WebClient(slackToken);
const slackSigningSecret = process.env.SLACK_SECRET; // Replace with your signing secret
const slackEvents = createEventAdapter(slackSigningSecret);
app.use('/slack/events', slackEvents.expressMiddleware());

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
                allocateCharger(charger)
                continue
            }


            if (charger['state']) {
                if (charger['state'] == -1) {
                    var originalUser = charger['assignedTo']
                    allocateCharger(charger)
                    sendMessage("Sorry, your slot has expired. Please try again - use add retry to get a higher priority",originalUser)
                    continue
                }
                
                if (charger['state'] != 0){
                    charger['state'] += 1;
                }
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

function processQueue() {
    if (user_queue.length === 1) {
        let user = user_queue.pop(0)
        return user[0];
    }
    else if (user_queue.length === 0) {
        return null
    }

    user_queue.sort((a, b) => {
        const priorityMap = {
            'retry': 3,
            'higher': 2,
            'normal': 1
        };

        if (priorityMap[a[2]] > priorityMap[b[2]]) {
            return -1;
        } else if (priorityMap[a[2]] < priorityMap[b[2]]) {
            return 1;
        } else {
            return a[1] - b[1];
        }
    });

    let user = user_queue.pop(0)
    return user[0];
}

function assignCharger(userID, charger) {
    charger['assignedTo'] = userID;
    charger['inUse'] = true;
    charger['state'] = -2;
    sendMessage("A slot has opened up, would you like to accept? Y/Yes for Yes, N/No for no",userID)
}

// Listen for the member_joined_channel event
slackEvents.on('member_joined_channel', async (event) => {
    if (event.channel === process.env.SLACK_CHANNEL_ID && event.channel_type === 'C') {
        const userId = event.user;
        const welcomeMessage = 'Welcome to the channel! Here\'s how the queuing system works: ...'; 
        sendMessage(welcomeMessage, userID)
    }
});


slackEvents.on('message', async (event) => {
    try {
        if (event.subtype !== 'bot_message') {
          const channel = event.channel;
          const user = event.user;
          const text = event.text;
          console.log(`New message from ${user} in channel ${channel}: ${text}`);
        }
      } catch (error) {
        console.error(error);
      }
    /** 
    // Check if the event is a message and not a bot message
    console.log("here")
    if (event.channel === process.env.SLACK_CHANNEL_ID && event.type === 'message' && event.subtype !== 'bot_message') {
        // Check if the message is in the desired channel (you can replace 'CHANNEL_ID' with the actual channel ID)
            // Call the /queueManagement endpoint logic here
        const response = await axios.post('http://localhost:3000/queueManagement', { type: 'message', ...event });
        console.log('Response:', response.data);
        
    }
    */

});

// Endpoint for handling DM messages from users
app.post('/queueManagement', async (req, res) => {
    console.log(req)

    const payload = req.body;

    if (payload.type === 'message' && payload.channel_type === 'im' && payload.subtype !== 'bot_message') {
        const userMessage = payload.text.toLowerCase();
        const userId = payload.user;

        
        if (userMessage === 'add normal') {
            // Logic to add user to the queue
            user_queue.push([userId, new Date(), 'normal'])
            console.log(`User ${userId} wants to join the queue with normal priority`);
        }   
        else if (userMessage === 'add higher') {
            // Logic to add user to the queue
            user_queue.push([userId, new Date(), 'higher'])
            console.log(`User ${userId} wants to join the queue with higher priority`);
        }
        else if (userMessage === 'add retry') {
            // Logic to add user to the queue
            user_queue.push([userId, new Date(), 'retry'])
            console.log(`User ${userId} wants to join the queue with retry priority`);
        }
        else if (userMessage === 'remove') {
            // Logic to remove user from the queue
            console.log(`User ${userId} wants to leave the queue`);
        } 
        
        else if (userMessage === 'yes' || userMessage === 'y') {
            // Logic to handle user's acceptance of a slot
            for (charger of chargerDetails) {
                if (charger['assignedTo'] == userId && charger['state'] < 0) {
                    charger['state'] = 0
                    break
                }
            }
            console.log(`User ${userId} has responded ${userMessage}`);
        }

        else if (userMessage === 'no' || userMessage === 'n') {
            // Logic to handle user's acceptance of a slot
            for (charger of chargerDetails) {
                if (charger['assignedTo'] == userId && charger['state'] < 0) {
                    allocateCharger(charger)
                    break
                }
            }
            console.log(`User ${userId} has responded ${userMessage}`);
        }
    }

    res.sendStatus(200);
});


function sendMessage(message,chosenChannel=process.env.SLACK_CHANNEL_ID) {
    try {
        const response = slackClient.chat.postMessage({
            channel: chosenChannel,
            text: message
        });
        return response.ts;
    } catch (error) {
        console.error(`Error sending message: ${error}`);
    }
}

function allocateCharger(charger) {
    var person = processQueue()
    if (person == null) {
        charger['assignedTo'] = undefined;
        charger['state'] = undefined;
        charger['inUse'] = false
        return
    }
    assignCharger(person, charger)
}

console.log(process.env.SLACK_SECRET)

async function exampleAPICall() {
    try {
      const response = await slackClient.chat.postMessage({
        channel: 'C05MPT0DY74', // Replace with the desired channel ID
        text: 'Hello, this is a test message!'
      });
  
      if (response.ok) {
        console.log('Message sent successfully');
      } else {
        console.error('Error sending message:', response.error);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
  
exampleAPICall();

app.listen(port, async ()=> {
    console.log(`Server is running on port ${port}`)
})