
//Imports express.js
import Easee from 'easee-js-slim'
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import pkg from '@slack/bolt';
const { App } = pkg;

dotenv.config({ path: './keys.env' });

const app = new App({
    signingSecret: process.env.SLACK_SECRET,
    token:process.env.SLACK_TOKEN
})


// Maintain a queue of users
var chargerDetails = [{'chargerID': 'ECERZU7V','inUse':false,'assignedTo':undefined,'state':undefined},
                    {'chargerID': 'ECVTV7GM','inUse':false,'assignedTo':undefined,'state':undefined},
                    {'chargerID': 'ECDV245U','inUse':false,'assignedTo':undefined,'state':undefined},
                    {'chargerID': 'EC829ST7','inUse':false,'assignedTo':undefined,'state':undefined},
                    {'chargerID': 'ECT5QPVT','inUse':false,'assignedTo':undefined,'state':undefined},
                    {'chargerID': 'ECAV2G5J','inUse':false,'assignedTo':undefined,'state':undefined},
                    {'chargerID': 'EC29NMHG','inUse':false,'assignedTo':undefined,'state':undefined},
                    {'chargerID': 'ECXGAPSZ','inUse':false,'assignedTo':undefined,'state':undefined},
                    {'chargerID': 'ECF8REZ3','inUse':false,'assignedTo':undefined,'state':undefined},
                    {'chargerID': 'ECHJ6TK6','inUse':false,'assignedTo':undefined,'state':undefined},
                    {'chargerID': 'ECUTYZ5J','inUse':false,'assignedTo':undefined,'state':undefined},
                    {'chargerID': 'EC6Z2XA6','inUse':false,'assignedTo':undefined,'state':undefined}]
var allChargersInuse = false
var user_queue = []

chargerStates()
// Schedule charger status update and queue processing every 10 minutes
setInterval(() => {
    console.log("working")
    chargerStates();
}, 20000); // 10 minutes in milliseconds


