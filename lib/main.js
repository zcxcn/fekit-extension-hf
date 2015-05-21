var fs = require('fs');
exports.getContent = function(channel) {
    try {
    	 channel = channel || 'home';
        var pathHtml = process.cwd() + '/prd/' + channel + '/header_main.html';
        var pathStyle = process.cwd() + '/prd/' + channel + '/header_styles.html';
        var html = fs.readFileSync(pathHtml);
        var style = fs.readFileSync(pathStyle);
        return {
            html: html,
            style: style
        }
    } catch (e) {
        return null;
    }

}
