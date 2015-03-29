var JsCrawler = classCreate({

    constructor: function () {

        this.controllers = new MvcGroup(this);
        this.models = new MvcGroup(this);
        this.views = new MvcGroup(this);


        //this.models.listen("loader.dataLoaded", this, this.onDataLoaded);
        //this.views.listen("router.matchedRoute", this, this.onMatchedRoute);

        this.updateLinks();
    },


    //onMatchedRoute: function (event) {
    //    this.models.call("loader.load", event);
    //},
    //
    //onDataLoaded: function (event) {
    //    event.crawler = new Crawler(event.xhr.responseText);
    //    this.controllers.call(event.route.controller, event);
    //},


    updateLinks: function (root) {

        root = root || document.body;
        var self = this;

        if (!hasClass(root, "external") && root.tagName.toUpperCase() === "A") {
            if (root.getAttribute("href")) {
                if (!isExternal(root.getAttribute("href"))) {
                    root.onclick = function (event) {
                        event.preventDefault();
                        self.views.call("router.navigate", event.target.getAttribute("href"));
                        //self.router.navigate(event.target.getAttribute("href"));
                    };
                }
            }
        }

        var children = root.children;
        for (var i = children.length; i--;) {
            this.updateLinks(children[i]);
        }

    }


});
