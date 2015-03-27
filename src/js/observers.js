var Observers = function () {
    this.observers = [];
    this.observersLength = 0;
}

Observers.prototype.add = function (obj) {
    this.observers[this.observersLength] = obj
    this.observersLength++;
    return this;
};

Observers.prototype.get = function (index) {
    if (index > -1 && index < this.observersLength) {
        return this.observers[index];
    }
};

Observers.prototype.indexOf = function (obj, startIndex) {
    for(var i = startIndex; i < this.observersLength; i++){
        if (this.observers[i] === obj) {
            return i;
        }
    }
    return -1;
};

Observers.prototype.removeAt = function (index) {
    this.observers.splice(index, 1);
    this.observersLength--;
};