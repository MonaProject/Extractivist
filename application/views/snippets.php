<script>
function load_large_snippet(article, event) {
  $('.snippet').removeClass('active');
  $(this).addClass('active');
  $.ajax({url: 'snippet?article=' + article + '&event=' + event }).done(function(data) {
    $('#snippet').empty().append(data);
  });
}
</script>
<h2>Articles in which both <a href="entity?type=<?php echo htmlentities($_GET['type1']) ?>&name=<?php echo htmlentities($_GET['name1']) ?>" class="<?php echo htmlentities($_GET['type1']) ?>-color keyword"><?php echo htmlentities($_GET['name1']) ?></a> and <a href="entity?type=<?php echo htmlentities($_GET['type2']) ?>&name=<?php echo htmlentities($_GET['name2']) ?>" class="<?php echo htmlentities($_GET['type2']) ?>-color keyword"><?php echo htmlentities($_GET['name2']) ?></a> are mentioned</h2>
<div id="snippet" class="snippet">
Loading...
</div>
<div id="snippets_container">
<div id="snippets">
<?php echo $data['content'] ?>
</div>
</div>
<script>
$(document).ready(function() {
    $('#snippets_container').slimScroll({
        height: $('#snippets_container').css({'height': ($(window).height() - 120) + 'px'}),
        alwaysVisible: true
    });
  });
  
  $(window).resize(function(){    
      $('#snippets_container').slimScroll({
          height: $('#snippets_container').css({'height': ($(window).height() - 120) + 'px'})
      });
  });
</script>