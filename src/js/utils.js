var classCreate = function (prototype) {

    var jsClass = (prototype.hasOwnProperty("constructor")) ? prototype["constructor"] : function () {};
    for (var attr in prototype) {
        jsClass.prototype[attr] = prototype[attr];
    }

    return jsClass;
}

var classExtends = function (extend, prototype) {

    var jsClass = (prototype.hasOwnProperty("constructor")) ? prototype["constructor"] : function () {};
    jsClass.prototype = new extend;
    for (var attr in prototype) {
        jsClass.prototype[attr] = prototype[attr];
    }

    return jsClass;
}



var isExternal = function (url) {
    var match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
    if (typeof match[1] === "string" && match[1].length > 0 && match[1].toLowerCase() !== location.protocol) {
        return true;
    }
    if (typeof match[2] === "string" && match[2].length > 0 && match[2].replace(new RegExp(":(" + {
            "http:": 80,
            "https:": 443
        }[location.protocol] + ")?$"), "") !== location.host) {
        return true;
    }
    return false;
};

var hasClass = function (ele, cls) {
    return ele.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"));
};

var addClass = function (ele, cls) {
    if (!this.hasClass(ele, cls)) {
        ele.className += " " + cls;
    }
};

var removeClass = function (ele, cls) {
    if (this.hasClass(ele, cls)) {
        var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
        ele.className = ele.className.replace(reg, " ");
    }
};

var getElementByClass = function (ele, cls) {
    if (!ele) {
        return null;
    }
    var cls_string = new RegExp("(\\s|^)" + cls + "(\\s|$)");
    var nb = ele.children.length - 1;
    for (var k = nb; k >= 0; k--) {
        if (ele.children[k].className.match(cls_string)) {
            return ele.children[k];
        }
    }
    return null;
};