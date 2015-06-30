/**
 * Detects if given style is simple javascript object
 *
 * @param {Object} style
 * @returns {boolean}
 */
function isSimpleJavascriptObject(style) {
    var properties = Object.keys(style);
    var property;

    while (property = properties.shift()) {
        if (property[0] === '@') {
            // we need to check media query for the same!
            if (isSimpleJavascriptObject(style[property])) {
                return true;
            }
        } else {
            // if first property value is scalar or name contains : on start it is simple object (propably)
            if (property[0] === ':' || !isObject(style[property])) {
                return true;
            }
        }
    }

    return false;
}

function isObject(value) {
    return (typeof value === 'object' && value !== null);
}

module.exports = {
    isObject: isObject,
    isSimpleJavascriptObject: isSimpleJavascriptObject
};
