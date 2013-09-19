# -*- coding: utf-8 -*-

import sys
import json
from os import listdir, makedirs
from os.path import isfile, join, exists
from rdflib import Graph, URIRef
from geopy import geocoders
import urllib
import BeautifulSoup
from pymongo import MongoClient
from SPARQLWrapper import SPARQLWrapper, JSON
import urllib2
import lxml.html
from lxml import etree
from datetime import date
from dateutil import parser
from collections import Counter
import parsedatetime.parsedatetime as pdt
import tldextract
from chronos import *
from geo_hierarchy import *
from dbpedia import *
from category_patch import *


  # ------------------------------------------------------------------------ #


# Parses a given time
def parse_time(time):
  if len(time) == 8 and time.isdigit():
    time = str(time[0:4]) + '-' + str(time[5:6]) + '-' + str(time[7:8])
  elif len(time) == 25:
    time = str(time[0:10])
  try:
    return str(parser.parse(time))
  except ValueError:
    # Might be useful as another fallback, but is somewhat dysfunctional otherwise
    time_list = time.split(' ')
    time_list = [x for x in time_list if len(x) > 0]
    
    cleaned_time_list = []
    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',
              'Jan',     'Feb',      'Mar',   'Apr',   'May', 'Jun' , 'Jul',  'Aug',    'Sep',       'Oct',     'Nov',      'Dec'     ]
    for time_str2 in time_list:
      if len(time_str2) > 1 and time_str2[0].isdigit():
        time_str2.replace('st', '').replace('nd', '').replace('rd', '').replace('th', '')
      if time_str2.isdigit() and int(time_str2) >= 1 and int(time_str2) <= int(date.today().year) or time_str2 in months:
        cleaned_time_list += [time_str2]
    
    try:
      return str(parser.parse(' '.join(cleaned_time_list)))
    except:
      try:
        cal = pdt.Calendar()
        time = cal.parse(time)
        return str(time[0][0]) + '-' + str(time[0][1]) + '-' + str(time[0][2])
      except:
        return ''

# Parse a time within a time element
def parse_time_times(times):
  times_list = []
  for time_str in times:
    if not time_str.text is None:
        times_list += [parse_time(time_str.text)]
  
  if len(times_list) > 0:
    times_list = [x for x in times_list if len(x) > 0]
    return max(set(times_list), key=times_list.count)[:10]
  else:
    return None

# Parse a time within a meta tag
def get_meta_elements(tree):
  meta_date_keywords = ['publi', 'create', 'issue', 'pdate', 'datePublished']
  times_list = []
  parsed_times = []
  
  for keyword in meta_date_keywords:
    times_list += tree.xpath('//meta[contains(translate(@name, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "' + keyword + '")]')
    times_list += tree.xpath('//meta[contains(translate(@property, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "' + keyword + '")]')
    times_list += tree.xpath('//meta[contains(translate(@itemprop, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "' + keyword + '")]')
    times_list += tree.xpath('//span[contains(translate(@itemprop, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "' + keyword + '")]')
    for time_str in times_list:
      if not time_str.attrib['content'] is None:
          parsed_times += [parse_time(time_str.attrib['content'])]
  
  if len(parsed_times) > 0:
    parsed_times = [x for x in parsed_times if len(x) > 0]
    return max(set(parsed_times), key=parsed_times.count)[:10]
  else:
    return None

# Get the publication date for a page with a certain URL
def get_pub_date(url):
  print 'Getting publication date for ' + url
  try:
    url_page = urllib2.build_opener(urllib2.HTTPCookieProcessor()).open(url).read()
    #url_page = urllib.urlopen(url)
    htmlparser = etree.HTMLParser()
    #tree = etree.parse(url, htmlparser)
    tree = lxml.html.fromstring(url_page)
    times = tree.xpath('//time')
    
    time = parse_time_times(times)
    if time is None:
      raise AssertionError
    else:
      return time
  except AssertionError:
    try:
      #url_page = urllib.urlopen(url)
      #url_page = urllib2.build_opener(urllib2.HTTPCookieProcessor()).open(url).read()
      htmlparser = etree.HTMLParser()
      #tree = etree.parse(url, htmlparser)
      tree = lxml.html.fromstring(url_page)
      time = get_meta_elements(tree)
      if time is None:
        raise
      else:
        return time
    except:
      # Yahoo.com does not get the concept of "semantic markup"
      try:
        url_page = urllib2.build_opener(urllib2.HTTPCookieProcessor()).open(url).read()
        htmlparser = etree.HTMLParser()
        tree = lxml.html.fromstring(url_page)
        times = tree.xpath('//abbr')
    
        for time in times:
          return parse_time(time.text)[:10]
          break # Look at this superfluous break. Look at it.
      except:
        return None

