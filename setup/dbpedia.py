import urllib2
import json
import re
import sys
import time
from pymongo import MongoClient
from os import makedirs
from os.path import exists


def get_entities(collection):
  cursor = collection.find({}, {'_id': 0})
  
  entities = []
  for obj in cursor:
    entities += [obj]
  
  return entities


def retrieve_dbpedia_page(dbpedia_uri, dbpedia_no):
  try:
    url = 'http://dbpedia.org/data/' + dbpedia_uri + '.json'
    print dbpedia_no, ' Grabbing data from', url.encode('utf-8')
    return urllib2.urlopen(url.encode('utf-8')).read()
  except urllib2.HTTPError:
    try:
      print 'First try failed, waiting 10 seconds before retrying...'
      time.sleep(10)
      url = 'http://live.dbpedia.org/data/' + dbpedia_uri + '.json'
      print dbpedia_no, ' Grabbing data from', url.encode('utf-8')
      return urllib2.urlopen(url.encode('utf-8')).read()
    except:
      try:
        print 'Second try failed, waiting 60 seconds before retrying...'
        time.sleep(60)
        url = 'http://dbpedia.org/data/' + dbpedia_uri + '.json'
        print dbpedia_no, ' Grabbing data from', url.encode('utf-8')
        return urllib2.urlopen(url.encode('utf-8')).read()
      except:
        try:
          print 'Third try failed, waiting 120 seconds before retrying...'
          time.sleep(120)
          url = 'http://live.dbpedia.org/data/' + dbpedia_uri + '.json'
          print dbpedia_no, ' Grabbing data from', url.encode('utf-8')
          return urllib2.urlopen(url.encode('utf-8')).read()
        except:
          try:
            print 'Second try failed, waiting 300 seconds before retrying...'
            time.sleep(300)
            url = 'http://dbpedia.org/data/' + dbpedia_uri + '.json'
            print dbpedia_no, ' Grabbing data from', url.encode('utf-8')
            return urllib2.urlopen(url.encode('utf-8')).read()
          except:
            return 'FAIL'
    


def write_references_file(dbpedia_data):
  f = open('dump/dbpedia.json', 'w')
  f.write(json.dumps(dbpedia_data, indent=2))
  f.close()




def retrieve_dbpedia_data():
  client = MongoClient()
  db = client.monastery2
  
  collections = [db.actors, db.places]
  
  entities = []
  for collection in collections:
    entities += get_entities(collection)
  
  print 'There are ' + str(len(entities)) + ' entities'
  
  dbpedia_data = {}
  dbpedia_no = 1
  for entity in entities:
    if len(entity['dbpedia_uri']) and entity['dbpedia_uri'] not in dbpedia_data:
      data = retrieve_dbpedia_page(entity['dbpedia_uri'][28:], dbpedia_no)

      if data == 'FAIL':
        write_references_file(dbpedia_data)
        sys.exit(1)
      
      dbpedia_data[entity['dbpedia_uri']] = dbpedia_no
      
      if not exists('dump/dbpedia'):
        makedirs('dump/dbpedia')
      
      f = open('dump/dbpedia/' + str(dbpedia_no) + '.json', 'w')
      f.write(data.encode('utf-8'))
      f.close()
      
      dbpedia_no += 1
      write_references_file(dbpedia_data)


def replace_dots(d):
  new = {}
  for k, v in d.iteritems():
    if isinstance(v, dict):
      v = replace_dots(v)
    new[k.replace('.', '~')] = v
  return new


def store_dbpedia_data():
  f = open('dump/dbpedia.json')
  dbpedia_data = json.loads(f.read())
  f.close()

  client = MongoClient()
  db = client.monastery2

  i = 1
  for dbpedia_uri in dbpedia_data:
    print 'Processing article ' + str(i)
    i += 1    
    f = open('dump/dbpedia/' + str(dbpedia_data[dbpedia_uri]) + '.json')
    dbpedia_resource = f.read()
    # Well, that only took 9 hours to figure out.
    dbpedia_resource = re.sub(r'\\U[\w]{8}', r'', dbpedia_resource)
    dbpedia_resource = json.loads(dbpedia_resource)
    f.close()
    
    dbpedia_resource = {'label': dbpedia_uri, 'resource': dbpedia_resource}
    db.dbpedia.insert(replace_dots(dbpedia_resource))

  db.dbpedia.ensure_index('label')


  # ------------------------------------------------------------------------ #


'''
if len(sys.argv) < 2:
  print 'This takes ages. Are you sure? (Edit the source file)'
  #retrieve_dbpedia_data()

store_dbpedia_data()
'''

# http://dbpedia.org/data/Fisher-Price.json