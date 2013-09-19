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
  

def retrieve_count(data):
  client = MongoClient()
  db = client.monastery2

  # Actor is placed near the end here, so that we can check whether something
  # already occurs as a place
  collections = {'events': db.events, 'places': db.places, 'times': db.times, 'actors': db.actors}
  
  separated_data = {'events': [], 'places': [], 'times': [], 'actors': []}
  for item in data:
    separated_data[item['type']] += [item['label']]
    
  events = {'events': {}, 'places': {}, 'times': {}, 'actors': {}}
  for type in separated_data:
    for entity in separated_data[type]:
      cursor = collections[type].find({'label': entity}, {'mentions': 1, '_id': 0});
      
      for x in cursor:
        for mention in x['mentions']:
          if entity not in events[type]:
            events[type][entity] = []
          events[type][entity] += [mention['id']]
        
  intersected_events = []
  initialized = False
  DEBUG = ''
  for type in events:
    for entity in events[type]:
      if len(events[type][entity]) and not initialized:
        intersected_events = events[type][entity]
        initialized = True
      elif len(separated_data[type]):
        intersected_events = [x for x in intersected_events if x in events[type][entity]]

    DEBUG += type + '<br>'
    DEBUG += json.dumps(intersected_events) + '<br><br>'
  
  #print '<div style="background:yellow;display:block;position:absolute;left:0">' + DEBUG + '</div>'
  print len(intersected_events)      

  # ------------------------------------------------------------------------ #


retrieve_count(json.loads(sys.argv[1].replace('~~~~~', '"')))