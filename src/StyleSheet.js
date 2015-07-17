var md5 = require('md5');
var Rule = require('./Rule');
var KeyFrames = require('./KeyFrames');
var MediaQuery = require('./MediaQuery');
var styleProcessors = require('./StyleProcessors');

// create style processing middleware chain
var processorMiddlewareChain = function _processorMiddlewareChain() {
    throw Error('Invalid style syntax!');
};

Object.keys(styleProcessors).reverse().forEach(
    function middlewareWrapper(processorKey) {
        processorMiddlewareChain = (function wrapPreviousMiddleware(processor, next) {
            return function newMiddleware(style) {
                return processor(style, next);
            };
        })(styleProcessors[processorKey], processorMiddlewareChain);
    }
);

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
StyleSheet.prototype.rules = function rules() {
    // just everything that doesnt start with : or @ use as default style

    if (this._cachedRules !== null) {
        return this._cachedRules;
    }

    this._cachedRules = Object
        .keys(this._rules)
        .filter(function isBasicStyling(rule) { return rule[0] !== '@'; })
        .map(function transformToRule(rule) {
            return new Rule(rule, this._rules[rule]);
        }.bind(this)
    );

    return this._cachedRules;
};

/**
 * Returns media query rules from style sheet
 *
 * @returns {MediaQuery[]}
 */
StyleSheet.prototype.mediaQueries = function mediaQueries() {
    if (this._cachedMediaQueries !== null) {
        return this._cachedMediaQueries;
    }

    this._cachedMediaQueries = Object
        .keys(this._rules)
        .filter(function isMediaQuery(rule) { return rule.substr(0, 6) === '@media'; })
        .map(function transfromToMediaQueryRule(rule) {
            return new MediaQuery(rule, this._rules[rule]);
        }.bind(this)
    );

    return this._cachedMediaQueries;
};

/**
 * Returns key frames rules from style sheet
 *
 * @returns {KeyFrames[]}
 */
StyleSheet.prototype.keyFrames = function keyFrames() {
    if (this._cachedKeyFrames !== null) {
        return this._cachedKeyFrames;
    }

    this._cachedKeyFrames = Object
        .keys(this._rules)
        .filter(function isKeyframes(rule) { return rule.substr(0, 10) === '@keyframes'; })
        .map(function transformToKeyFramesRule(rule) {
            return new KeyFrames(rule, this._rules[rule]);
        }.bind(this)
    );

    return this._cachedKeyFrames;
};

/**
 * Returns MD5 hash of stylesheet
 *
 * @returns {string}
 */
StyleSheet.prototype.toMD5 = function toMD5() {
    // lazy evaluation
    if (this.hashCode === null) {
        this.hashCode = md5(JSON.stringify(this._rules));
    }

    return this.hashCode;
};

/**
 * Creates stylesheet from style object
 *
 * @param {string|Object.<string, Object.<string, *>} style
 *
 * @returns {StyleSheet|Object.<string, StyleSheet>}
 */
StyleSheet.create = function create(style) {
    // middleware chain
    var result = processorMiddlewareChain(style);
    var temp;

    // if result is array, then there are nested styles
    // just turn it to object of StyleSheet objects
    if (Array.isArray(result)) {
        temp = {};

        result.forEach(function formatArrayResult(_style) {
            // first index is name of style, second is definition
            temp[_style[0]] = new StyleSheet(_style[1]);
        });

        return temp;
    }

    // otherwise it is propably simple object so return only one StyleSheet object
    return new StyleSheet(result);
};

module.exports = StyleSheet;
