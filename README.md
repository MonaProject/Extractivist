# Introduction
This documentation was written with two very different type of stakeholders in mind: potential users who would like to use Extractivist to gain insights into event data, and programmers who for whatever reason may want to make changes to the application or learn more about how it works.

This README is split into two parts: the first part (directly hereafter) is intended for those who intend to make use of the application to browse events, whereas the second part (which follows directly after *that*) is intended for those who want to deploy or modify the application.

# How to use it
If you are not able to set up your own local copy, you can find a demo of it at http://chunfei.lung.nl/thesis/app. This link is somewhat guaranteed to work until at least 2018.

## Main page
The main page of the application allows you to visualize the things you want to see. Choosing any of the things from one of the four boxes allows you to visualize all events which include that specific thing (i.e. that event, or events which include that actor, place, or time). Alternatively, the large search form allows you to immediately see only events which include an arbitrary number of things, e.g. all "say" events in the place "United States" with the actor "Royal Dutch Shell": select the filters you want to apply, and then hit the "Visualize" button on the right to bring up the visualization page.

## Visualization page
The visualization page (as its name suggests) visualizes events. The label on top of the page is your primary focus: regardless of what other things you filtered on (more on this later), the "About" tab will only show information about this particular thing, be it an event, actor, place or time.

Below that is a small map. Red markers show where events occurred, with the colour below them indicating the relative amount of activity (green meaning few activity, and red meaning much activity). Clicking on a marker will open a popup with more information about events in that particular place. Panning can be done by dragging the map, while zooming can be done using the scroll wheel or the zoom buttons in the top left corner of the map.  
Clicking on the "Show large map" button below the map increases the map's size, and enables less minimalist views to be used as well, e.g. road map or satellite views.

Directly below the map is a tiny menu which can be used to toggle between the map and a timeline. The timeline shows when particular events, or events with particular actors or places occurred (as opposed to when they are *mentioned*) Bubbles are used to represent events: the position provides an indication of when events occurred, the size (small, medium, large) provides some information on whether the event took place in a year (or more), a month (or more) or a day (or less), while the color says something about the number of events that supposedly happened that particular time.
Clicking on the labels of events, actors or places on the left side will show all of those events, while clicking on bubbles will show information only for those events that happened at that particular time.

A bit further below, we find a list of tabs. The first four work in a very similar way, and respectively list all events, their actors, places, and times which satisfy the conditions set by the filters. The fifth tab lists all articles in which events which satisfy the conditions set by the filters are mentioned. The articles are ordered by the number of relevant events that are mentioned within them. The sixth tab may show a brief description form Wikipedia about the primary focus of the visualization page, in addition to entities which may be related due to a similarity in name, some real-world characteristic (e.g. being a sustainability organisation), or because they were mentioned at the same time and place.  
As with the previous visualizations, clicking on a label in the first four tabs (the lists of events, actors, places, and times) will open a popup with more information. By default, these are ordered and coloured by the number of times they were mentioned. The tools on the right side of the page can be used to change the order in which they appear or the colours to show different information, such as actor type (i.e. whether something is a person, organization or place).

Since we're talking about those tools anyway, they can also be used to filter the current subset, so that you for example see only events, actors, places, and times which were mentioned more than *x* times (and thus likely to be significant) or events which happened within a particular period. Note that the "Only show entities with time" checkbox should also be checked, as otherwise events of which we do not know when they happened are included as well.

The "Currently active filters" will show which filters are currently active. If more than one filter is enabled, the main focus can be switched by clicking on the label of an event, actor, place or time which is not currently the main focus, or filters may be removed by clicking the "x" icon.

## Popups
The popups have been mentioned several times before now. Two buttons appear on top, and allow the user to quickly show only events with the popup's focus (shown in the popup's "window" handle), or add it to the list of filters. These popups have three subtabs: the first shows a number of pie charts which summarize which events, actors, places, and times are mentioned together with the popup's focus, along with the sources (which currently are the domains of the source URLs) and their publication dates. The second tab lists the articles which mentioned these events, together with snippets from the sentences which mention these events. The interesting words (the events, actors, places and times) are displayed in bold. If you want, you can expand the snippet to show the entire text, with the snippet highlighted in yellow. The third tab shows information about the popup's focus, and is similar to the sixth tab on the main visualization page.

