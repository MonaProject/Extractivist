
function initialize_tab_box(div) {
    var list = document.getElementById(div);

    for(var i = 0; i < list.children.length; i++)
        list.children[i].children[0].addEventListener('click', function() {
            clicked_tab = this.getAttribute('id').substring(12);

            for(var j = 1; j <= list.children.length; j++) {
                if(j == clicked_tab) {
                    document.getElementById('tab-box-tab-' + j).className += " active";
                    document.getElementById('tab-box-box-' + j).className += " active";
                }
                else {
                    document.getElementById('tab-box-tab-' + j).className = document.getElementById('tab-box-tab-' + j).className.replace( /(?:^|\s)active(?!\S)/g , '' )
                    document.getElementById('tab-box-box-' + j).className = document.getElementById('tab-box-box-' + j).className.replace( /(?:^|\s)active(?!\S)/g , '' )
                }
            }
        });
}