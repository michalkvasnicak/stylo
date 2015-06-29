var helpers = require("../helpers");

/**
 * Reformats style object to Stylo javascript object format
 *
 * @param {Object} style
 * @returns {{*}}
 */
function reformatStyle(style) {
    "use strict";

    // process javascript object to nested form
    // first find keyframes
    var result = {
    };

    var properties = Object.keys(style), property;

    while (property = properties.shift()) {
        // pseudo, just assign to result
        if (property[0] === ":") {
            result[property] = style[property];
        } else if (property.indexOf("@media") === 0) {
            result[property] = reformatStyle(style[property]);
        } else if (property.indexOf("@keyframes") === 0) {
            result[property] = style[property];
        } else {
            if (!result.hasOwnProperty("default")) {
                result.default = {};
            }

            result.default[property] = style[property];
        }
    }

    return result;
}

/**
 * Transforms simple Radium-like syntax for simple style to StyleSheet
 *
 * @param {Object} style
 * @param {Function} next
 * @returns {StyleSheet}
 */
module.exports = function(style, next) {
    "use strict";

    // detect if it is javascript object or if is simple javascript object
    // if not, call next middleware
    if (!helpers.isObject(style) || !helpers.isSimpleJavascriptObject(style)) {
        return next(style);
    }

    return reformatStyle(style); // returns simple object
};
