# -*- coding: utf-8 -*-

from pymongo import MongoClient

# Retrieve the original text snippet in which a certain thing was mentioned



# Naively cuts off words
def retrieve_snippet(id, index, event_id, size = 350, html = False):
    if not isinstance(index, list):
        index = [index, index + 1]

    client = MongoClient()
    db = client.monastery2
    article_cursor = db.articles.find({'id': id}, {'title': 1, 'url': 1, 'site': 1, 'text': 1, 'date': 1})
    
    article = {}
    for article_obj in article_cursor:
        article = article_obj

    article_text = article['text'].replace('\r', '')
    start = index[0] - len(article['url'].replace('\r', '')) - 2
    end = index[1] - len(article['url'].replace('\r', '')) - 2
    
    if size <= 0:
        text = article_text[:start] + \
               '<b>' + article_text[start:end] + '</b>' + \
               article_text[end:]
    elif size + len('<b></b>') < len(article_text[start:end]):
        text = article_text[start:end]
    else:
        if start < size / 2:
            snippet_start = 0
            snippet_end = size - (end - start) # end + size / 2 + (start - size / 2)    wtf was I thinking?! http://www.youtube.com/watch?v=T6b4BU8N9mo
        elif end + size / 2 > len(article_text):
            snippet_start = start - size / 2 - ((end + size / 2) - len(article_text))
            snippet_end = len(article_text)
        else:
            snippet_start = start - size / 2
            snippet_end = start + size / 2

        text = article_text[:start] + \
               '<b>' + article_text[start:end] + '</b>' + \
               article_text[end:]

        text = text[snippet_start + len('<b></b>'):snippet_end + len('<b></b>')]
        
        if snippet_start == 0:
            text = text[:-3] + '...'
        elif snippet_end == len(article_text):
            text = '...' + text[3:]
        else:
            text = '...' + text[3:-3] + '...'
     
    if not html:
        return {'url': url, 'snippet': text.encode('utf-8').replace('\n', ' ')}
    else:
        url = article['url']
        title = article['title']
        site = article['site']
        return '''
<section class="snippet" onclick="load_large_snippet({5}, {4})">
  <h3><a onclick="load_large_snippet({5}, {4})">{1}</a></h3>
  <p>{2}</p>
  Source: <a href="{0}" rel="external">{3}</a>
</section>
'''.format(url, title, text.encode('utf-8').replace('\n', ' '), site, event_id, id)
        



# print retrieve_snippet('31', [4101,4108], html=True)