# EV - Charger Dashboard & Slack bot

This repository contains the dashboard and slackbot to assist in managing EV chargers at Pegasus House.

The dashboard uses the Easee API to retrieve the status of chargers and some extra details. The slack bot provides a way to queue for chargers, also utilising the API to ensure chargers allocated are available. To use the Easee API, make sure your account is linked to the CompareTheMarket EV Charger site. You can use your username and password credentials in the environment variables to allow the application to use the API.

# Running the Dashboard
1. Open a CMD terminal and type npm install to install the necessary libraries.
2. Define the necessary environment variables in a file called keys.env inside src :
    EASEE_USERNAME
    EASEE_PASSWORD
    EASEE_SITEID='456745'
3. Run the server using node server.js
4. Run the dashboard using npm start

# Running the Slack bot
1. Open a CMD terminal and navigate to the slackbot folder.
2. Make sure to run npm install to install the relevant libraries.
3. Define the necessary environment variables in a file called keys.env :
       EASEE_USERNAME
       EASEE_PASSWORD
       EASEE_SIDEID='456745'
       SLACK_CHANNEL_ID= (ID of EV-Drivers channel)
       SLACK_TOKEN='xoxb-....' Bot token with appropriate permissions (see below)
       SLACK_SECRET='' (Can be found when creating an APP on slack API management page)
5. If using ngrok, make sure it is installed and run it using "ngrok http 3000". Paste the given URL into the slack event subscriptions field on their website and add "/slack/events".
5. Run the bot using "node evBotBolt.js"

# Important Notes 
The slack bot requires event subscriptions to be active in the bot settings. It requires the following scopes/permissions :
app_mentions:read\n
channels:history
channels:join
channels:read
chat:write
groups:history
groups:read
im:history
im:read
im:write
mpim:history
mpim:read
Event subscriptions require a hosted domain which slack can route events to. During development, ngrok was used to temporarily host the local server to the internet. Ideally, a hosted server would be used for this purpose. 

The charger IDs for the dashboard and slack bot have not been mapped to the correct charger. There was no clear way to identify which charger corresponded to the charger ID given by the API. This should be a very small modification to get the system working, with most cases just reordering the IDs listed.
