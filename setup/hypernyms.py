from pymongo import MongoClient
from nltk.corpus import wordnet
from collections import Counter
import json
import sys


  # ------------------------------------------------------------------------ #


# Recursively retrieve hypernyms until nothing's returned
def get_hypernyms(synsets):
  hypernyms = synsets[0].hypernyms()
  
  if len(hypernyms):
    hypernym_list = []
    for hypernym in hypernyms:
      if '.v.' in str(hypernym):
        hypernym_list += [hypernym.name.split('.')[0]]
    return hypernym_list + get_hypernyms(hypernyms)
  else:
    return []


# Retrieve all events
client = MongoClient()
db = client.monastery2
cursor = db.events.find({})
events = []
for x in cursor:
  events += [x]

# Gather a list of all possible hypernyms
hypernyms_list = []
print len(events)
print



for event in events:
  synsets = wordnet.synsets(event['label'], pos='v')
  if len(synsets):
    hypernyms = get_hypernyms(synsets)
    for hypernym in hypernyms:
      hypernyms_list += [hypernym]
  
counts = Counter(hypernyms_list)  

string = ''
for x in counts:
  string += '"' + x + '","' + str(counts[x]) + '"\n'

f = open('hypernyms.csv', 'w')
f.write(string[:-1])
f.close()