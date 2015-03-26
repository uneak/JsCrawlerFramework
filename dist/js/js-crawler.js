var isExternal = function (url) {
    var match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
    if (typeof match[1] === "string" && match[1].length > 0 && match[1].toLowerCase() !== location.protocol) {
        return true;
    }
    if (typeof match[2] === "string" && match[2].length > 0 && match[2].replace(new RegExp(":(" + {
            "http:": 80,
            "https:": 443
        }[location.protocol] + ")?$"), "") !== location.host) {
        return true;
    }
    return false;
};

var hasClass = function (ele, cls) {
    return ele.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"));
};

var addClass = function (ele, cls) {
    if (!this.hasClass(ele, cls)) {
        ele.className += " " + cls;
    }
};

var removeClass = function (ele, cls) {
    if (this.hasClass(ele, cls)) {
        var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
        ele.className = ele.className.replace(reg, " ");
    }
};

var getElementByClass = function (ele, cls) {
    if (!ele) {
        return null;
    }
    var cls_string = new RegExp("(\\s|^)" + cls + "(\\s|$)");
    var nb = ele.children.length - 1;
    for (var k = nb; k >= 0; k--) {
        if (ele.children[k].className.match(cls_string)) {
            return ele.children[k];
        }
    }
    return null;
};

var Router = function (root) {
    this.routesLength = 0;
    this.routes = [];
    this.mode = !!(window.history.pushState) ? "history" : "hash";
    this.hash = "#!";
    this.root = root ? root.replace(/^\/?(.*?)\/?$/, "/$1/") : "/";

    this.onChange = null;
};

Router.prototype.getFragment = function () {
    var fragment = "";
    var re;

    if (this.mode === "history") {
        re = new RegExp("^(?:" + this.root + ")(.*?)(?:\\?.*)?\\/?$");
        fragment = decodeURI(location.pathname + location.search).replace(re, "$1");
    } else {
        re = new RegExp(".*?" + this.hash + "\\/?(.*?)\\/?(?:\\?.*)\\/?$");
        fragment = window.location.href.replace(re, "$1");
    }
    return fragment;
};

Router.prototype.add = function (regExp, controllerFn) {
    this.routes[this.routesLength] = {
        route: regExp,
        controller: controllerFn
    };
    this.routesLength++;
    return this;
};

Router.prototype.check = function (fragment) {
    var pFragment = fragment || this.getFragment();
    for (var i = 0; i < this.routesLength; i++) {
        var match = pFragment.match(this.routes[i].route);
        if (match) {
            match.shift();

            if (this.onChange) {
                this.onChange.call(undefined, match, this.routes[i].controller);
            }

            //this.routes[i].controller.apply({}, match);
            return this;
        }
    }
    return this;
};

Router.prototype.listen = function () {
    var self = this;
    var current = self.getFragment();
    var fn = function () {
        if (current !== self.getFragment()) {
            current = self.getFragment();
            self.check(current);
        }
    };
    clearInterval(this.interval);
    this.interval = setInterval(fn, 50);
    return this;
};

Router.prototype.navigate = function (path) {
    path = path ? path : "";
    if (this.mode === "history") {
        window.history.pushState(null, null, path.replace(/^\/?(.*?)\/?$/, this.root + "$1"));
    } else {
        var re = new RegExp("(?:" + this.hash + "(.*?)|)$");
        window.location.href = window.location.href.replace(re, this.hash + path);
    }
    return this;
};


Router.prototype.loadPage = function (url) {

    self.currentUrl = url;
    if (self.xhr && self.xhr.readyState != 0)
        self.xhr.abort();

    self.xhr.open("GET", self.currentUrl, true);
    self.xhr.send();
    self.startLoading("MAIN");

};

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

var JsCrawler = function (rootUrl) {
    var self = this;

    this.router = new Router(rootUrl);
    this.router.onChange = function(match, controller) {
        console.log(self);
        console.log(match);

        controller.apply({}, match);
    };


    this.xhr = this.getXHR();

    this.xhr.onreadystatechange = function() {
        if (this.xhr.readyState == 4 && this.xhr.status == 200) {
            console.log(this.xhr.responseText);
        }
    };

    this.updateLinks();
};


JsCrawler.prototype.updateLinks = function(root) {

        root = root || document.body;
        var self = this;

        if (!hasClass(root, "external") && root.tagName.toUpperCase() === "A") {
            if (root.getAttribute("href")) {
                if (!isExternal(root.getAttribute("href"))) {
                    root.onclick = function(event) {
                        event.preventDefault();
                        self.router.navigate(event.target.getAttribute("href"));
                    };
                }
            }
        }

        var children = root.children;
        for (var i = children.length; i--;) {
            this.updateLinks(children[i]);
        }

};


JsCrawler.prototype.getXHR = function() {
    if (window.XMLHttpRequest || window.ActiveXObject) {
        if (window.ActiveXObject) {
            try {
                return new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                return new ActiveXObject("Microsoft.XMLHTTP");
            }
        } else {
            return new XMLHttpRequest();
        }
    }

    alert("Votre navigateur ne supporte pas l'objet XMLHTTPRequest...");
    return null;
};

