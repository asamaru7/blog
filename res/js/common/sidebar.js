"use strict";!function(){var t=document,e=window;!function(n,a){n=n||"docReady",a=a||window;var d=[],o=!1,c=!1;function i(){if(!o){o=!0;for(var t=0;t<d.length;t++)d[t].fn.call(window,d[t].ctx);d=[]}}function u(){"complete"===t.readyState&&i()}a[n]=function(n,a){if("function"!=typeof n)throw new TypeError("callback for docReady(fn) must be a function");o?setTimeout((function(){n(a)}),1):(d.push({fn:n,ctx:a}),"complete"===t.readyState||!t.attachEvent&&"interactive"===t.readyState?setTimeout(i,1):c||(t.addEventListener?(t.addEventListener("DOMContentLoaded",i,!1),e.addEventListener("load",i,!1)):(t.attachEvent("onreadystatechange",u),e.attachEvent("onload",i)),c=!0))}}("DOMReady",window),DOMReady((function(){if(Slideout&&document.getElementById("main-panel")){var t,e,n,a=new Slideout({panel:document.getElementById("main-panel"),menu:document.getElementById("sidebar"),padding:300,tolerance:70,touch:!1,side:"right"});t=document.getElementById("btn-slide"),e="click",n=function(){a.toggle()},t.attachEvent?t.attachEvent("on"+e,n):t.addEventListener(e,n,!1)}}))}();
