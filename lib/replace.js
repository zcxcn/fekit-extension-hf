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
 process.on('uncaughtException', function(err) {
     console.log('error:', err);
 });
 process.setMaxListeners(20);

 var selects = [];
 var htmlselect = {};
 var styleselect = {};
 var scriptselect = {};

 var scriptCache = '';
 var isDebug = true;

 var baselib = syspath.join(module.filename, '../')
 var channelHash = require(baselib + 'channelHash.json');
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
             var subDomain = pu.host.substr(0, index);

             //  console.log(req.url);

             var realChannel = getChannel(subDomain);
             if (!realChannel) {
                 next();
                 return;
             }

             var content = main.getContent(channelHash[realChannel]);

             if (!content) {
                 next();
                 return;
             } 
             //获取嵌入脚本
             getScript(function(script) {
                 script = script.replace('{{channel}}', realChannel);

                 if (isDebug) {
                     content.html = content.html + '<script>' + script + '</script>';
                 }
                 //替换html
                 htmlselect.query = 'div.q_header';
                 htmlselect.func = function(node) {
                         node.createWriteStream({
                             outer: false
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
         // if (!res.socket || res.socket.destroyed) {
         //     cosole.warn('client socket closed,oop!');
         //     return res.end('error');
         // }
         var protocol = req._parsedUrl.protocol;
         var host = req.headers.host;
         proxy.web(req, res, {
             target: protocol + '//' + host
         }, function(e) {
             //避免刷太快报 socket hang up
              console.log('proxy error:', e);
         });
     })
     .listen(8001);
 app.on('error', function(e) {
     console.log('connect error:', e);
 })
 var proxy = httpProxy.createProxyServer({});

 console.log(8001);

 function getScript(callback) {
     if (scriptCache) {
         callback.call(null, scriptCache)
     } else {
         fs.readFile(baselib + 'script.js', function(err, chunk) {
             scriptCache = chunk.toString('utf-8');
             callback.call(null, scriptCache);
         })
     }
 }

 function getChannel(subDomain) {
     for (var key in channelHash) {
         if (subDomain == key) return channelHash[key]['path'];
     }
     return null;
 }