function chargerStates() {
    allChargerStatus()

    for (var charger of chargerDetails) {
        if (!charger['inUse']) {
            allocateCharger(charger)
            continue
        }
        
        if (charger['state']) {
            console.log("test3")
            if (charger['state'] == -1) {
                var originalUser = charger['assignedTo']
                allocateCharger(charger)
                console.log("test4")
                sendMessage("Sorry, your slot has expired. Please try again - use add retry to get a higher priority",originalUser)
                continue
            }
            
            if (charger['state'] != 0){
                charger['state'] += 1;
                console.log("test5")
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

        //Is Charger in use according to the API?
        if (response['cableLocked']) {
            if (charger['assignedTo']) {

                //(Based on state) Person assigned to charger has started using it (assuming its them)
                if (charger['state'] == 0) {
                    charger['state'] = 1
                }
                charger['inUse'] = true;
                continue
            }
            //Charger is in use by someone even though it has not been assigned
            else {
                charger['inUse'] = true;
            }
        
        }

        else {

                //Charger has been assigned (accepted by someone) and been used. They have left now so it can be unassigned.
                if (charger['assignedTo'] && charger['state'] >= 1){
                    charger['inUse'] = false
                    charger['assignedTo'] = undefined
                    charger['state'] = undefined
                    allocateCharger(charger)
                    allTrue = false
                }
                //If nobody is assigned to the charger and nobody is using it
                else if (!charger['assignedTo']){
                    charger['inUse'] = false
                    allTrue = false
                }
                else {
                    //Charger is not in use but someone has been assigned to it - they haven't reached it yet
                    charger['inUse'] = true
                }
            }
        
        
    }

    for (var charger of chargerDetails) {
        console.log(`${charger['chargerID']}, inuse ${charger['inUse']}, assignedTo :${charger['assignedTo']}, state: ${charger['state']}`)
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
    user_queue.reverse()
    let user = user_queue.pop()
    return user[0];
}

function assignCharger(userID, charger) {
    charger['assignedTo'] = userID;
    charger['inUse'] = true;
    charger['state'] = -2;
    sendMessage("A slot has opened up, would you like to accept? Y/Yes for Yes, N/No for no",userID)
}

app.event('member_joined_channel', async (event) => {
    event = event.body.event
    if (event.channel === process.env.SLACK_CHANNEL_ID && event.channel_type === 'C') {
        const userId = event.user;
        console.log(userId)
        const welcomeMessage = 'Welcome to the channel! Here\'s how the queuing system works: ...'; 
        sendMessage(welcomeMessage, userId)
    }
});


app.event('message', async (event) => {

    try {
        
        const channel = event.payload.channel;
        const user = event.payload.user;
        const text = event.payload.text;

        queueManagement(event.payload, channel, user, text);
        console.log(`User queue ${user_queue}`)

        console.log(`New message from ${user} in channel ${channel}: ${text}`);
        
      } catch (error) {
        console.error(error);
      }
});


// Endpoint for handling DM messages from users
async function queueManagement(payload, channel, user, text) {
    console.log("AT QUEUE MANAGEMENT")

    if (payload.type === 'message' && payload.channel_type === 'im') {
        const userMessage = text.toLowerCase();
        const userId = user;


        if (userMessage === 'add normal' || userMessage === 'add higher' || userMessage === 'add retry') {
            for (var userSlot of user_queue) {
                console.log(userSlot)
                console.log(userId)
                if (userSlot[0] == userId) {
                    sendMessage(`You are already in the queue.`, userId)
                    return
                }
            }

            for (var charger of chargerDetails) {
                if (charger['assignedTo'] == userId) {
                    sendMessage(`You already have a slot, located at bay ${charger['chargerID']}. You cannot queue until this has been released.`, userId)
                    return
                }
            }

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
        }
        else if (userMessage === 'remove') {
            // Logic to remove user from the queue


            for (let i=0; i<user_queue.length; i++) {
                if (user_queue[i][0] == userId) {
                    user_queue.splice(i, 1)
                    sendMessage(`You have been removed from the queue.`, userId)
                    return    
                }
            }

            for (let i=0; i<chargerDetails.length; i++) {
                if (chargerDetails[i]['assignedTo'] == userId) {
                    charger[i]['assignedTo'] = undefined;
                    charger[i]['state'] = undefined;
                    charger[i]['inUse'] = false
                    sendMessage(`You have been removed from the .`, userId)
                    return    
                }
            }
            


            sendMessage('You are currently not in the queue', userId)
            console.log(`User ${userId} wants to leave the queue`);
        } 
        
        else if (userMessage === 'yes' || userMessage === 'y') {
            // Logic to handle user's acceptance of a slot
            console.log(`User ${userId} has responded ${userMessage}`);
            for (var charger of chargerDetails) {
                if (charger['assignedTo'] == userId && charger['state'] < 0) {
                    charger['state'] = 0
                    sendMessage(`Slot ${charger['chargerID']} has been accepted successfully.`, userId)
                    return
                }
            }
            sendMessage('Sorry, there is no ongoing request to accept.', userId)

        }

        else if (userMessage === 'no' || userMessage === 'n') {
            // Logic to handle user's acceptance of a slot
            console.log(`User ${userId} has responded ${userMessage}`);
            for (var charger of chargerDetails) {
                if (charger['assignedTo'] == userId && charger['state'] < 0) {
                    allocateCharger(charger)
                    return
                }
            }
            sendMessage('Sorry, there is no ongoing request to decline.', userId)

        }
        else {
            sendMessage(`Please try again...`, userId)
        }
    }
};

function sendMessage(message,chosenChannel=process.env.SLACK_CHANNEL_ID) {
    try {
        const response = app.client.chat.postMessage({
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

(async () => {
    await app.start(process.env.PORT || 3000);
    console.log('Server is running')
})();

