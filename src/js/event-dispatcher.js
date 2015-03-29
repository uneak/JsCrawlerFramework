var EventDispatcher = classCreate({

    constructor: function () {
        this.listeners = [];
        this.listenersLength = 0;
    },

    addEventListener: function (context, observer, callback) {
        this.listeners[this.listenersLength] = {context: context, observer: observer, callback: callback};
        this.listenersLength++;
        return this;
    },

    removeEventListenerByObserver: function (observer) {
        for (var i = 0; i < this.listenersLength; i++) {
            if (this.listeners[i].observer === observer) {
                // TODO: remove listener
                // this.listeners.splice(index, 1);
                // this.listenersLength--;
            }
        }
        return this;
    },

    removeEventListenerByContext: function (context) {
        for (var i = 0; i < this.listenersLength; i++) {
            if (this.listeners[i].context === context) {
                // TODO: remove listener
                // this.listeners.splice(index, 1);
                // this.listenersLength--;
            }
        }
        return this;
    },

    removeEventListenerByCallback: function (callback) {
        for (var i = 0; i < this.listenersLength; i++) {
            if (this.listeners[i].callback === callback) {
                // TODO: remove listener
                // this.listeners.splice(index, 1);
                // this.listenersLength--;
            }
        }
        return this;
    },

    fireEvent: function (context, event) {
        event = event || {};
        for (var i = 0; i < this.listenersLength; i++) {
            if (this.listeners[i].context === context) {
                this.listeners[i].callback.call(this.listeners[i].observer, event);
            }
        }
        return this;
    }

});

