var JsCrawler = function (rootUrl) {

    this.controllers = new Controllers(this);
    this.models = new Models(this);
    this.views = new Views(this);

    var loader = this.models.add("loader", LoaderModel);
    loader.addEventListener("dataLoaded", this, this.onDataLoaded);


    this.router = new Router(rootUrl);
    this.router.addEventListener("matchedRoute", this, this.onMatchedRoute);
    this.updateLinks();
};


//JsCrawler.prototype.setDataLoader = function(dataLoader) {
//    this.dataLoader = dataLoader;
//    this.dataLoader.addEventListener("dataLoaded", this, this.onDataLoaded);
//};
//
//
//JsCrawler.prototype.setViewLoader = function(viewLoader) {
//    this.viewLoader = viewLoader;
//    this.dataLoader.addEventListener("dataLoaded", this, this.onDataLoaded);
//};


JsCrawler.prototype.onMatchedRoute = function(event) {

    this.models.loader.load(event);
};

JsCrawler.prototype.onDataLoaded = function(event) {
    event.crawler = new Crawler(event.xhr.responseText);
    this.controllers[event.route.controller].onData(event);
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