# Get title, domain, and publication date
def retrieve_page(url):
  print 'Retrieving ' + url

  site = '.'.join(tldextract.extract(url)[-2:])
  
  try:
    page = urllib2.build_opener(urllib2.HTTPCookieProcessor()).open(url)
  except:
    time.sleep(30)
    page = urllib2.build_opener(urllib2.HTTPCookieProcessor()).open(url)
  soup = BeautifulSoup.BeautifulSoup(page)
  try:
    title = soup.h1.string
    
    if title is None:
      raise ValueError
  except:
      try:
        title = soup.title.string
      except:
        title = 'Article from ' + site
  date = get_pub_date(url)

  if title is None:
    title = 'Article from ' + site
  
  return title, site, date


  # ------------------------------------------------------------------------ #


# Get canonical name of DBpedia resource
def get_canonical_name(resource):
  sparql = SPARQLWrapper("http://dbpedia.org/sparql")
  resource = urllib.quote(resource)
  
  # foaf:name
  sparql.setQuery(_canonical_name_query(resource, 'foaf'))
  sparql.setReturnFormat(JSON)
  try:
    results = sparql.query().convert()
  except:
    print 'Failed retrieving', resource
    print sys.exc_info()[0]
    raise
    sys.exit(0)
  
  for result in results['results']['bindings']:
    if 'canonical_name' in result:
      return result['canonical_name']['value'].encode('utf-8')
    else:
      break;

  # rdfs:label
  sparql.setQuery(_canonical_name_query(resource, 'rdfs'))
  sparql.setReturnFormat(JSON)
  results = sparql.query().convert()
  
  for result in results['results']['bindings']:
    if 'canonical_name' in result:
      return result['canonical_name']['value']
    else:
      break;

  # fallback
  return urllib.unquote(resource.split('/')[-1].replace('_', ' '))


# Build query for canonical name of DBpedia resource
def _canonical_name_query(resource, x):
  if x == 'foaf':
    prefix   = 'foaf: <http://xmlns.com/foaf/0.1/>'
    variable = 'foaf:name'
    filter   = ''
  elif x == 'rdfs':
    prefix   = 'rdfs: <http://www.w3.org/2000/01/rdf-schema#>'
    variable = 'rdfs:label'
    filter   = 'FILTER(LANG(?canonical_name) = "" || LANGMATCHES(LANG(?canonical_name), "en"))'
  
  return '''
    PREFIX {prfx}
    SELECT ?canonical_name
    WHERE {{
      <{res}> {var} ?canonical_name .
      {fltr}
    }}
'''.format(res=resource, prfx=prefix, var=variable, fltr=filter)

# Fallback for if DBpedia does not contain any lat,lon
def retrieve_location_google(place):
  g = geocoders.GoogleV3()
  try:
    for name, (lat, lon) in g.geocode(place, exactly_one=False):
      return [lat, lon]
  except:
    return None


  # ------------------------------------------------------------------------ #


# 
def retrieve_location_dbpedia(resource):
  sparql = SPARQLWrapper("http://dbpedia.org/sparql")
  resource = urllib.quote(resource)

  sparql.setQuery('''
    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    SELECT ?lat ?lon
    WHERE {{
      <{res}> geo:lat ?lat .
      <{res}> geo:long ?lon .
    }}
'''.format(res=resource).replace('%3A', ':'))
  sparql.setReturnFormat(JSON)
  results = sparql.query().convert()

  for result in results['results']['bindings']:
    if 'lat' in result:
      return [result['lat']['value'], result['lon']['value']]
    else:
      return None


  # ------------------------------------------------------------------------ #


