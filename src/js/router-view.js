
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