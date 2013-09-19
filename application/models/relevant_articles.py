# -*- coding: utf-8 -*-

from pymongo import MongoClient
import sys
import json
# from bson import BSON
# from bson import json_util
from snippet2 import *


def retrieve_articles(event_ids):
  client = MongoClient()
  db = client.monastery2
  cursor = db.events.find({'mentions.id': {'$in': event_ids}}, {'mentions.article': 1, 'mentions.id': 1, '_id': 0})
  
  article_snippets = {}
  for x in cursor:
    for mention in x['mentions']:
      if mention['id'] in event_ids:
        if mention['article'] not in article_snippets:
          article_snippets[mention['article']] = []
        article_snippets[mention['article']] += [retrieve_snippet(mention['article'], mention['id'])]
  
  article_ids = []
  for article in article_snippets:
    article_ids += [article]
  
  cursor = db.articles.find({'id': {'$in': article_ids}}, {'id': 1, 'url': 1, 'title': 1, 'date': 1, 'site': 1, '_id': 0})
  
  sources = {}
  for x in cursor:
    sources[x['id']] = x
  
  article_snippets_list = []
  for article in article_snippets:
    article_snippets_list += [{'article': article, 'source': sources[article], 'snippets': article_snippets[article]}]
  
  return sorted(article_snippets_list, key=lambda thing: len(thing['snippets']), reverse=True)


event_ids = [int(x) for x in json.loads(sys.argv[1].replace('~~~~~', '"'))]
print json.dumps(retrieve_articles(event_ids), indent=2)