# -*- coding: utf-8 -*-

import json
import sys
from pymongo import MongoClient


  # ------------------------------------------------------------------------ #


def label_in_list(needle, haystack):
  for x in haystack:
    if x['label'] == needle:
      return True
  return False
  

def retrieve_count(type, name):
  client = MongoClient()
  db = client.monastery2

  # Actor is placed near the end here, so that we can check whether something
  # already occurs as a place
  collections = {'event': db.events, 'place': db.places, 'time': db.times, 'actor': db.actors}
  
  cursor = collections[type].find({'label': name}, {'mentions': 1, '_id': 0})
  
  event_ids = []
  for x in cursor:
    print len(x['mentions'])   # This may include one 'event action' being part of multiple events

'''
  # Actor is placed near the end here, so that we can check whether something
  # already occurs as a place
  collections = {'event': db.events, 'place': db.places, 'time': db.times, 'actor': db.actors}
  
  cursor = collections[type].find({'label': name}, {'mentions': 1, '_id': 0})
  
  event_ids = []
  for x in cursor:
    for mention in x['mentions']:
      event_ids += [mention['id']]
  
  print event_ids

  cursor = db.events.find({'mentions.id': {'$in': event_ids}}, {'label': 1, 'mentions.id': 1, '_id': 0})
  
  events = {}
  for x in cursor:
    for id in x['mentions']:
      if id['id'] not in events:
        events[id['id']] = []
      events[id['id']] += [x['label']]

  for id in event_ids:
    print id, events[id]
'''

  # ------------------------------------------------------------------------ #


retrieve_count(sys.argv[1], sys.argv[2])