import csv
from datetime import date
from slack_sdk.webhook import WebhookClient
import numpy
import requests
import random
import json

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
        #return res.json()['members']
        return ["A","B","C","D"]

    def previouslyMatchedCheck(self, person1, person2, history):
        if person1 in history and person2 in history[person1]:
            print(f"{person1} and {person2} have already been matched before.")
            return True
        
        return False

    def matching(self, people,random_state=[]):
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
            if self.previouslyMatchedCheck(previous, current, history):
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
                history[pair[0]].append(pair[1])
            else:
                history[pair[0]] = [pair[1]]

            if pair[1] in history:
                history[pair[1]].append(pair[0])
            else:
                history[pair[1]] = [pair[0]]
            
        with open(history_file, 'w') as f:
            json.dump(history, f, indent=4)


 
if __name__ == '__main__':
    c = CoffeeRoulette()
    remaining = c.get_members()
    pairs = []
    history_file = "history.json"
    history = load_history(history_file)

    while (len(remaining) != 0):
        output = c.matching(remaining)
        pairs += output[0]
        remaining = output[1]
    
    print(pairs)
    c.updateHistory(pairs, history)

"""
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