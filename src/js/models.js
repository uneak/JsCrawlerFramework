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
