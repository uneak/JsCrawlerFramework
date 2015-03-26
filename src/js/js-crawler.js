var JsCrawler = function (rootUrl) {
    var self = this;

    this.router = new Router(rootUrl);
    this.router.onChange = function(match, controller) {
        console.log(self);
        console.log(match);

        controller.apply({}, match);
    };


    this.xhr = this.getXHR();

    this.xhr.onreadystatechange = function() {
        if (this.xhr.readyState == 4 && this.xhr.status == 200) {
            console.log(this.xhr.responseText);
        }
    };

    this.updateLinks();
};


JsCrawler.prototype.updateLinks = function(root) {

        root = root || document.body;
        var self = this;

        if (!hasClass(root, "external") && root.tagName.toUpperCase() === "A") {
            if (root.getAttribute("href")) {
                if (!isExternal(root.getAttribute("href"))) {
                    root.onclick = function(event) {
                        event.preventDefault();
                        self.router.navigate(event.target.getAttribute("href"));
                    };
                }
            }
        }

        var children = root.children;
        for (var i = children.length; i--;) {
            this.updateLinks(children[i]);
        }

};


JsCrawler.prototype.getXHR = function() {
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

    alert("Votre navigateur ne supporte pas l'objet XMLHTTPRequest...");
    return null;
};

