import urllib2
import json
import re
import sys
import time
from pymongo import MongoClient
from os import makedirs
from os.path import exists



def add_categories():
  client = MongoClient()
  db = client.monastery2
  types = [db.actors, db.places]
  
  for database in types:
    cursor = database.find({}, {'dbpedia_uri': 1})
    
    dbpedia_uris = []
    for x in cursor:
      if len(x['dbpedia_uri']):
        dbpedia_uris += [x]
    
    for y in dbpedia_uris:
      print y['dbpedia_uri'].encode('utf-8')
      cursor = db.dbpedia.find({'label': y['dbpedia_uri']}, {'resource.' + y['dbpedia_uri'].replace('.', '~') + '.' + 'http://purl.org/dc/terms/subject'.replace('.', '~' ): 1, '_id': 0})
      
      try:
        for x in cursor:
          categories = x['resource'][y['dbpedia_uri'].replace('.', '~')]['http://purl.org/dc/terms/subject'.replace('.', '~' )]
          categories = [x['value'][len('http://dbpedia.org/resource/Category:'):].replace('_', ' ') for x in categories]
         
        database.update({'_id': y['_id']}, {'$set': {'categories': categories}})
      # Character encoding error for one of the DBpedia URIs. You know what, I'm not even going to try to fix this anymore
      except:
        pass


'''
# Yeaaa... This kills the database
def add_categories(dbpedia_uris):
  client = MongoClient()
  db = client.monastery2

  # The other ones don't have DBpedia URIs
  types = [db.actors, db.places]
  
  for dbpedia_uri in dbpedia_uris:
    dbpedia_uri = dbpedia_uri
    print dbpedia_uri.encode('utf-8')
    
    cursor = db.dbpedia.find({'label': dbpedia_uri}, {'resource.' + dbpedia_uri.replace('.', '~') + '.' + 'http://purl.org/dc/terms/subject'.replace('.', '~' ): 1, '_id': 0})
    
    for x in cursor:
      try:
        categories = x['resource'][dbpedia_uri.replace('.', '~')]['http://purl.org/dc/terms/subject'.replace('.', '~' )]
        categories = [x['value'][len('http://dbpedia.org/resource/Category:'):].replace('_', ' ') for x in categories]
        
        for type in types:
          type.update({'dbpedia_uri': dbpedia_uri}, {'$set': {'categories': categories}})
      # Character encoding error for one of the DBpedia URIs. You know what, I'm not even going to try to fix this anymore
      except:
        pass
      
f = open('dump/dbpedia.json')
dbpedia_uris = json.loads(f.read())
f.close()

add_categories(dbpedia_uris)
'''  


  

#add_categories()