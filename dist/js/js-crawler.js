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

var EventDispatcher = classCreate({

    constructor: function () {
        this.listeners = [];
        this.listenersLength = 0;
    },

    addEventListener: function (context, observer, callback) {
        this.listeners[this.listenersLength] = {context: context, observer: observer, callback: callback};
        this.listenersLength++;
        return this;
    },

    removeEventListenerByObserver: function (observer) {
        for (var i = 0; i < this.listenersLength; i++) {
            if (this.listeners[i].observer === observer) {
                // TODO: remove listener
                // this.listeners.splice(index, 1);
                // this.listenersLength--;
            }
        }
        return this;
    },

    removeEventListenerByContext: function (context) {
        for (var i = 0; i < this.listenersLength; i++) {
            if (this.listeners[i].context === context) {
                // TODO: remove listener
                // this.listeners.splice(index, 1);
                // this.listenersLength--;
            }
        }
        return this;
    },

    removeEventListenerByCallback: function (callback) {
        for (var i = 0; i < this.listenersLength; i++) {
            if (this.listeners[i].callback === callback) {
                // TODO: remove listener
                // this.listeners.splice(index, 1);
                // this.listenersLength--;
            }
        }
        return this;
    },

    fireEvent: function (context, event) {
        event = event || {};
        for (var i = 0; i < this.listenersLength; i++) {
            if (this.listeners[i].context === context) {
                this.listeners[i].callback.call(this.listeners[i].observer, event);
            }
        }
        return this;
    }

});




var RouterView = {

    routes: [],
    routesLength: 0,
    mode: !!(window.history.pushState) ? "history" : "hash",
    hash: "#!",

    constructor: function (root) {
        MvcElement.call(this);
        this.root = root ? root.replace(/^\/?(.*?)\/?$/, "/$1/") : "/test/jscrawler/";
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
                this.talk("onRouteChange."+this.routes[i].id, {
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
    }

};

var LoaderModel = {

    constructor: function () {
        MvcElement.call(this);

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


var MvcElement = classCreate({

    talk : function(context, event) {
        this.mvc.talk(this._id + "." + context, event);
    }

});

var MvcGroup = classCreate({

    constructor: function (app) {
        this.__app__ = app;
        this.listeners = {};
    },

    add: function (id, obj, ext) {
        ext = ext || MvcElement;

        obj["app"] = this.__app__;
        obj["_id"] = id;
        obj["mvc"] = this;
        var nw = classExtends(ext, obj);
        this[id] = new nw();
        return this[id];
    },

    call: function (path, argument) {
        var match;
        if ((match = /^(.*?)\.(.*)$/.exec(path)) !== null) {
            return this[match[1]][match[2]](argument);
        }
        return null;
    },

    talk: function (context, event) {
        event = event || {};

        var re = /\.*([^.]+)\.*/g;
        var m;
        var ns = this.listeners;
        while ((m = re.exec(context)) !== null && ns[m[1]]) {
            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }

            ns = ns[m[1]];
            if (ns._listeners) {
                for (var i = 0; i < ns["_listeners"].length; i++) {
                    ns["_listeners"][i].callback.call(ns["_listeners"][i].observer, event);
                }
            }
        }
        return this;
    },

    listen: function (context, observer, callback) {

        var re = /\.*([^.]+)\.*/g;
        var m;
        var ns = this.listeners;
        while ((m = re.exec(context)) !== null) {
            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }
            ns[m[1]] = ns[m[1]] || {};
            ns = ns[m[1]];
        }

        ns["_listeners"] = ns["_listeners"] || [];
        ns["_listeners"].push({context: context, observer: observer, callback: callback});
    }

});



var JsCrawler = classCreate({

    constructor: function () {

        this.controllers = new MvcGroup(this);
        this.models = new MvcGroup(this);
        this.views = new MvcGroup(this);


        //this.models.listen("loader.dataLoaded", this, this.onDataLoaded);
        //this.views.listen("router.matchedRoute", this, this.onMatchedRoute);

        this.updateLinks();
    },


    //onMatchedRoute: function (event) {
    //    this.models.call("loader.load", event);
    //},
    //
    //onDataLoaded: function (event) {
    //    event.crawler = new Crawler(event.xhr.responseText);
    //    this.controllers.call(event.route.controller, event);
    //},


    updateLinks: function (root) {

        root = root || document.body;
        var self = this;

        if (!hasClass(root, "external") && root.tagName.toUpperCase() === "A") {
            if (root.getAttribute("href")) {
                if (!isExternal(root.getAttribute("href"))) {
                    root.onclick = function (event) {
                        event.preventDefault();
                        self.views.call("router.navigate", event.target.getAttribute("href"));
                        //self.router.navigate(event.target.getAttribute("href"));
                    };
                }
            }
        }

        var children = root.children;
        for (var i = children.length; i--;) {
            this.updateLinks(children[i]);
        }

    }


});
