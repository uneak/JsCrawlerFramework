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

var EventDispatcher = function () {
    this.listeners = [];
    this.listenersLength = 0;
};

EventDispatcher.prototype.addEventListener = function( context, observer, callback ){
    this.listeners[this.listenersLength] = {context:context, observer:observer, callback:callback};
    this.listenersLength++;
    return this;
};

EventDispatcher.prototype.removeEventListenerByObserver = function( observer ){
    for(var i = 0; i < this.listenersLength; i++){
        if (this.listeners[i].observer === observer) {
            // TODO: remove listener
            // this.listeners.splice(index, 1);
            // this.listenersLength--;
        }
    }
    return this;
};

EventDispatcher.prototype.removeEventListenerByContext = function( context ){
    for(var i = 0; i < this.listenersLength; i++){
        if (this.listeners[i].context === context) {
            // TODO: remove listener
            // this.listeners.splice(index, 1);
            // this.listenersLength--;
        }
    }
    return this;
};

EventDispatcher.prototype.removeEventListenerByCallback = function( callback ){
    for(var i = 0; i < this.listenersLength; i++){
        if (this.listeners[i].callback === callback) {
            // TODO: remove listener
            // this.listeners.splice(index, 1);
            // this.listenersLength--;
        }
    }
    return this;
};


EventDispatcher.prototype.fireEvent = function( context, event ){
    event = event || {};
    for(var i=0; i < this.listenersLength; i++) {
        if (this.listeners[i].context === context) {
            this.listeners[i].callback.call(this.listeners[i].observer, event);
        }
    }
    return this;
};

var Router = function (root) {
    this.super.constructor.call(this);

    this.routesLength = 0;
    this.routes = [];
    this.mode = !!(window.history.pushState) ? "history" : "hash";
    this.hash = "#!";
    this.root = root ? root.replace(/^\/?(.*?)\/?$/, "/$1/") : "/";

};
Router.prototype = new EventDispatcher;
Router.prototype.constructor = Router;
Router.prototype.super = EventDispatcher.prototype;


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


