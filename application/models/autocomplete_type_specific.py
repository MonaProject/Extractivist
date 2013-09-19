# -*- coding: utf-8 -*-

from pymongo import MongoClient
import sys
import json

type  = sys.argv[1]
query = sys.argv[2]

client = MongoClient()
db = client.monastery2

things = []

types = {'actor': db.actors, 'place': db.places, 'time': db.times, 'event': db.events}

results = types[type].find({'lowercase_label': {'$regex': query.lower()}}, {'label': 1, 'mentions': 1})
for result in results:
  things += [{'label': result['label'].encode('utf-8') + ' (' + str(len(result['mentions']))  + ')', 'value': len(result['mentions'])}]

results2 = types[type].find({'categories': {'$regex': query.lower(), '$options': 'i'}}, {'categories': 1, 'mentions': 1})

categories = {}
for result in results2:
  for category in result['categories']:
    if query in category:
      if category not in categories:
        categories[category] = 0
      categories[category] += len(result['mentions'])

#for category in categories:
#  things += [{'label': category.encode('utf-8') + ' (' + str(categories[category])  + '*)', 'value': categories[category]}]

things = sorted(things, key=lambda thing: thing['value'], reverse=True)

only_labels = []
for thing in things:
  only_labels += [thing['label']]

print json.dumps(only_labels[:10], indent=2)