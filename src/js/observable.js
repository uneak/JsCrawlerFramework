var Observable = function () {
    this.observers = new Observers();
}

Observable.prototype.addObserver = function( observer ){
    this.observers.add( observer );
    return this;
};

Observable.prototype.removeObserver = function( observer ){
    this.observers.removeAt( this.observers.indexOf( observer, 0 ) );
    return this;
};

Observable.prototype.notify = function( context ){
    var observerCount = this.observers.observersLength;
    for(var i=0; i < observerCount; i++){
        this.observers.get(i).update( context );
    }
    return this;
};