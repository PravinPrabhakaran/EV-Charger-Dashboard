import csv
from datetime import date
from slack_sdk.webhook import WebhookClient
import numpy
import requests
import random
import json
import os
from slack_sdk import WebClient
from dotenv import load_dotenv

load_dotenv('keys.env')

def send_message(message, chosen_channel=None):
    slack_client = WebClient(token=os.environ.get('SLACK_TOKEN'))
    try:
        if chosen_channel is None:
            chosen_channel = os.environ.get('SLACK_COFFEE_CHANNEL')
        
        response = slack_client.chat_postMessage(
            channel=chosen_channel,
            text=message
        )
        return response['ts']
    except Exception as error:
        print(f"Error sending message: {error}")

def load_history(history_file):
    try:
        with open(history_file, 'r') as f:
            history = json.load(f)
    except FileNotFoundError:
        history = {}  # Create an empty history if the file doesn't exist
    
    return history

class CoffeeRoulette:
 
    def get_members(self):

        headers = {
            'Authorization': f'Bearer xoxb-2335213356-5682371618757-UGzbE38GU4XJY7ativ31e35p',
        }
 
        params = {
            'channel': 'C05LHQ0M93K',
        }
 
        res = requests.get('https://slack.com/api/conversations.members', headers=headers, params=params)
        return res.json()['members']
        #return ["A","B","C","D","E"]

    def previouslyMatchedCheck(self, person1, person2, history):
        if person1 in history and person2 in history[person1]:
            return True
        return False

    def matching(self, people,historyIntoAccount, random_state=[]):
        remainingPeople = people[:]
        r = numpy.random.RandomState()
        if random_state:
            r.set_state(random_state)
        #saved_state = r.get_state()
 
        numpy.random.shuffle(people)
        pairs = []
        try:
            # Load existing history from the JSON file
            with open(history_file, 'r') as f:
                history = json.load(f)
        except FileNotFoundError:
            # If the file doesn't exist yet, create an empty history
            history = {}

        for previous, current in zip(*[iter(people)] * 2):
        
            if historyIntoAccount==True and self.previouslyMatchedCheck(previous, current, history):
                break
            else:
                remainingPeople.remove(previous)
                remainingPeople.remove(current)
                pairs.append([previous, current])
            # print(f'{previous["Name"]} and {current["Name"]}')
        
        return pairs, remainingPeople


    def updateHistory(self, pairs, history):
        for pair in pairs:
            if pair[0] in history:
                if pair[1] not in history[pair[0]]:
                    history[pair[0]].append(pair[1])
            else:
                history[pair[0]] = [pair[1]]

            if pair[1] in history:
                if pair[0] not in history[pair[1]]:
                    history[pair[1]].append(pair[0])
            else:
                history[pair[1]] = [pair[0]]
            
        with open(history_file, 'w') as f:
            json.dump(history, f, indent=4)

    def triplet(self, oddPerson, pairs, history):
        for pair in pairs:
            if (oddPerson in history):
                if (pair[0] not in history[oddPerson] and pair[1] not in history[oddPerson]):
                    history[pair[0]].append(oddPerson)
                    history[pair[1]].append(oddPerson)
                    history[oddPerson].append(pair[0])
                    history[oddPerson].append(pair[1])
                    pair.append(oddPerson)
                    oddPerson = None
                    break
            else:
                history[pair[0]].append(oddPerson)
                history[pair[1]].append(oddPerson)
                history[oddPerson] = [pair[0]]
                history[oddPerson].append(pair[1])
                pair.append(oddPerson)
                oddPerson = None
                break


        if oddPerson != None:
            pairs[0].append(oddPerson)


        with open(history_file, 'w') as f:
            json.dump(history, f, indent=4)

    def print_message(self, pairs):
 
        message = f'☕️ Coffee Roulette\n'
        message += f'⏱️ {date.today()}\n'
        message += f'ℹ️ This time we have {len(pairs)} groups taking part in Coffee Roulette\n\n'
        message += f'This weeks groupings are:\n'

        for pair in pairs:
            print(pair)
            message += "\n"
            for person in pair:
                message += f'<@{person.strip()}> '
            message += "\n"
 
        message += f'\n\n 🔴 Please contact your match and arrange a time to meet up. You can find more help <https://comparethemarket.atlassian.net/wiki/spaces/~62c3fd6dce5a604dbfb419a8/pages/4262822785/Coffee+Roulette%7Chere>. Your match has been randomly generated, enjoy chatting!'
        send_message(message, 'C05MPT0DY74')
        return message





 
