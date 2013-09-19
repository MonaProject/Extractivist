<?php namespace mona;

require 'system/config.php';       # Configuration file with basic settings
require 'system/bootstrapper.php'; # Without this, nothing happens

$request = substr($_SERVER['REQUEST_URI'], strlen($config['base_dir']));
if($request == '/') {
  $request = '/dashboard';
}

new \mona\Request($request, $config, array_merge($_GET, $_POST));