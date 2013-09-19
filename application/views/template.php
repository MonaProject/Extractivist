<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
<!--
                              ~888                                
                             8888                                 
                           D8888                                  
                          88888 D88                               
                         88888 88D                                
                        88Z88888~                         I       
                       88D88888ZDD                    88888       
                      88D~8888D88                  888D8888888888?
                      88 8888888                D8888D88D8888     
                     D8 8888888              8888D8ZI8888~8888    
                     88 888888D8           88888  888888888       
                    88 88888888D         8888  8888888DI          
                    88 88888888        88D8 88888888888888        
                    888888D888 ?     8888 88888D88888D            
                    D8888 888D88   8888D888888888I                
                   ?88888888888Z  88888888D888 D888888888         
                   ?888D8888888 888888888D88888D8888?             
                    8888   D 888888888888888888                   
                    D888    88888888888 8888888888                
                    D88    888888888 D888DD                       
                    Z88    8888888 I88D888                        
                     8   $888 88         ,                        
                     D  8 D       Z    8 888                      
                        D   888888888D       D                    
                      D$  888888888888D      8                    
                       888D88888888888  8D?88                     
                       888888   888 888                           
                       88 888   ?D8 Z888                          
                       8   ~8D    DD   8                          
                      8D    8    8    ?8         

                    U N I V E R S I T A S   L I B E R A

      A U X I L I U M   N O S T R U M   I N   N O M I N E   D O M I N I                
-->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><?php echo strip_tags($data['title']) ?> | <?php echo $data['config']['application_name'] ?> <?php echo $data['config']['version_number'] ?></title>
    <link rel="stylesheet" media="screen" href="<?php echo $data['config']['base_dir'] ?>/style/screen.css" />
    <link rel="stylesheet" media="screen and (max-width: 1366px)" href="<?php echo $data['config']['base_dir'] ?>/style/screenime.css" />
    <link rel="shortcut icon" type="image/png" href="<?php echo $data['config']['base_dir'] ?>/favicon.ico">
    <!-- There is so much room for scripts! -->
    <!--[if IE lte 8]><script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script><![endif]-->
    <script src="scripts/monastery.js"></script>
    <script src="scripts/html5shiv.js"></script>
    <script src="scripts/jquery/jquery.js"></script>
    <script src="scripts/jquery/jquery-ui.js"></script>
    <script src="scripts/jquery/autocomplete.js"></script>
<?php
  if(count($data['pre_scripts']) > 0) {
    foreach($data['pre_scripts'] as $script) {
      echo '    <script src="' . $script . '"></script>' . "\n";
    }
  }
?>
<?php
  if(isset($_SESSION['pid']))
    echo '    <script src="scripts/usabilitytestding.js"></script>' . "\n";
?>
<?php
  if(isset($data['type'])):
?>
   <script>google.load("visualization", "1", {packages:["corechart"]});</script>
<?php
  endif;
?>
  </head>
  <body>
    <div id="wrapper">
      <header class="<?php echo $data['page'] ?>_page">
<?php
  if(!isset($data['is_main'])):
?>
        <a href="<?php echo $data['config']['base_dir'] ?>/">home</a>
        <!-- <?php echo $data['config']['motto'] ?> -->
<?php
  endif;
?>
        <form method="get" onsubmit="return false">
          <input type="submit" value="Search" />
          <input type="text" name="q" id="query" placeholder="Search" />
        </form>
<?php
  if(!isset($data['is_main']) && !isset($data['is_special'])):
?>
        <h1><?php if(isset($data['type'])) echo '<img src="' . $data['config']['base_dir'] . '/images/' . $data['type'] . '25.png" width="25" height="25" alt="' . $data['type'] . '" style="position: relative; top: 5px" /> ' ?><?php echo $data['title'] ?></h1>
<?php
  endif;
  if(isset($data['is_main']) || isset($data['is_special'])):
?>
        <h1></h1>
<?php
  endif;
?>
      </header>
      <div id="main">
<?php
  if(isset($data['secondary_template']))
    require_once 'application/views/' . $data['secondary_template'] . '.php';
?>
      </div>
<?php
  if(!isset($data['secondary_template'])):
?>
      <div id="content">
<?php echo $data['content'] ?>
      </div>
<?php endif; ?>
      <div id="footer_push"></div>
    </div>
    <footer>
      <ul>
<?php
/*
        <li><a href="<?php echo $data['config']['base_dir'] ?>/about" title="See what this project is about">About</a></li>
        <li><a href="<?php echo $data['config']['base_dir'] ?>/changelog" title="View the list of recent changes to this application">Changelog</a></li>
        <li><a href="<?php echo $data['config']['base_dir'] ?>/feedback" title="What do you think of this appliction? Tell us!">Feedback</a></li>
*/
?>
        <li>Development version <?php echo $data['config']['version_number'] ?></li>
      </ul>
    </footer>
    <div id="dialog-search" title=""><p>You have selected <span id="selected-search"></span>. What would you like to do?</p></div>
<?php
  if(count($data['post_scripts']) > 0) {
    foreach($data['post_scripts'] as $script) {
      echo '    <script src="' . $script . '"></script>' . "\n";
    }
  }
?>
<?php
  if(strlen($data['post_script']) > 0) {
    echo '    <script>' . "\n" . $data['post_script'] . "\n" . '</script>' . "\n";
  }
?>
    <script>
      $(function() {
        $( document ).tooltip();
      });
    </script>
<?php
  if(isset($_SESSION['pid']))
    echo '    <script>participant_id = ' . $_SESSION['pid'] . '</script>' . "\n";
?>
  </body>
</html>