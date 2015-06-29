var invariant = require("react/lib/invariant");

/**
 * CSS rule definition
 *
 * @param {string} pseudoSelector
 * @param {Object.<string, string>} style
 * @constructor
 */
function Rule(pseudoSelector, style) {
    "use strict";

    if (typeof pseudoSelector === "object") {
        style = pseudoSelector;
        pseudoSelector = "default";
    } else {
        pseudoSelector = pseudoSelector || "default";
    }

    this.pseudoSelector = (pseudoSelector !== "default") ? pseudoSelector : "";
    this.style = style || {};
    this._cachedRule = null;
}

/**
 * Returns CSS rule definition
 *
 * @param {string} identifier
 * @returns {string}
 */
Rule.prototype.toString = function(identifier) {
    "use strict";

    if (this._cachedRule !== null) {
        return this._cachedRule;
    }

    var propertyNames = Object.keys(this.style);

    var properties = propertyNames.map(function(property) {
        var value = this.style[property];
        property = property.replace(/[A-Z]/g, function(char) { return "-" + char.toLowerCase(); });

        return property + ":" + value;
    }.bind(this));


    return this._cachedRule = identifier + this.pseudoSelector + "{" + properties.join(";") + "}";
};

module.exports = Rule;
