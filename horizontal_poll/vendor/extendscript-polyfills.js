if (!Object.keys) {
    Object.keys = function (obj) {
        var keys = [];
        var prop;

        for (prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                keys.push(prop);
            }
        }

        return keys;
    };
}

if (!Array.isArray) {
    Array.isArray = function (value) {
        return value instanceof Array;
    };
}

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (callback, thisArg) {
        var i;

        if (typeof callback !== "function") {
            throw new TypeError("callback must be a function");
        }

        for (i = 0; i < this.length; i++) {
            if (i in this) {
                callback.call(thisArg, this[i], i, this);
            }
        }
    };
}

if (!Array.prototype.map) {
    Array.prototype.map = function (callback, thisArg) {
        var result = [];
        var i;

        if (typeof callback !== "function") {
            throw new TypeError("callback must be a function");
        }

        for (i = 0; i < this.length; i++) {
            if (i in this) {
                result[i] = callback.call(thisArg, this[i], i, this);
            }
        }

        return result;
    };
}
