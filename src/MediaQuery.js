var Rule = require('./Rule');
var KeyFrames = require('./KeyFrames');
var isObject = require('./helpers').isObject;

/**
 * Media query rule definition
 *
 * @param {string} rule
 * @param {Object.<string, Object.<string, string>>} rules
 * @constructor
 */
function MediaQuery(rule, rules) {
    this.rule = rule;
    this.rules = Object.keys(rules || {}).map(
        function transformDefinitionsToRules(ruleDefinition) {
            if (!isObject(rules[ruleDefinition])) {
                throw Error(
                    'Rule `' + ruleDefinition + '` is invalid, object expected but ' + rules[ruleDefinition] + ' given'
                );
            }

            if (ruleDefinition[0] === '@') {
                if (ruleDefinition.indexOf('@keyframes ') > -1) {
                    return new KeyFrames(ruleDefinition, rules[ruleDefinition]);
                }

                throw Error('Only @keyframes can be nested in media queries');
            } else {
                return new Rule(ruleDefinition, rules[ruleDefinition]);
            }
        }
    );

    this._cachedRule = null;
}

/**
 * Returns CSS rule definition
 *
 * @param {string} identifier
 * @returns {string}
 */
MediaQuery.prototype.toString = function toString(identifier) {
    if (this._cachedRule !== null) {
        return this._cachedRule;
    }

    this._cachedRule = this.rule + '{' +
        this.rules.map(
            function convertRuleToString(rule) { return rule.toString(identifier); }
        ).join('') +
    '}';

    return this._cachedRule;
};

module.exports = MediaQuery;
