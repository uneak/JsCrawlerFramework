var Controller = function () {
    this.super.constructor.call(this);
};

Controller.prototype = new EventDispatcher;
Controller.prototype.constructor = Controller;
Controller.prototype.super = EventDispatcher.prototype;

Controller.prototype.onData = function (event) {
};