var MvcElement = classCreate({

    talk : function(context, event) {
        this.mvc.talk(this._id + "." + context, event);
    }

});