if __name__ == '__main__':
    c = CoffeeRoulette()

    remaining = c.get_members()
    oddPerson = None
    if (len(remaining) % 2 == 1):
        index = random.randint(0,len(remaining)-1)            
        oddPerson = remaining[index]
        remaining.remove(oddPerson)    



    pairs = []
    history_file = "history.json"
    history = load_history(history_file)
    maxRetries = 5
    
    while (len(remaining) != 0 and maxRetries != 0):
        output = c.matching(remaining, True)
        pairs += output[0]
        remaining = output[1]
        maxRetries -= 1
    
    if (len(remaining) > 0):
        output = c.matching(remaining, False)
        pairs += output[0]
        for pair in output[0]:
            print(pair[0], "has been matched up again with", pair[1])





    c.updateHistory(pairs, history)
    if (oddPerson):
        c.triplet(oddPerson, pairs, history)
        
    c.print_message(pairs)
    print(pairs)



"""


//Randomly remove one person in an odd number of participant situation and then at the end, go through every pair and check if this person has been with either and if not - then make it a 3. If they have been with everyone, add them to the last pair.


Done:
//One person has already picked everyone else  ->Retry and notify of repeat   
//5 people in the channel, if majority has been with everyone else so no possible way of matching everyone up so no choice but repeats

def pick_pairs(self, people=[], random_state=[]):
 
        r = numpy.random.RandomState()
        if random_state:
            r.set_state(random_state)
        #saved_state = r.get_state()
 
        numpy.random.shuffle(people)
        cant_pair = bool(len(people) % 2)
        last = None
 
        if cant_pair:
            last = people.pop()
 
         pairs = []
         for previous, current in zip(*[iter(people)] * 2):
             pairs.append([previous, current])
             # print(f'{previous["Name"]} and {current["Name"]}')
 
         if cant_pair:
             triplet = pairs[0]
             triplet.append(last)
             pairs[0] = triplet
 
         return pairs
 
     def print_message(self, input_pairs, input_people):
 
         message = f'☕️ Coffee Roulette\n'
         message += f'⏱️ {date.today()}\n'
         message += f'ℹ️ This time we have {len(input_pairs)} groups taking part in Coffee Roulette\n\n'
         message += f'This weeks groupings are:\n'
         # https://comparethemarket.atlassian.net/wiki/spaces/~62c3fd6dce5a604dbfb419a8/pages/4262822785/Coffee+Roulette
 
         for group in input_pairs:
             print(group)
             message += "\n"
             for person in group:
                 message += f'<@{person["SlackID"].strip()}> '
             message += "\n"
 
         message += f'\n\n 🔴 Please contact your match and arrange a time to meet up. You can find more help <https://comparethemarket.atlassian.net/wiki/spaces/~62c3fd6dce5a604dbfb419a8/pages/4262822785/Coffee+Roulette%7Chere>. Your match has been randomly generated, enjoy chatting!'
         return message
 
     def send_message(self, message, url):
         webhook = WebhookClient(url)
         response = webhook.send(
             text="fallback",
             blocks=[
                 {
                     "type": "section",
                     "text": {
                         "type": "mrkdwn",
                         "text": message
                     }
                 }
             ]
         )
 



"""