Router.prototype.add = function (controller, regExp) {
    this.routes[this.routesLength] = {
        controller: controller,
        route: regExp
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
            this.fireEvent("matchedRoute", {controller: this.routes[i].controller, route: this.routes[i].route, fragment: pFragment, match: match});
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




var LoaderModel = function () {
    console.log(this.super.constructor);
    this.super.constructor.call(this);

    var self = this;
    this.currentRoute = null;
    this.xhr = this.getXHR();


    this.xhr.onabort = function(event) {
        self.fireEvent("onAbort", {xhr: this, event: event, route: self.currentRoute});
    };

    this.xhr.onerror = function(event) {
        self.fireEvent("onError", {xhr: this, event: event, route: self.currentRoute});
    };

    this.xhr.onload = function(event) {
        self.fireEvent("onLoad", {xhr: this, event: event, route: self.currentRoute});
    };

    this.xhr.onloadend = function(event) {
        self.fireEvent("onLoadEnd", {xhr: this, event: event, route: self.currentRoute});
        self.checkComplete();
    };

    this.xhr.onloadstart = function(event) {
        self.fireEvent("onLoadStart", {xhr: this, event: event, route: self.currentRoute});
    };

    this.xhr.onprogress = function(event) {
        var percentComplete = 0;
        if (event.lengthComputable) {
            percentComplete = event.loaded / event.total;
        }
        self.fireEvent("onProgress", {xhr: this, perc: percentComplete, event: event, route: self.currentRoute});
    };

    this.xhr.onreadystatechange = function(event) {
        self.fireEvent("onReadyStateChange", {xhr: this, event: event, route: self.currentRoute});
    };

    this.xhr.ontimeout = function(event) {
        self.fireEvent("onTimeout", {xhr: this, event: event, route: self.currentRoute});
    };



};
//LoaderModel.prototype = new Model;
//LoaderModel.prototype.super = Model.prototype;



LoaderModel.prototype.getXHR = function() {
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
};



LoaderModel.prototype.load = function (route) {
    this.currentRoute = route;

    if (this.xhr && this.xhr.readyState != 0) {
        this.xhr.abort();
    }

    this.xhr.open("GET", this.currentRoute.fragment, true);
    this.xhr.send();
};


LoaderModel.prototype.checkComplete = function() {
    if (this.xhr.readyState == 4 && this.xhr.status == 200) {
        this.fireEvent("dataLoaded", {xhr: this.xhr, route: this.currentRoute});
    }
};

var Crawler = function (html) {
    this.__html__ = html;
    this.__cache__ = [];

    var varRegExp = /<!--\s+crawler:begin:(.*?)\s+-->/gi;
    var varMatch;

    while ((varMatch = varRegExp.exec(this.__html__)) != null) {

        var varName = varMatch[1];
        var blockRegExp = new RegExp("<!--\\s+crawler:end:"+varName+"\\s+-->", "i");
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

var Controller = function () {
    this.super.constructor.call(this);
};

Controller.prototype = new EventDispatcher;
Controller.prototype.constructor = Controller;
Controller.prototype.super = EventDispatcher.prototype;

Controller.prototype.onData = function (event) {
};

var Model = function () {
    console.log("Model class "),
    console.log(this.super.constructor),
    this.super.constructor.call(this);
};

Model.prototype = new EventDispatcher;
//Model.prototype.constructor = Model;
Model.prototype.super = EventDispatcher.prototype;

var View = function () {
    this.super.constructor.call(this);
};

View.prototype = new EventDispatcher;
View.prototype.constructor = View;
View.prototype.super = EventDispatcher.prototype;

var Controllers = function (app) {
    this.__app__ = app;
};


Controllers.prototype.add = function( id, fn, ext ){
    ext = ext || Controller;

    for (var attr in ext.prototype) { fn.prototype[attr] = ext.prototype[attr]; }
    fn.prototype.constructor = fn;
    fn.prototype.super = ext.prototype;
    fn.prototype.app = this.__app__;
    this[id] = new fn();
    return this[id];
};


var Models = function (app) {
    this.__app__ = app;
};


Models.prototype.add = function( id, fn, ext ){
    ext = ext || Model;

    //var inst = new ext;
    //for (var attr in inst) { fn.prototype[attr] = inst[attr]; }

    for (var attr in ext.prototype) { fn.prototype[attr] = ext.prototype[attr]; }
    fn.prototype.constructor = fn;
    fn.prototype.super = ext.prototype;
    fn.prototype.app = this.__app__;

    this[id] = new fn();

    return this[id];
};


var Views = function (app) {
    this.__app__ = app;
};


Views.prototype.add = function( id, fn, ext ){
    ext = ext || View;
    for (var attr in ext.prototype) { fn.prototype[attr] = ext.prototype[attr]; }
    fn.prototype.constructor = fn;
    fn.prototype.super = ext.prototype;
    fn.prototype.app = this.__app__;
    this[id] = new fn();
    return this[id];
};

var JsCrawler = function (rootUrl) {

    this.controllers = new Controllers(this);
    this.models = new Models(this);
    this.views = new Views(this);

    var loader = this.models.add("loader", LoaderModel);
    loader.addEventListener("dataLoaded", this, this.onDataLoaded);


    this.router = new Router(rootUrl);
    this.router.addEventListener("matchedRoute", this, this.onMatchedRoute);
    this.updateLinks();
};


//JsCrawler.prototype.setDataLoader = function(dataLoader) {
//    this.dataLoader = dataLoader;
//    this.dataLoader.addEventListener("dataLoaded", this, this.onDataLoaded);
//};
//
//
//JsCrawler.prototype.setViewLoader = function(viewLoader) {
//    this.viewLoader = viewLoader;
//    this.dataLoader.addEventListener("dataLoaded", this, this.onDataLoaded);
//};


JsCrawler.prototype.onMatchedRoute = function(event) {

    this.models.loader.load(event);
};

JsCrawler.prototype.onDataLoaded = function(event) {
    event.crawler = new Crawler(event.xhr.responseText);
    this.controllers[event.route.controller].onData(event);
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

