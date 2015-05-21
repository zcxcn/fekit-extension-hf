 var http = require('http'),
     connect = require('connect'),
     fs = require('fs'),
     httpProxy = require('http-proxy'),
     harmon = require('harmon'),
     syspath = require('path'),
     main = require('./main');
 // //每隔100ms删除一次模块缓存
 // setInterval(function() {
 //     for (var name in require.cache) {
 //         //这里可以添加具体的删除策略             
 //         delete require.cache[name];
 //     }
 // }, 100)
 var selects = [];
 var htmlselect = {};
 var styleselect = {};
 var scriptselect = {};


 var isDebug = true;

 var baselib = syspath.join(module.filename, '../')
 var channelHash = require(baselib + 'channelHash.json');
 console.log(channelHash);
 var connect = require('connect');
 var app = connect()
     .use(function(req, res, next) {
         // try {

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
             console.log(channel, realChannel);
             var content = main.getContent(realChannel);
             if (!content) {
                 next();
                 return;
             }


             fs.readFile(baselib + 'script.js', function(err, chunk) {
                 var script = chunk.toString();
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
             });

         } else {
             next();
         }
         // } catch (e) {
         //     console.log(e)
         // }
     })
     .use(function(req, res) {
         if (!res.socket || res.socket.destroyed) {
             cosole.warn('client socket closed,oop!');
             return res.end('error');
         }
         var protocol = req._parsedUrl.protocol;
         var host = req.headers.host;
         proxy.web(req, res, {
             target: protocol + '//' + host
         });
     })
     .listen(8000);
 app.on('error', function() {
     console.log('error');
 })
 var proxy = httpProxy.createProxyServer({});

 console.log(8000);

 function getChannel(channel) {
     for (var key in channelHash) {
         if (channel == key) return channelHash[key]['path']
     }
     return null;
 }
