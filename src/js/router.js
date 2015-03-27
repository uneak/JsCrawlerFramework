var Router = function (root) {
    this.super.constructor.call(this);

    this.routesLength = 0;
    this.routes = [];
    this.mode = !!(window.history.pushState) ? "history" : "hash";
    this.hash = "#!";
    this.root = root ? root.replace(/^\/?(.*?)\/?$/, "/$1/") : "/";


    this.onChange = null;
};
Router.prototype = new Observable;
Router.prototype.super = Observable.prototype;




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

            this.notify('matchRoute');

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