# How to deploy it
Extractivist is a web application, so you'll need a web server. During initial development my focus was primarily on getting Extractivist working on Microsoft Windows (my development machine) and Ubuntu 12.10 (the server originally hosting the application). As the application is written in languages that work on all major platforms, any major operating system will do.

Make sure that the server has at least the following:
* Apache 2.x
* PHP 5.3 or higher
* Python 2.7.x (32-bit)
* MongoDB 2.4 (**without** username and password protection (I'm terribly sorry for this))

I cannot give any indication on hardware requirements, as these are largely dependent on the size of the dataset, but to give an indication: the version originally hosted on http://chunfei.lung.nl/thesis/app uses the MONA dataset, and runs reasonably well on a virtual private server with only 256MB RAM. This dataset consists of events extracted from 45 articles and should be included in your data by default.

To process extracted events and communicate with MongoDB, a number of packages are needed:
* BeautifulSoup
* geopy
* lxml
* parsedatetime
* pymongo
* python-dateutil
* rdflib
* tldextract
 
If you have all of this set up on your machine, extract Extractivist's files to a directory within your web root. If you have your own dataset, remove the folder `setup/dump/`, replace the contents of `setup/data/` with those for your own dataset, and run `$ python setup.py` from the `setup/` folder.  
Otherwise, just run `$ python setup.py install` from the `setup/` folder and the data in `setup/dump/` will be copied to the database.  
If you extracted the application to a directory above the web root (e.g. `http://example.com/subdirectory`), change the value of the `$config['base_dir']` variable.

Accessing the application's URL using a Web browser should now show the application with the loaded dataset.

> The folder `setup/data/` contains two subfolders: `json` contains JSON files for each article, each file lists events extracted from one particular article, and follows a specific format; `txt` contains the original articles' text, the file names should correspond to those of the corresponding JSON files, the first line is reserved for the source URL of the article, and the actual text starts on line 3.

# How to change things
I obviously cannot tell you how to change things, so let me give a very brief overview of what the application looks like, so you will at least know *where* you need to make modifications:
Once, extracted, you will notice six folders and couple of files:
* `application`: Contains three subfolders, which together form the actual application. The three folders are named `controllers`, `models`, and `views`, but anyone paying attention will notice that `models` in particular is a giant  misnomer.
    * `controllers`: URLs are mapped to a file (e.g. `http://diocletianus.nl/mpj0/event-autocomplete?term=s` will use `eventAutocomplete.php`), which determines what data needs to be retrieved and how it needs to be displayed.
    * `models`: Contains Python scripts which serve as an intermediary between PHP and MongoDB. Scripts are executed from the PHP scripts in the `controllers/` folder. Obviously this is far from neat, but it works.
    * `views`: PHP templates. `pages/` contains static pages, `template.php` defines the overall page layout, and `entity.php` is used for visualization pages.
* `images`: Contains all static images which are part of the user interface.
* `scripts`: Most client-side scripts are defined here, with a few (possibly still) hardcoded in the view files. Originally, scripts using the D3.js and jQuery libraries were put into their respective subfolders, but as virtually all scripts now make use of jQuery, they might as well be put together in one large folder. The most important script here for practical purposes, is `entity.js`, which is responsible for handling the overall interaction within visualization pages.
* `setup`: Contains a collection of scripts to process data and load it into the database. Comes with an example set by default.
* `style`: Contains a number of CSS files which can be used to change the appearance of the application.
* `system`: Contains four PHP files, the only file you generally need to worry about is `config.php`.

# Disclaimer
The code for Extractivist was written as part of my master thesis project, primarily to see how well such visualizations of extracted events can help users. As a result, I focused less on code quality, which is now somewhat quite very incredibly awful. On top of that, with what I know right now about what the application should be able to do, how the event data is used in practice, and how various libraries and tools (jQuery, MongoDB) work, I might have done some things differently.