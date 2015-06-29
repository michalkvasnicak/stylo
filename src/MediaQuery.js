var invariant = require("react/lib/invariant");
var Rule = require("./Rule");
var KeyFrames = require("./KeyFrames");

/**
 * Media query rule definition
 *
 * @param {string} rule
 * @param {Object.<string, Object.<string, string>>} rules
 * @constructor
 */
function MediaQuery(rule, rules) {
    "use strict";

    rules = rules || {};

    this.rule = rule;
    this.rules = Object.keys(rules).map(function(rule) {
        var ruleType = typeof rules[rule];

        invariant(
            (ruleType === "object" && rules[rule] !== null),
            "Rule `" + rule + "` is invalid, object expected but " + rules[rule] + " given"
        );

        if (rule[0] === "@") {
            if (rule.indexOf("@keyframes ") > -1) {
                return new KeyFrames(rule, rules[rule]);
            } else {
                invariant(false, "Only @keyframes can be nested in media queries");
            }
        } else {
            return new Rule(rule, rules[rule]);
        }
    }.bind(this));

    this._cachedRule = null;
}

/**
 * Returns CSS rule definition
 *
 * @param {string} identifier
 * @returns {string}
 */
MediaQuery.prototype.toString = function(identifier) {
    "use strict";

    if (this._cachedRule !== null) {
        return this._cachedRule;
    }

    return this._cachedRule = this.rule + "{" +
        this.rules.map(function(rule) { return rule.toString(identifier); }).join("") +
    "}";
};

module.exports = MediaQuery;
