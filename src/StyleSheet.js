var md5 = require("MD5");
var Rule = require("./Rule");
var KeyFrames = require("./KeyFrames");
var MediaQuery = require("./MediaQuery");
var styleProcessors = require("./StyleProcessors");

/**
 * StyleSheet definition
 *
 * @param {Object.<string, Object.<string, string>>} rules
 * @constructor
 */
function StyleSheet(rules) {
    this.hashCode = null;
    this._rules = rules || {};

    this._cachedRules = null;
    this._cachedMediaQueries = null;
    this._cachedKeyFrames = null;
}

/**
 * Returns basic rules from style sheet (except media queries and key frames)
 *
 * @returns {Rule[]}
 */
StyleSheet.prototype.rules = function () {
    "use strict";

    // just everything that doesnt start with : or @ use as default style

    if (this._cachedRules !== null) {
        return this._cachedRules;
    }

    return this._cachedRules = Object
        .keys(this._rules)
        .filter(function(rule) { return rule[0] !== "@"; })
        .map(function(rule) {
            return new Rule(rule, this._rules[rule]);
        }.bind(this)
    );
};

/**
 * Returns media query rules from style sheet
 *
 * @returns {MediaQuery[]}
 */
StyleSheet.prototype.mediaQueries = function () {
    "use strict";

    if (this._cachedMediaQueries !== null) {
        return this._cachedMediaQueries;
    }

    return this._cachedMediaQueries = Object
        .keys(this._rules)
        .filter(function(rule) { return rule.substr(0, 6) === "@media"; })
        .map(function(rule) {
            return new MediaQuery(rule, this._rules[rule]);
        }.bind(this)
    );
};

/**
 * Returns key frames rules from style sheet
 *
 * @returns {KeyFrames[]}
 */
StyleSheet.prototype.keyFrames = function () {
    "use strict";

    if (this._cachedKeyFrames !== null) {
        return this._cachedKeyFrames;
    }

    return this._cachedKeyFrames = Object
        .keys(this._rules)
        .filter(function(rule) { return rule.substr(0, 10) === "@keyframes"; })
        .map(function(rule) {
            return new KeyFrames(rule, this._rules[rule]);
        }.bind(this)
    );
};

/**
 * Returns MD5 hash of stylesheet
 *
 * @returns {string}
 */
StyleSheet.prototype.toMD5 = function () {
    "use strict";

    // lazy evaluation
    if (this.hashCode === null) {
        return this.hashCode = md5(JSON.stringify(this._rules));
    }

    return this.hashCode;
};


// create style processing middleware chain
var processorMiddlewareChain = function() {
    "use strict";
    console.log("error middleware");
    throw Error("Invalid style syntax!");
};

Object.keys(styleProcessors).reverse().forEach(function(processorKey) {
    "use strict";

    processorMiddlewareChain = (function(processor, next) {
        return function(style) {
            return processor(style, next);
        };
    })(styleProcessors[processorKey], processorMiddlewareChain);
});

/**
 * Creates stylesheet from style object
 *
 * @param {string|Object.<string, Object.<string, *>} style
 *
 * @returns {StyleSheet|Object.<string, StyleSheet>}
 */
StyleSheet.create = function(style) {
    "use strict";

    // middleware chain
    var result = processorMiddlewareChain(style);

    // if result is array, then there are nested styles
    // just turn it to object of StyleSheet objects
    if (Array.isArray(result)) {
        var temp = {};

        result.forEach(function(style) {
            // first index is name of style, second is definition
            temp[style[0]] = new StyleSheet(style[1]);
        });

        return temp;
    }

    // otherwise it is propably simple object so return only one StyleSheet object
    return new StyleSheet(result);
};

module.exports = StyleSheet;
