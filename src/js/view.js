var View = function () {
    this.super.constructor.call(this);
};

View.prototype = new EventDispatcher;
View.prototype.constructor = View;
View.prototype.super = EventDispatcher.prototype;