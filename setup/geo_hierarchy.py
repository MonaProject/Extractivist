# -*- coding: utf-8 -*-


# PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
# SELECT ?id
# WHERE {
#  ?x rdfs:isDefinedBy ?id .
#  ?x rdfs:seeAlso <http://dbpedia.org/resource/United_States>
# }

import urllib
import json
import sys
from rdflib import Graph, URIRef
from pymongo import MongoClient


world_hierarchy = {}

def get_dbpedia_uri(geonames_id):
    g = Graph()
    g.parse('http://sws.geonames.org/' + str(geonames_id) + '/about.rdf')
    for stmt in g.subject_objects(URIRef("http://www.w3.org/2000/01/rdf-schema#seeAlso")):
         return stmt[1]

def get_hierarchy(world_hierarchy, url, name):
  url_encoded_dbpedia_uri = urllib.quote(url.encode('utf-8'))
  factforge_url = 'http://factforge.net/sparql.json?query=PREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0D%0ASELECT+%3Fid%0D%0AWHERE+%7B%0D%0A++%3Fx+rdfs%3AisDefinedBy+%3Fid+.%0D%0A++%3Fx+rdfs%3AseeAlso+%3C' + url_encoded_dbpedia_uri + '%3E%0D%0A%7D&_implicit=false&implicit=true&_equivalent=false&_form=%2Fsparql'
  
  data = json.loads(urllib.urlopen(factforge_url).read())
  results = data['results']['bindings']
  if len(results) > 0:
      geonames_uri = results[0]['id']['value']
      geonames_id = geonames_uri.split('/')[3]
      
      data = json.loads(urllib.urlopen('http://api.geonames.org/hierarchyJSON?geonameId=' + geonames_id + '&username=chunfeilung').read())
      
      data = data['geonames']
      return {'dbpedia_uri': url, 'label': name, 'hierarchy': data}
  else:
      print 'Nothing in GeoNames'
      return {}


#
def load_places():
  client = MongoClient()
  db = client.monastery2
  places = db.places.find({'dbpedia_uri': {'$regex': 'http'}}, {'label': 1, 'dbpedia_uri': 1, '_id': 0})

  world_hierarchy = {}

  for place in places:
    if place['dbpedia_uri'] not in world_hierarchy:
      print 'Retrieving ' + place['dbpedia_uri'] + ' from GeoNames'
      res = get_hierarchy(world_hierarchy, place['dbpedia_uri'], place['label'])
      if len(res) > 0:
        world_hierarchy[place['dbpedia_uri']] = res
    else:
      print 'We can skip ' + place['dbpedia_uri']

  hierarchy = []
  
  for place in world_hierarchy:
    hierarchy += [world_hierarchy[place]]
  
  print 'Yaaay, we\'re done'
  
  f = open('dump/geo_hierarchy.json', 'w')
  f.write(json.dumps(hierarchy, indent=2))
  f.close()


def store_places():
  print 'Time to put that stuff into the database!'
  f = open('dump/geo_hierarchy.json')
  world_hierarchy = json.loads(f.read())
  f.close()

  client = MongoClient()
  db = client.monastery2

  db.geo.insert(world_hierarchy)
  db.geo.ensure_index('name')
  db.geo.ensure_index('dbpedia_uri')


  # ------------------------------------------------------------------------ #

'''
if len(sys.argv) < 2:
  load_places()

store_places()
'''