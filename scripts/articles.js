/**
 *
 */
function ArticlesBrowser(id, original_data) {

  this.id = id;                       // The ID of the DOM object
  this.original_data = original_data; // Data as it was retrieved from server
  this.data = original_data;          // Possibly filtered and reordered data

  /**
   * (Re-)create the visualization
   */
  this.redraw = function() {
    var articles = [];
    var article_counts = {};
    
    var filter_function = filters['entity'];
    if(typeof filter_function == 'undefined') {
      // Find all articles that are associated with the current subset
      for(var thing in this.data) {
        for(var source in this.data[thing]['sources']) {
          var appears = false;
          for(var article in articles) {
            if(articles[article].url == this.data[thing]['sources'][source].url) {
              appears = true;
              break;
            }
          }
          if(!appears)
            articles.push(this.data[thing]['sources'][source]);
        }
      }
    }
    else {
      // Find all articles that are associated with the current subset
      var article_ids = [];
      for(var thing in this.data) {
        if(filter_function(this.data[thing])) {
          for(var mention in this.data[thing].mentions) {
            if(allowed_event_ids.indexOf(this.data[thing].mentions[mention].event_id) !== -1) {
              article_ids.push(this.data[thing].mentions[mention].article_id);
            }
          }
        }
      }
      for(var thing in this.data) {
        for(var source in this.data[thing].sources) {
          if(article_ids.indexOf(this.data[thing].sources[source].id) !== -1) {
            var appears = false;
            for(var article in articles) {
              if(articles[article].url == this.data[thing]['sources'][source].url) {
                appears = true;
                break;
              }
            }
            if(!appears)
              articles.push(this.data[thing]['sources'][source]);
          }
        }
      }
    }
    
    
    // Count how many events appear in each articles for this subset
    for(var thing in this.data) {
      for(var article in this.data[thing]['articles']) {
        if(!(this.data[thing]['articles'][article] in article_counts)) {
          article_counts[this.data[thing]['articles'][article]] = 0;
        }
          
        article_counts[this.data[thing]['articles'][article]] += 1;
      }
    }
    
    var output = [];
    
    // Yes, I know this is ugly, but I don't have an internet connection right now, so I can't look it up
    // on Google. And I will probably forget to replace this when I do have a connection again.
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    for(var article in articles) {
      output.push({'id': articles[article].id, 'text':
                   '<li>' + 
                   '<h3><a href="' + articles[article].url + '" target="_blank">' + articles[article].title + ' <img src="images/external.svg" width="12" height="12" alt="External link" /></a></h3>' +
                   '<span class="article_meta_container"><span class="news_site"><img src="http://' + articles[article].site + '/favicon.ico" width="16" height="16" alt="' + articles[article].site + '"/> <a href="' + articles[article].url + '">' + articles[article].site + '</a></span></span>' +
                   '<span class="article_meta_container"><span class="publication_date">' + parseInt(articles[article].date.split('-')[2], 10) + ' ' + months[parseInt(articles[article].date.split('-')[1], 10) - 1] + ' ' + articles[article].date.split('-')[0] + '</span></span>' +                 
                   '</li>'});
    }
    
    output = output.sort(function(a, b) { return article_counts[b.id] - article_counts[a.id] } );
    
    $('#articles_list').empty();
    for(var article in output) {
      $('#articles_list').append(output[article].text);
    }

    $('#articles_count').text(articles.length);
  }
}