# -*- coding: utf-8 -*-

import json
import sys
from pymongo import MongoClient


  # ------------------------------------------------------------------------ #

def retrieve_related_entities(type, name):
  client = MongoClient()
  db = client.monastery2

  collections = {'actor': db.actors, 'place': db.places, 'event': db.events, 'time': db.times}
  data = {'label': [], 'category': []}
  
  # Label-based similarity
  name_list = name.replace('Mr. ', '').replace('Mrs. ', '').replace('Ms. ', '').replace('Dr. ', '').split(' ')
  name_list = [x for x in name_list if len(x) > 2 and not '.' in x or len(x) > 3]
  for token in name_list:
    for type2 in collections:
      cursor = collections[type2].find({'label': {'$regex': token}}, {'label': 1, '_id': 0})
      for x in cursor:
        if not (type2 == type and x['label'] == name):
          data['label'] += [{'type': type2, 'label': x['label']}]

  # Category-based similarity
  if type == 'actor' or type == 'place':
    cursor = collections[type].find({'label': name}, {'categories': 1, '_id': 0})
    
    categories = []
    for x in cursor:
      if 'categories' in x:
        categories = x['categories']
    
    for type2 in collections:
      for category in categories:
        cursor = collections[type2].find({'categories': category}, {'label': 1, '_id': 0})
        for x in cursor:
          if x['label'] != name:
            appears = False
            for y in data['category']:
              if y['label'] == x['label']:
                appears = True
                break
            if not appears:
              data['category'] += [{'type': type2, 'label': x['label'], 'category': [category]}]
            else:
              for y in data['category']:
                if y['label'] == x['label']:
                  y['category'] += [category]
     
    for entity in data['category']:
      entity['category'] = list(set(entity['category']))

    data['category'] = sorted(data['category'], key=lambda thing: len(thing['category']), reverse=True)

  # 
  cursor = db.concurrences.find({type + 's': name}, {'places': 1, 'times': 1, '_id': 0})
  
  places = []
  times = []
  for x in cursor:
    places += x['places']
    times += x['times']
  
  places_u = list(set(places))
  times_u = list(set(times))

  cursor = db.concurrences.find({'places': {'$in': places_u}}, {type + 's': 1, '_id': 0})
  related_by_places = []
  for x in cursor:
    related_by_places += x[type + 's']
  cursor = db.concurrences.find({'times': {'$in': times_u}}, {type + 's': 1, '_id': 0})
  related_by_times = []
  for x in cursor:
    related_by_times += x[type + 's']
  
  inspector_spacetime_related = {}
  for x in related_by_places:
    if x not in inspector_spacetime_related:
      inspector_spacetime_related[x] = 0
    inspector_spacetime_related[x] += 1
  for x in related_by_times:
    if x not in inspector_spacetime_related:
      inspector_spacetime_related[x] = 0
    inspector_spacetime_related[x] += 1
  
  # Penalty if they don't occur in both
  related_by_time_and_place = list(set([x for x in related_by_places if x in related_by_times]))
  
  for x in related_by_time_and_place:
    if x not in inspector_spacetime_related:
      inspector_spacetime_related[x] = 0
    inspector_spacetime_related[x] *= 1000000000 # Ugly fix to only get things which were mentioned in both
  
  
  related = []
  for x in inspector_spacetime_related:
    if x != name and inspector_spacetime_related[x] >= 1000000000 and x != None:
      related += [{'label': x, 'score': inspector_spacetime_related[x]}]
  
  related = sorted(related, key=lambda thing: thing['score'], reverse=True)
  
  data['spacetime'] = related
  
  return data
  


if len(sys.argv) > 1:
  type = sys.argv[1]
  name = sys.argv[2]
  print json.dumps(retrieve_related_entities(type, name), indent=2)