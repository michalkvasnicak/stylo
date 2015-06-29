var Rule = require("./Rule");

/**
 * CSS keyframes rule definition
 *
 * @param {string} rule
 * @param {Object.<string, Object.<string, string>>} frames
 * @constructor
 */
function KeyFrames(rule, frames) {
    "use strict";

    this.rule = rule;
    this.frames = Object.keys(frames).map(function(selector) {
        return new Rule(selector, frames[selector]);
    });

    this._cachedRule = null;
}

/**
 * Returns CSS rule definition
 *
 * @returns {string}
 */
KeyFrames.prototype.toString = function() {
    "use strict";

    if (this._cachedRule !== null) {
        return this._cachedRule;
    }

    return this._cachedRule = this.rule + "{" + this.frames.map(function(rule) { return rule.toString(""); }).join("") + "}";
};

module.exports = KeyFrames;
