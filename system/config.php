<?php namespace mona;

# Set to -1 during development, 0 on production
error_reporting(0);

# Base directory, i.e. subdirectory at which your homepage can be found
$config['base_dir'] = '';

# Application namespace; lowercase, no freaky stuff such as spaces, e.g. 
$config['namespace'] = 'mona';

# Application name, e.g. 'My first untitled application'
//$names = array('ACTEVESTplorer', 'Extractivist', 'Activisualizer', 'Actevesualizer', 'Extractivanalytics', 'Simple Event Browser', 'Extractivism Browser');
//$config['application_name'] = $names[mt_rand(0, count($names) - 1)] .' (???)';
$config['application_name'] = 'Extractivist';

# This is not actually used anywhere.
$config['motto'] = 'In God We Trust, All Others We Monitor';

# Version number, e.g. [major version].[minor version].[revision]
$config['version_number'] = '0.20.104';

/**
 * TESTING CODE
 */
session_start();