$(function() {

  $( "#query" ).autocomplete({
    source: "autocomplete",
    minLength: 2,
    select: function( event, selection ) {
      selection = selection.item.label.split('(');
      
      name = '';
      for(var i = 0; i < selection.length - 1; i++) {
        if(i === 0)
          name += ' ' + selection[i];
        else
          name += ' (' + selection[i];
      }
      
      name = name.substring(1).replace(/  /g, ' ').trim();
      
      type = selection[selection.length - 1];
      type = type.substring(0, type.length - 1).toLowerCase();
      
      var filters = '[{"type": "' + type + 's", "label": "' + name + '"}]';
      
      if(window.location.toString().indexOf('entity') === -1)
        window.location.replace('entity?type=' + type + '&name=' + name + '&filters=' + encodeURIComponent(filters));
      else
        $(function() {
          $('#selected-search').empty().append(name);
          $( "#dialog-search" ).dialog({
            height: 170,
            modal: true,
            buttons: {
              "Show only this": function() {
                $( this ).dialog( "close" );
                window.location.replace('entity?type=' + type + '&name=' + name + '&filters=' + encodeURIComponent(filters));
              },
              "Add to filter": function() {
                add_entity_to_filters(type + 's', name);
                $( this ).dialog( "close" );
                $('header input').val('');
              }
            }
          });
        });
    }
  });
});