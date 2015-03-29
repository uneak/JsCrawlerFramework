var classCreate = function (prototype) {

    var jsClass = (prototype.hasOwnProperty("constructor")) ? prototype["constructor"] : function () {};
    for (var attr in prototype) {
        jsClass.prototype[attr] = prototype[attr];
    }

    return jsClass;
}

var classExtends = function (extend, prototype) {

    var jsClass = (prototype.hasOwnProperty("constructor")) ? prototype["constructor"] : function () {};
    jsClass.prototype = new extend;
    for (var attr in prototype) {
        jsClass.prototype[attr] = prototype[attr];
    }

    return jsClass;
}



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

var RouterView = {


    mode: !!(window.history.pushState) ? "history" : "hash",
    hash: "#!",

    _constructor: function () {
        this.routes = [];
        this.routesLength = 0;
        this.root = "/";
    },

    setRoot: function (root) {
        this.root = root.replace(/^\/?(.*?)\/?$/, "/$1/");
    },

    getRoot: function (root) {
        return this.root;
    },

    watch: function (regExp, id) {
        this.routes[this.routesLength] = {
            route: regExp,
            id: id
        };
        this.routesLength++;
        return this;
    },

    check: function (fragment) {
        var pFragment = fragment || this.getFragment();
        for (var i = 0; i < this.routesLength; i++) {
            var match = pFragment.match(this.routes[i].route);
            if (match) {
                match.shift();
                this.talk("onRouteChange." + this.routes[i].id, {
                    id: this.routes[i].id,
                    route: this.routes[i].route,
                    fragment: pFragment,
                    match: match
                });
                return this;
            }
        }
        return this;
    },

    start: function () {
        var self = this;
        var current = null;//self.getFragment();
        var fn = function () {
            if (current !== self.getFragment()) {
                current = self.getFragment();
                self.check(current);
            }
        };
        clearInterval(this.interval);
        this.interval = setInterval(fn, 50);
        return this;
    },


    navigate: function (path) {
        path = path ? path : "";
        if (this.mode === "history") {
            window.history.pushState(null, null, path.replace(/^\/?(.*?)\/?$/, this.root + "$1"));
        } else {
            var re = new RegExp("(?:" + this.hash + "(.*?)|)$");
            window.location.href = window.location.href.replace(re, this.hash + path);
        }
        return this;
    },

    getFragment: function () {
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
    }
};

var LoaderModel = {

    _constructor: function () {

        var self = this;
        this.routeWatch = null;
        this.xhr = this.getXHR();


        this.xhr.onabort = function (event) {
            self.talk("onAbort."+self.routeWatch.id, {xhr: this, event: event, route: self.routeWatch});
        };

        this.xhr.onerror = function (event) {
            self.talk("onError."+self.routeWatch.id, {xhr: this, event: event, route: self.routeWatch});
        };

        this.xhr.onload = function (event) {
            self.talk("onLoad."+self.routeWatch.id, {xhr: this, event: event, route: self.routeWatch});
        };

        this.xhr.onloadend = function (event) {
            self.talk("onLoadEnd."+self.routeWatch.id, {xhr: this, event: event, route: self.routeWatch});
            self.checkComplete();
        };

        this.xhr.onloadstart = function (event) {
            self.talk("onLoadStart."+self.routeWatch.id, {xhr: this, event: event, route: self.routeWatch});
        };

        this.xhr.onprogress = function (event) {
            var percentComplete = 0;
            if (event.lengthComputable) {
                percentComplete = event.loaded / event.total;
            }
            self.talk("onProgress."+self.routeWatch.id, {xhr: this, perc: percentComplete, event: event, route: self.routeWatch});
        };

        this.xhr.onreadystatechange = function (event) {
            self.talk("onReadyStateChange."+self.routeWatch.id, {xhr: this, event: event, route: self.routeWatch});
        };

        this.xhr.ontimeout = function (event) {
            self.talk("onTimeout."+self.routeWatch.id, {xhr: this, event: event, route: self.routeWatch});
        };
    },

    getXHR: function () {
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
        return null;
    },

    load: function (routeWatch) {

        if (this.routeWatch !== routeWatch) {

            if (this.xhr.readyState != 0) {
                this.xhr.abort();
            }

            this.routeWatch = routeWatch;

            this.xhr.open("GET", this.routeWatch.fragment, true);
            this.xhr.send();
        }

    },

    checkComplete: function () {
        if (this.xhr.readyState == 4 && this.xhr.status == 200) {
            this.talk("onDataLoaded."+this.routeWatch.id, {xhr: this.xhr, route: this.routeWatch});

        }
    }

};



var Crawler = classCreate({

    constructor: function (html) {

        this.__html__ = html;
        this.__cache__ = [];

        var varRegExp = /<!--\s+crawler:begin:(.*?)\s+-->/gi;
        var varMatch;

        while ((varMatch = varRegExp.exec(this.__html__)) != null) {

            var varName = varMatch[1];
            var blockRegExp = new RegExp("<!--\\s+crawler:end:" + varName + "\\s+-->", "i");
            blockRegExp.lastIndex = varRegExp.lastIndex;
            var blockMatch;

            if ((blockMatch = blockRegExp.exec(this.__html__)) != null) {
                this[varName] = new Crawler(this.__html__.substring(varRegExp.lastIndex, blockMatch.index));
                varRegExp.lastIndex = blockMatch.index;
            } else {
                varRegExp.lastIndex++;
            }
        }
    },

    byTag: function (name) {
        if (!this.__cache__[name]) {
            var tagRegExp = new RegExp("<\\s*?(" + name + ")\\s*?.*?>((?:.|\\r|\\n)*?)<\\/\\s*?\\1\\s*?>", "g");
            var m;

            if ((m = tagRegExp.exec(this.__html__)) != null) {
                if (m.index === tagRegExp.lastIndex) {
                    tagRegExp.lastIndex++;
                }
                this.__cache__[name] = m[2];
            }
        }

        return this.__cache__[name];
    },

    toString: function () {
        return this.__html__;
    }

});
