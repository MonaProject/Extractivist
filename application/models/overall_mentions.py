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
  

def retrieve_counts(ignore_actors_that_are_also_places = False):
  client = MongoClient()
  db = client.monastery2

  # Actor is placed near the end here, so that we can check whether something
  # already occurs as a place
  collections = {'event': db.events, 'place': db.places, 'time': db.times, 'actor': db.actors}
  
  data = {}
  for collection in collections:
    cursor = collections[collection].find({}, {'label': 1, 'mentions': 1, '_id': 0})
    
    for x in cursor:
      if collection not in data:
        data[collection] = []
      data[collection] += [x]

  output = {}


  for type in data:
    for x in data[type]:
      if type not in output:
        output[type] = []
      if not (ignore_actors_that_are_also_places and label_in_list(x['label'], output['place'])):
        output[type] += [{'label': x['label'], 'value': len(x['mentions'])}]

    output[type] = sorted(output[type], key=lambda thing: thing['value'], reverse=True)
  
  return output

  # ------------------------------------------------------------------------ #


if len(sys.argv) > 1:
  output = retrieve_counts(ignore_actors_that_are_also_places=True)
  
  output2 = {}
  
  for type in output:
    output2[type] = output[type]
    
  print json.dumps(output2, indent=2)