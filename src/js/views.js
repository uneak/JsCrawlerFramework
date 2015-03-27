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