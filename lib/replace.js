 var http = require('http'),
     connect = require('connect'),
     httpProxy = require('http-proxy'),
     harmon = require('harmon'),
     main = require('./main');

 var selects = [];
 var htmlselect = {};
 var styleselect = {};
 var scriptselect = {};

 //替换html
 htmlselect.query = 'div.q_header';
 htmlselect.func = function(node) {
         var content = main.getContent('flght');
         node.createWriteStream({
             outer: false
                 // }).end(content.html);
         }).end(content.html);
     }
     //替换style
 styleselect.query = 'style[data-hfstamp]';
 styleselect.func = function(node) {
     var content = main.getContent('flght');
     node.createWriteStream({
         outer: true
     }).end(content.style);
 }


 selects.push(htmlselect);
 selects.push(styleselect);

 var connect = require('connect');
 var app = connect() 
     .use(harmon([], selects,true))
     .use(function(req, res) {
         var protocol = req._parsedUrl.protocol;
         var host = req.headers.host;
         proxy.web(req, res, {
             target: protocol + '//' + host
         });
     })
     .listen(8000);

 var proxy = httpProxy.createProxyServer({});

 console.log(8000);
