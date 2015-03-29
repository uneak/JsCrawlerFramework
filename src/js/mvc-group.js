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

