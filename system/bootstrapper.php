<?php namespace mona;

/**
 * Automatically loads classes for us so you don't have to
 */
spl_autoload_register(function($class) {
  if(strpos($class, '\\') !== 0) {
    $class = explode('\\', $class);
    $class = end($class);
  }

  // System classes
  if(file_exists('system/' . strtolower($class) . '.php')) {
    require_once('system/' . strtolower($class) . '.php');
    return;
  }  

  // User-defined classes
  $mcv = array('Controller' => 'controllers',
               'Model'      => 'models',
               'View'       => 'views');


  foreach($mcv as $type => $folder) {
    if(strpos($class, $type) !== false) {
      $class_file = lcfirst(substr($class,
                                   0,
                                   strlen($class) - strlen($type)
                                  )
                           );

      if(file_exists('application/' . $folder . '/' . $class_file . '.php')) {
        require_once 'application/' . $folder . '/' . $class_file . '.php';
        return;
      }
    }
  }
});


# Prevents visible data from being sent before the headers
ob_start();