# -*- coding: utf-8 -*-

import json
import sys
from pymongo import MongoClient


  # ------------------------------------------------------------------------ #


#
def find_dbpedia_uri(type, name):
  client = MongoClient()
  db = client.monastery2

  collections = {'actor': db.actors, 'event': db.events, 'place': db.places, 'time': db.times}
  cursor = collections[type].find({'label': name}, {'dbpedia_uri': 1, '_id': 0})
  
  dbpedia_uri = ''
  for x in cursor:
    dbpedia_uri = x['dbpedia_uri']

  return dbpedia_uri
    

#
def escape(uri):
  return uri.replace('.', '~')


#
def create_formatted_abstract(output):
  output['formatted_abstract'] = '<img src="' + output['thumbnail'] + '" alt="' + output['label'] + '" /><p>' + output['abstract'] + '</p><p><a href="' + output['wiki'] + '" target="_blank">Continue reading on Wikipedia <img src="images/external.svg" width="12" height="12" alt="External link" style="float: none; position: static; margin-bottom: 0; margin-left: 0" /></a></p>'

  return output


#
def retrieve_dbpedia_resource(dbpedia_uri, type, name):
  client = MongoClient()
  db = client.monastery2

  cursor = db.dbpedia.find({'label': dbpedia_uri}, {'_id': 0})
  
  data = {}
  for x in cursor:
    data = x['resource'][escape(dbpedia_uri)]

  # Now add the interesting data
  abstract  = ''
  thumbnail = '/images/' + type + '.svg'
  
  if escape('http://dbpedia.org/ontology/thumbnail') in data:
    thumbnail = data[escape('http://dbpedia.org/ontology/thumbnail')][0]['value']

  if escape('http://dbpedia.org/ontology/abstract') in data:
    for abstract_obj in data[escape('http://dbpedia.org/ontology/abstract')]:
      if 'lang' in abstract_obj and abstract_obj['lang'] == 'en':
        abstract = abstract_obj['value']
  if len(abstract) == 0:
    abstract = '<em>No abstract available</em>'
  
  output = {'abstract':  abstract,
            'thumbnail': thumbnail,
            'type':      type,
            'wiki':      dbpedia_uri.replace('http://dbpedia.org/resource', 'http://en.wikipedia.org/wiki'),
            'label':     name}

  output = create_formatted_abstract(output)

  return output


#
def retrieve_dbpedia_data(type, name):
  dbpedia_uri = find_dbpedia_uri(type, name)
  
  if len(dbpedia_uri):
    print json.dumps(retrieve_dbpedia_resource(dbpedia_uri, type, name), indent=2)


  # ------------------------------------------------------------------------ #


type = sys.argv[1]
name = sys.argv[2]

retrieve_dbpedia_data(type, name)