var Rule = require('./Rule');

/**
 * CSS keyframes rule definition
 *
 * @param {string} rule
 * @param {Object.<string, Object.<string, string>>} frames
 * @constructor
 */
function KeyFrames(rule, frames) {
    this.rule = rule;
    this.frames = Object.keys(frames).map(
        function transformToRules(selector) {
            return new Rule(selector, frames[selector]);
        }
    );

    this._cachedRule = null;
}

/**
 * Returns CSS rule definition
 *
 * @returns {string}
 */
KeyFrames.prototype.toString = function toString() {
    if (this._cachedRule !== null) {
        return this._cachedRule;
    }

    this._cachedRule = this.rule + '{' + this.frames.map(
            function transformRuleToString(rule) { return rule.toString(''); }
        ).join('') + '}';

    return this._cachedRule;
};

module.exports = KeyFrames;
