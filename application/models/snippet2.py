# -*- coding: utf-8 -*-

from pymongo import MongoClient
import json
import sys

# Retrieve the original text snippet in which a certain thing was mentioned


# Remove superfluous paragraphs. Currently not used.
def compress_text(text):
  return text

# Gives paragraphs which contain bold words a yellow-ish background. Also adds
# paragraphs
def highlight_paragraph(text):
  split_text = text.split('\n')
  
  text = ''
  for paragraph in split_text:
    if '<b>' in paragraph:
      text += '<p class="highlighted">' + paragraph + '</p>\n'
    else:
      text += '<p>' + paragraph + '</p>\n'

  return text


# Bolds the necessary words
def bold_stuff(text, indices_list):
  for indices in indices_list:
    text = text[:indices[0]] + '<b>' + text[indices[0]:indices[1]] + '</b>' + text[indices[1]:]

  return text



# Call this function if you want to use this script
def build_snippet(id, indices_list):
  client = MongoClient()
  db = client.monastery2
  cursor = db.articles.find({'id': id}, {'title': 1, 'url': 1, 'site': 1, 'text': 1, 'date': 1, '_id': 0})
  
  for x in cursor:
    article = x
    break

  # Necessary because otherwise the wrong words might be highlighted.
  article_text = article['text'].replace('\r', '')
  
  fixed_indices = []

  # Necessary because we removed the URLs from the original source articles
  for indices in indices_list:
    start = indices[0] - len(article['url'].replace('\r', '')) - 2
    end = indices[1] - len(article['url'].replace('\r', '')) - 2
    fixed_indices += [[start, end]]
  
  indices_list = sort_indices(fixed_indices)

  article_text = bold_stuff(article_text, indices_list)
  article_text = highlight_paragraph(article_text)
  article_text = compress_text(article_text)

  preview = '''
  <h2>{0}</h2>
  {1}
'''.format(article['title'].encode('utf-8'), article_text.encode('utf-8'))

  return preview


# Sort indices in reverse order. This allows us to add tags to the text without
# messing up the text order.
def sort_indices(indices_list):
  return sorted(indices_list, key=lambda indices: indices[0], reverse=True)

def retrieve_snippet(article_id, event):
  client = MongoClient()
  db = client.monastery2
  cursor = db.articles.find({'id': article_id}, {'_id': 0})

  article = ''
  for x in cursor:
    article = x
    break

  types = {'actors': db.actors, 'events': db.events, 'places': db.places, 'times': db.times}
  
  data = []
  for type in types:
    cursor = types[type].find({'mentions.id': int(event)}, {'_id': 0})
    
    for x in cursor:
      data += [x]

  indices_list = []
  for x in data:
    for mention in x['mentions']:
      if int(mention['id']) == int(event):
        indices_list += [[mention['begin'], mention['end']]]

  return build_snippet(article_id, indices_list)


'''
event_shit = [ [5460,5465], # Shell
               [5494,5503], # McDonnell
               [5504,5516], # acknowledged
               [5390,5396], # Barrow
               [5397,5407]  # this month
             ]  
  
retrieve_snippet('10', event_shit)
'''

if len(sys.argv) > 2:
  print retrieve_snippet(sys.argv[1], sys.argv[2])