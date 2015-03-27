var Model = function () {
    console.log("Model class "),
    console.log(this.super.constructor),
    this.super.constructor.call(this);
};

Model.prototype = new EventDispatcher;
//Model.prototype.constructor = Model;
Model.prototype.super = EventDispatcher.prototype;