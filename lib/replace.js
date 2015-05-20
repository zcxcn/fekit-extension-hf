 var http = require('http'),
     connect = require('connect'),
     fs = require('fs'),
     httpProxy = require('http-proxy'),
     harmon = require('harmon'),
     syspath = require('path'),
     main = require('./main');

 var selects = [];
 var htmlselect = {};
 var styleselect = {};
 var scriptselect = {};


 var isDebug = true;


 var channelHash = {
     'www': 'home',
     'app': 'app',
     'bus': 'bus',
     'car': 'car',
     'i': 'ddr',
     'deposite': 'deposite',
     'flight': 'flight',
     'gongyu': 'gongyu',
     'guide': 'guide',
     'hotel': 'hotel',
     'lvtu': 'lvtu',
     'order': 'order',
     'dujia': 'package',
     'paycenter': 'paycenter',
     'piao': 'piao',
     'train': 'train',
     'travel': 'travel',
     'tuan': 'tuan',
     'ugc': 'ugc',
     'user': 'user',
     'zhixin': 'zhixin' 
     //todo 车车 骆驼卡
 }
 var connect = require('connect');
 var app = connect()
     .use(function(req, res, next) {
         var pu = req._parsedUrl;
         if (pu.host.indexOf('qunar.com') > -1) {
             // if (pu.url.test(/[\.js|\.css|\.png]$/)) {
             if (/(\.js|\.css|\.png|\.jpg|\.gif|\.swf)(\?.*)?$/.test(req.url)) {
                 next();
                 return;
             }
             var index = pu.host.indexOf('.')
             var channel = pu.host.substr(0, index);

             console.log(req.url);

             var realChannel = getChannel(channel);
             if (!realChannel) {
                 next();
                 return;
             }
             console.log(channel, realChannel)
             var content = main.getContent(realChannel);
             if (!content) {
                 next();
                 return;
             }

             var baselib = syspath.join(module.filename, '../')
             var script = fs.readFileSync(baselib + 'script.js').toString();
             script = script.replace('{{channel}}', realChannel);
             if (isDebug) {
                 content.html = content.html + '<script>' + script + '</script>';
             }
             //替换html
             htmlselect.query = 'div.q_header';
             htmlselect.func = function(node) {
                     node.createWriteStream({
                         outer: false
                             //     }).end('fuckhtml');
                     }).end(content.html);
                 }
                 //替换style
             styleselect.query = 'style[data-hfstamp]';
             styleselect.func = function(node) {
                 node.createWriteStream({
                     outer: true
                 }).end(content.style);
             }
             selects.push(htmlselect);
             selects.push(styleselect);
             var func = harmon([], selects, true);
             func(req, res, next);
         } else {
             next();
         }
     })
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

 function getChannel(channel) {
     for (var key in channelHash) {
         if (channel == key) return channelHash[key]
     }
     return null;
 }
