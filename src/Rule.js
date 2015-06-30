/**
 * CSS rule definition
 *
 * @param {string} pseudoSelector
 * @param {Object.<string, string>} style
 * @constructor
 */
function Rule(pseudoSelector, style) {
    if (typeof pseudoSelector === 'object') {
        this.style = pseudoSelector;
        this.pseudoSelector = 'default';
    } else {
        this.pseudoSelector = pseudoSelector || 'default';
        this.style = style;
    }

    this.pseudoSelector = (this.pseudoSelector !== 'default') ? pseudoSelector : '';
    this.style = this.style || {};
    this._cachedRule = null;
}

/**
 * Returns CSS rule definition
 *
 * @param {string} identifier
 * @returns {string}
 */
Rule.prototype.toString = function toString(identifier) {
    var propertyNames;
    var properties;

    if (this._cachedRule !== null) {
        return this._cachedRule;
    }

    propertyNames = Object.keys(this.style);

    properties = propertyNames.map(function convertCamelCaseToSnakeCase(property) {
        var value = this.style[property];

        var transformedProperty = property.replace(/[A-Z]/g, function lowerCaseAndPrefixChar(char) { return '-' + char.toLowerCase(); });

        return transformedProperty + ':' + value;
    }.bind(this));


    this._cachedRule = identifier + this.pseudoSelector + '{' + properties.join(';') + '}';

    return this._cachedRule;
};

module.exports = Rule;
