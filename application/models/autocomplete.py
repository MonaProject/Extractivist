# -*- coding: utf-8 -*-

from pymongo import MongoClient
import sys
import json

query = sys.argv[1]

client = MongoClient()
db = client.monastery2

things = []

types = {'actors': db.actors, 'places': db.places, 'times': db.times, 'events': db.events}

for type in types:
  results = types[type].find({'lowercase_label': {'$regex': query.lower()}}, {'label': 1})
  for result in results:
    things += [result['label'] + ' (' + type[:-1] + ')']

print json.dumps(list(set(things))[:10], indent=2)