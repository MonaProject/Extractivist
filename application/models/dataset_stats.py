# -*- coding: utf-8 -*-

import json
import sys
from pymongo import MongoClient


  # ------------------------------------------------------------------------ #


client = MongoClient()
db = client.monastery2

cursor = db.articles.find({}, {'site': 1, '_id': 0})

i = 0
sites = {}
for x in cursor:
  if x['site'] not in sites:
    sites[x['site']] = 0

  sites[x['site']] += 1
  i += 1

sources = []
for x in sites:
  sources += [{'site': x, 'count': sites[x]}]

sources = sorted(sources, key=lambda thing: thing['count'], reverse=True)

cursor = db.concurrences.find({}, {'_id': 0})

counts = {'actor': 0, 'event': 0, 'place': 0, 'time': 0}
for x in cursor:
  counts['actor'] += len(x['actors'])
  counts['event'] += len(x['events'])
  counts['place'] += len(x['places'])
  counts['time'] += len(x['times'])
  
print json.dumps({'total': i, 'sources': sources, 'counts': counts}, indent=2)