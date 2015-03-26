var Crawler = function (html) {
    this.__html__ = html;
    this.__cache__ = [];

    var varRegExp = /<!--\s+UNEAK:BEGIN:(.*?)\s+-->/gi;
    var varMatch;

    while ((varMatch = varRegExp.exec(this.__html__)) != null) {

        var varName = varMatch[1];
        var blockRegExp = new RegExp("<!--\\s+UNEAK:END:"+varName+"\\s+-->", "i");
        blockRegExp.lastIndex = varRegExp.lastIndex;
        var blockMatch;

        if ((blockMatch = blockRegExp.exec(this.__html__)) != null) {
            this[varName] = new Crawler(this.__html__.substring(varRegExp.lastIndex,blockMatch.index));
            varRegExp.lastIndex = blockMatch.index;
        } else {
            varRegExp.lastIndex++;
        }
    }
};

Crawler.prototype.byTag = function(name) {
    if (!this.__cache__[name]) {
        var tagRegExp = new RegExp("<\\s*?("+name+")\\s*?.*?>((?:.|\\r|\\n)*?)<\\/\\s*?\\1\\s*?>", "g");
        var m;

        if ((m = tagRegExp.exec(this.__html__)) != null) {
            if (m.index === tagRegExp.lastIndex) {
                tagRegExp.lastIndex++;
            }
            this.__cache__[name] = m[2];
        }
    }

    return this.__cache__[name];
};

Crawler.prototype.toString = function() {
    return this.__html__;
};