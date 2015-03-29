var LoaderModel = {

    _constructor: function () {

        var self = this;
        this.routeWatch = null;
        this.xhr = this.getXHR();


        this.xhr.onabort = function (event) {
            self.talk("onAbort."+self.routeWatch.id, {xhr: this, event: event, route: self.routeWatch});
        };

        this.xhr.onerror = function (event) {
            self.talk("onError."+self.routeWatch.id, {xhr: this, event: event, route: self.routeWatch});
        };

        this.xhr.onload = function (event) {
            self.talk("onLoad."+self.routeWatch.id, {xhr: this, event: event, route: self.routeWatch});
        };

        this.xhr.onloadend = function (event) {
            self.talk("onLoadEnd."+self.routeWatch.id, {xhr: this, event: event, route: self.routeWatch});
            self.checkComplete();
        };

        this.xhr.onloadstart = function (event) {
            self.talk("onLoadStart."+self.routeWatch.id, {xhr: this, event: event, route: self.routeWatch});
        };

        this.xhr.onprogress = function (event) {
            var percentComplete = 0;
            if (event.lengthComputable) {
                percentComplete = event.loaded / event.total;
            }
            self.talk("onProgress."+self.routeWatch.id, {xhr: this, perc: percentComplete, event: event, route: self.routeWatch});
        };

        this.xhr.onreadystatechange = function (event) {
            self.talk("onReadyStateChange."+self.routeWatch.id, {xhr: this, event: event, route: self.routeWatch});
        };

        this.xhr.ontimeout = function (event) {
            self.talk("onTimeout."+self.routeWatch.id, {xhr: this, event: event, route: self.routeWatch});
        };
    },

    getXHR: function () {
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
    },

    load: function (routeWatch) {

        if (this.routeWatch !== routeWatch) {

            if (this.xhr.readyState != 0) {
                this.xhr.abort();
            }

            this.routeWatch = routeWatch;

            this.xhr.open("GET", this.routeWatch.fragment, true);
            this.xhr.send();
        }

    },

    checkComplete: function () {
        if (this.xhr.readyState == 4 && this.xhr.status == 200) {
            this.talk("onDataLoaded."+this.routeWatch.id, {xhr: this.xhr, route: this.routeWatch});

        }
    }

};

