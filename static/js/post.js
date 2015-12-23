---
    layout: null
---

$(document).ready(function() {
    var $mt = $('.toc');
    var $toc;
    $mt.each(function(i,o){
        $toc = $(o);
        $toc.toc({ listType: 'ul', headers: 'h1, h2, h3' });
    });
});