# -*- coding: utf-8 -*-

from pymongo import MongoClient
import sys
import json
# from bson import BSON
# from bson import json_util
from snippet import *

type1 = sys.argv[1]
type2 = sys.argv[2]
name1 = sys.argv[3]
name2 = sys.argv[4]

client = MongoClient()
db = client.monastery2

concurrences = db.concurrences.find({'$and': [{(type1 + 's'): name1}, {(type2 + 's'): name2}]}, {'id': 1, '_id': 0})

printed_snippets = []

def already_printed(id, begin, end, printed_snippets):
    for x in printed_snippets:
        if x['id'] == id and x['begin'] == begin and x['end'] == end:
            return True
    return False


def name_mentioned(event, name):
    for x in event:
        if 'canonical_name' in x:
            if x['canonical_name'] == name:
                return True
        if 'normalized_ner' in x:
            if x['normalized_ner'] == name:
                return True
        if 'lemma' in x:
            if x['lemma'] == name:
                return True
    return False


event_ids = []

for obj in concurrences:
  event_ids += [obj['id']]

types = {'actor': db.actors, 'place': db.places, 'time': db.times, 'event': db.events}

mentions_list = types[type2].find({'mentions.id': {'$in': event_ids}}, {'mentions.article': 1, 'mentions.begin': 1, 'mentions.end': 1, 'mentions.id': 1})

first_snippet = {}

for mentions in mentions_list:
  for mention in mentions['mentions']:
    if mention['id'] in event_ids and mention['id'] not in printed_snippets:
      if len(first_snippet) == 0:
        first_snippet = {'article': mention['article'], 'event': mention['id']}
      print retrieve_snippet(mention['article'], [mention['begin'], mention['end']], mention['id'], html = True)
      printed_snippets += [mention['id']]
print '<script>load_large_snippet(' + str(first_snippet['article']) + ', ' + str(first_snippet['event']) + ')</script>'

#    print json.dumps(obj, indent=2,default=json_util.default)