var LoaderModel = function () {
    console.log(this.super.constructor);
    this.super.constructor.call(this);

    var self = this;
    this.currentRoute = null;
    this.xhr = this.getXHR();


    this.xhr.onabort = function(event) {
        self.fireEvent("onAbort", {xhr: this, event: event, route: self.currentRoute});
    };

    this.xhr.onerror = function(event) {
        self.fireEvent("onError", {xhr: this, event: event, route: self.currentRoute});
    };

    this.xhr.onload = function(event) {
        self.fireEvent("onLoad", {xhr: this, event: event, route: self.currentRoute});
    };

    this.xhr.onloadend = function(event) {
        self.fireEvent("onLoadEnd", {xhr: this, event: event, route: self.currentRoute});
        self.checkComplete();
    };

    this.xhr.onloadstart = function(event) {
        self.fireEvent("onLoadStart", {xhr: this, event: event, route: self.currentRoute});
    };

    this.xhr.onprogress = function(event) {
        var percentComplete = 0;
        if (event.lengthComputable) {
            percentComplete = event.loaded / event.total;
        }
        self.fireEvent("onProgress", {xhr: this, perc: percentComplete, event: event, route: self.currentRoute});
    };

    this.xhr.onreadystatechange = function(event) {
        self.fireEvent("onReadyStateChange", {xhr: this, event: event, route: self.currentRoute});
    };

    this.xhr.ontimeout = function(event) {
        self.fireEvent("onTimeout", {xhr: this, event: event, route: self.currentRoute});
    };



};
//LoaderModel.prototype = new Model;
//LoaderModel.prototype.super = Model.prototype;



LoaderModel.prototype.getXHR = function() {
    if (window.XMLHttpRequest || window.ActiveXObject) {
        if (window.ActiveXObject) {
            try {
                return new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                return new ActiveXObject("Microsoft.XMLHTTP");
            }
        } else {
            return new XMLHttpRequest();
        }
    }
    return null;
};



LoaderModel.prototype.load = function (route) {
    this.currentRoute = route;

    if (this.xhr && this.xhr.readyState != 0) {
        this.xhr.abort();
    }

    this.xhr.open("GET", this.currentRoute.fragment, true);
    this.xhr.send();
};


LoaderModel.prototype.checkComplete = function() {
    if (this.xhr.readyState == 4 && this.xhr.status == 200) {
        this.fireEvent("dataLoaded", {xhr: this.xhr, route: this.currentRoute});
    }
};