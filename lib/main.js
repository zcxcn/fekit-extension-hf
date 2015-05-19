var fs = require('fs');
exports.getContent = function(channel) {
    var channel = 'home';
    var pathHtml = process.cwd() + '/prd/home/header_main.html';
    var pathStyle = process.cwd() + '/prd/home/header_styles.html';
    var html = fs.readFileSync(pathHtml);
    var style = fs.readFileSync(pathStyle);
    return {
        html: html,
        style: style
    }
}