class Installer:
  # Data about the articles themselves
  articles = []

  # Data about recognized things in articles
  actors = []
  events = []
  places = []
  times  = []

  # Concurrences
  concurrences = []
  
  # Keep track of events throughout the dataset. Actual IDs start at 1
  event_id = 0


  # ------------------------------------------------------------------------ #


  # Retrieves a list of file names
  def get_files(self, directory):
    return [f for f in listdir(directory)
      if isfile(join(directory, f))]


  # Reads a single file and returns its contents as a string or as list/dict
  def read_file(self, file_name, parse = False):
    f = open(file_name)
    file_contents = f.read()
    f.close()

    if parse:
      return json.loads(file_contents)
    else:
      return file_contents


  # Extract ID, title, domain, URL, and publication date for each article
  def process_article(self, article, id):
    title, site, pub_date = retrieve_page(article.split('\n')[0])
    
    self.articles += [{'id':    id,
                       'date':  pub_date,
                       'title': title,
                       'text':  '\n'.join(article.split('\n')[2:]),
                       'url':   article.split('\n')[0],
                       'site':  site
                      }]

  
  # global_list is one of the actor, event, place or time lists, item should be
  # a string
  def already_processed(self, global_list, item, key = 'label'):
    for list_item in global_list:
      if key in list_item and list_item[key] == item:
        return True
    return False


  # global_list is one of the actor, event, place or time lists, item should be
  # a string
  def get_object(self, global_list, item, key = 'label'):
    for list_item in global_list:
      if key in list_item and list_item[key] == item:
        return list_item
    return False
  

  # Adds a mention to a place, actor, time or event
  def _add_mention(self, event_list, event_object, label):
    for item in event_list:
      if item['label'] == label:
        item['mentions'] += [{'id':      self.event_id,
                              'article': event_object['article'],
                              'begin':   event_object['begin'],
                              'end':     event_object['end']}]
        return label


  #
  def process_actors(self, actors, id):
    added_items = []

    for actor in actors:

      # Yay, it's already in there!
      if 'dbpedia_uri' in actor and self.already_processed(self.actors, actor['dbpedia_uri'].encode('utf-8'), 'dbpedia_uri'):
        label = self.get_object(self.actors, actor['dbpedia_uri'].encode('utf-8'), 'dbpedia_uri')['label']
      # Boooo....
      else:
        # Yaaay... let's get the real name from DBpedia
        if 'dbpedia_uri' in actor:
          label = get_canonical_name(actor['dbpedia_uri'].encode('utf-8'))
          dbpedia_uri = actor['dbpedia_uri']
        # Booo.... let's hope we can merge this later
        else:
          label = actor['text']
          dbpedia_uri = ''
        
        freebase_uri = ''
        if 'freebase_uri' in actor:
          freebase_uri = actor['freebase_uri']

        dbpedia_types = ''
        if 'dbpedia_types' in actor:
          dbpedia_types = actor['dbpedia_types']
        freebase_types = ''
        if 'freebase_types' in actor:
          freebase_types = actor['freebase_types']
        corenlp_types = ''
        if 'corenlp_types' in actor:
          corenlp_types = actor['corenlp_types']

        self.actors += [{'label':           label,
                         'lowercase_label': label.lower(),
                         'pos':             actor['pos'],
                         'mentions':        [],
                         'dbpedia_uri':     dbpedia_uri,
                         'freebase_uri':    freebase_uri,
                         'dbpedia_types':   dbpedia_types,
                         'freebase_types':  freebase_types,
                         'corenlp_types':   corenlp_types
                        }]
 
      actor_obj = {'article': id,
                   'id':      self.event_id,
                   'begin':   actor['begin'],
                   'end':     actor['end'],
                   'text':    actor['text']}
      added_items += [self._add_mention(self.actors, actor_obj, label)]

    return added_items


  #
  def process_places(self, places, id):
    added_items = []

    for place in places:

      # Yay, it's already in there!
      if 'dbpedia_uri' in place and self.already_processed(self.places, place['dbpedia_uri'].encode('utf-8'), 'dbpedia_uri'):
        label = self.get_object(self.places, place['dbpedia_uri'].encode('utf-8'), 'dbpedia_uri')['label']
      # Boooo....
      else:
        # Yaaay... let's get the real name from DBpedia
        if 'dbpedia_uri' in place:
          label = get_canonical_name(place['dbpedia_uri'].encode('utf-8'))
          dbpedia_uri = place['dbpedia_uri']
        # Booo.... let's hope we can merge this later
        else:
          label = place['text']
          dbpedia_uri = ''

        freebase_uri = ''
        if 'freebase_uri' in place:
          freebase_uri = place['freebase_uri']
        
        dbpedia_types = ''
        if 'dbpedia_types' in place:
          dbpedia_types = place['dbpedia_types']
        freebase_types = ''
        if 'freebase_types' in place:
          freebase_types = place['freebase_types']
        corenlp_types = ''
        if 'corenlp_types' in place:
          corenlp_types = place['corenlp_types']
        
        geo = ''
        if len(dbpedia_uri):
          geo = retrieve_location_dbpedia(place['dbpedia_uri'].encode('utf-8'))
        if geo is None or len(geo) < 1:
          geo = retrieve_location_google(place['text'])
          if geo is None or len(geo) < 1:
            geo = ''

        self.places += [{'label':           label,
                         'lowercase_label': label.lower(),
                         'pos':             place['pos'],
                         'mentions':        [],
                         'dbpedia_uri':     dbpedia_uri,
                         'freebase_uri':    freebase_uri,
                         'dbpedia_types':   dbpedia_types,
                         'freebase_types':  freebase_types,
                         'corenlp_types':   corenlp_types,
                         'location':        geo
                        }]
 
      place_obj = {'article': id,
                   'id':      self.event_id,
                   'begin':   place['begin'],
                   'end':     place['end'],
                   'text':    place['text']}
      added_items += [self._add_mention(self.places, place_obj, label)]

    return added_items


  #
  def process_event(self, event, id):
    if not self.already_processed(self.events, event['lemma']):
      self.events += [{'label':           event['lemma'],
                       'lowercase_label': event['lemma'].lower(),
                       'pos':             event['pos'],
                       'mentions':        []
                      }]
    
    event_obj = {'article': id,
                 'id':      self.event_id,
                 'begin':   event['begin'],
                 'end':     event['end'],
                 'text':    event['text']}

    return [self._add_mention(self.events, event_obj, event['lemma'])]



  #
  def process_times(self, times, id):
    added_items = []
    
    for time in times:
      # Anything that does not have a 'normalized_ner' is either a duration or a
      # name (e.g. the Adams Family's Wednesday or the movie '2012')
      if 'normalized_ner' in time:
        type, label, start, finish = Chronos.interpret_time(time['normalized_ner'])
        if not self.already_processed(self.times, label):
          # 0  times without a normalized_ner rarely are times
          # 1  e.g. ignore durations such as '70.0'
          # 2  e.g. ignore vague times such as 'FUTURE_REF'
          # 3  Ignore more concrete durations
          # 4  What am I supposed to do with these?
          # 5  2012-WXX-7-SU
          # 6  Valid absolute timestamps are at least 4 chars
          if 'normalized_ner' in time and             \
             not '.' in time['normalized_ner'] and    \
             not 'REF' in time['normalized_ner'] and  \
             not 'P' in time['normalized_ner'] and    \
             not '(' in time['normalized_ner'] and    \
             not 'WXX-' in time['normalized_ner'] and \
             len(time['normalized_ner']) > 3:
            timex = ''
            if 'timex' in time:
              timex = time['timex']
            corenlp_types = ''
            if 'corenlp_types' in time:
              corenlp_types = time['corenlp_types']
            self.times += [{'label':  str(label),
                            'lowercase_label': str(label).lower(),
                            'pos':             time['pos'],
                            'timex':           timex,
                            'normalized_ner':  time['normalized_ner'],
                            'corenlp_types':   corenlp_types,
                            'start':  start,
                            'finish': finish,
                            'mentions': []
                           }]
        time_obj = {'article': id,
                    'id':      self.event_id,
                    'begin':   time['begin'],
                    'end':     time['end'],
                    'text':    time['text']}
        added_items += [self._add_mention(self.times, time_obj, label)]
    
    return added_items


  # Process all annotations for an article
  def process_annotations(self, annotations, id):
    print
    print 'Processing article ' + id
    print '--------------------------------------------------------------------'
    for annotation in annotations:
      self.event_id += 1
      actors = self.process_actors(annotation['actors'], id)
      events = self.process_event(annotation['event'], id)
      places = self.process_places(annotation['places'], id)
      times  = self.process_times(annotation['times'], id)

      self.concurrences += [{'id':      self.event_id,
                             'article': id,
                             'actors':  actors,
                             'events':  events,
                             'places':  places,
                             'times':   times}]


  #
  def merge_stuff(self):
    if not len(self.concurrences):
      self.articles     = self._json_load('dump/articles')
      self.actors       = self._json_load('dump/actors')
      self.events       = self._json_load('dump/events')
      self.places       = self._json_load('dump/places')
      self.times        = self._json_load('dump/times')
      self.concurrences = self._json_load('dump/concurrences')
 
    for event in self.concurrences:
      min_max = {'actors': {}, 'places': {}}
      
      for type in min_max:
        # Get all actors who occur multiple times in the same event
        if any(event[type].count(x) > 1 for x in event[type]):
          mentions_list = [x for x in event[type] if event[type].count(x) > 1]
          
          # x = 'Royal Dutch Shell'
          for x in mentions_list:
            # obj = object representing 'Royal Dutch Shell'
            if type == 'actors':
              obj = self.get_object(self.actors, x)
            elif type == 'places':
              obj = self.get_object(self.places, x)
            
            # mention = {article, begin, end, event_id}
            new_mentions_list = []
            for mention in obj['mentions']:
              # We can keep the other ones
              
              if str(mention['id']) != str(event['id']): # isinstance hoort hier niet
                new_mentions_list += [mention]

              # if this actor appears in the event that contained duplicates
              elif str(mention['id']) == str(event['id']) and str(x) == str(obj['label']):
                # if this is the first item that is duplicated for this event
                if not x in min_max[type]:
                  min_max[type][x] = {str(event['id']): {'min': 999999999, 'max': -1}}
                
                if mention['begin'] < min_max[type][x][str(event['id'])]['min']:
                  min_max[type][x][str(event['id'])]['min'] = mention['begin']

                if mention['end'] > min_max[type][x][str(event['id'])]['max']:
                  min_max[type][x][str(event['id'])]['max'] = mention['end']
            
            new_mentions_list += [{'article': event['article'], 'begin': min_max[type][x][str(event['id'])]['min'], 'end': min_max[type][x][str(event['id'])]['max'], 'id': event['id']}]
            obj['mentions'] = new_mentions_list
        
        event[type] = list(set(event[type]))

    self.actors = [x for x in self.actors if len(x['mentions'])]
    self.places = [x for x in self.places if len(x['mentions'])]
     
    self.dump()


  # Main function
  def initialize(self):
    print 'Initiating data pre-processing!'
    
    annotations = self.get_files('data/json')
    articles    = self.get_files('data/txt')
    
    # Process the annotations
    for ann in annotations:
      print 'Attempting to process annotations for article', ann[:-5]
      annotation = self.read_file('data/json/' + ann, True)
      self.process_annotations(annotation, ann[:-5])
    
    # Process the articles
    for art in articles:
      article = self.read_file('data/txt/' + art)
      self.process_article(article, art[:-4])
    
    print self.event_id


  def _json_dump(self, data, file_name):
    f = open(file_name + '.json', 'w')
    f.write(json.dumps(data, indent=2))
    f.close()


  #
  def _json_load(self, file_name):
    f = open(file_name + '.json')
    data = json.loads(f.read())
    f.close()
    
    return data


  # Dumps the gathered data as 
  def dump(self):
    if not exists('dump'):
      makedirs('dump')
    self._json_dump(self.articles, 'dump/articles')
    self._json_dump(self.actors, 'dump/actors')
    self._json_dump(self.events, 'dump/events')
    self._json_dump(self.places, 'dump/places')
    self._json_dump(self.times, 'dump/times')
    self._json_dump(self.concurrences, 'dump/concurrences')


  def install(self):
    if exists('dump'):
      articles     = self._json_load('dump/articles')
      actors       = self._json_load('dump/actors')
      events       = self._json_load('dump/events')
      places       = self._json_load('dump/places')
      times        = self._json_load('dump/times')
      concurrences = self._json_load('dump/concurrences')

      client = MongoClient()
      db = client.monastery2

      db.articles.insert(articles)
      db.actors.insert(actors)
      db.events.insert(events)
      db.places.insert(places)
      db.times.insert(times)
      db.concurrences.insert(concurrences)

      db.articles.ensure_index('articles.id')
      
      db.actors.ensure_index('actors.label')
      db.actors.ensure_index('actors.lowercase_label')
      
      db.events.ensure_index('events.label')
      db.events.ensure_index('events.lowercase_label')
      
      db.places.ensure_index('places.label')
      db.places.ensure_index('places.lowercase_label')
      db.places.ensure_index('places.location')
      db.places.ensure_index('places.dbpedia_uri')
      
      db.times.ensure_index('times.label')
      db.times.ensure_index('times.lowercase_label')
      
      db.concurrences.ensure_index('actors')
      db.concurrences.ensure_index('events')
      db.concurrences.ensure_index('places')
      db.concurrences.ensure_index('times')
      db.concurrences.ensure_index('id')
    else:
      print 'You need to pre-process the data first.'
    
  # ------------------------------------------------------------------------ #

 

installer = Installer()
if len(sys.argv) < 2:
  installer.initialize()
  installer.dump()
  installer.merge_stuff()
  installer.install()
  load_places()
  store_places()
  retrieve_dbpedia_data()
  store_dbpedia_data()
  add_categories()
elif sys.argv[1] == 'install':
  installer.merge_stuff()
  installer.install()
  store_places()
  store_dbpedia_data()
  add_categories()