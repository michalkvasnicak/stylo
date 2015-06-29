var ReactElement = require("react/lib/ReactElement");
var StyleSheet = require("./StyleSheet");

/**
 * StyleSheet registry
 *
 * Collecting style sheets and inserting rules in browser
 *
 * @param {Function} onRuleInsert       can be used to transform CSS
 * @constructor
 */
function StyleSheetRegistry(onRuleInsert) {
    "use strict";

    /**
     * Number of registered styles
     *
     * Used for generating unique class names
     */
    this.count = 0;

    /**
     * Map of md5 hash => css class name
     *
     * @type {Object.<string, string>}
     */
    this.registered = {};

    /**
     * Collection of rules
     *
     * @type {string[]}
     */
    this.rules = [];

    /**
     * Insert rule function
     *
     * Used for registering css rules (in browser it is actual CSSStyleSheet.insertRule method)
     *
     * @type {Function}
     * @param {string} rule
     */
    this._insertRule = function(rule) {};

    /**
     * This is called before rule is inserted (applied in browser)
     *
     * Can be used for CSS rule transformation (autoprefixer, ...)
     *
     * @type {Function}
     * @param {string} rule
     * @returns {string}
     */
    this.onRuleInsert = onRuleInsert || function(rule) {
        return rule;
    };

    const canUseDOM = !!(
        typeof window !== 'undefined' &&
        window.document &&
        window.document.createElement
    );

    // find style element and if does not exist, create one
    // keep reference to insertRule method
    // but just only in DOM!!
    if (canUseDOM) {
        const head = document.querySelector("head");
        let style = head.querySelector("style");

        if (!style) {
            style = document.createElement("style");
            style.type = "text/css";
            style.appendChild(document.createTextNode(""));

            head.appendChild(style);
        }

        // this is only because of illegal invocation, we have to bind it to original object
        this._insertRule = style.sheet.insertRule.bind(style.sheet);
    }
}

/**
 * Styles element and returns it
 *
 * @param {ReactElement} element
 * @param {{}} props
 *
 * @return {ReactElement}
 */
StyleSheetRegistry.prototype.styleElement = function(element, props) {
    "use strict";

    if (!(props || {}).hasOwnProperty("styles")) {
        return element;
    }

    var classNames = [];

    // if styles is array, traverse and register only objects
    if (Array.isArray(props.styles)) {
        props.styles.forEach((style) => {
            // if style is not instance of StyleSheet, skip
            //todo if is simple object (not instance of StyleSheet), use as inline style?
            if (!(style instanceof StyleSheet)) {
                return;
            }

            var className = this._registerStyleAndReturnClassName(style);

            // register only one instance of same style sheet
            if (classNames.indexOf(className) === -1) {
                classNames.push(
                    className
                );
            }
        });
    } else if (props.styles instanceof StyleSheet) {
        classNames.push(
            this._registerStyleAndReturnClassName(props.styles)
        );
    }

    delete props.styles;

    if (classNames.length) {
        // set styles before classNames if are defined
        if (props.hasOwnProperty("className") && props.className.length) {
            props.className = classNames.join(" ") + " " + props.className;
        } else {
            props.className = classNames.join(" ");
        }
    }

    // clone element with new props (because of className change)
    return ReactElement.cloneElement(
        element,
        props
    );
};

/**
 * Registers a stylesheet and returns a class name for style sheet
 *
 * @param {StyleSheet} styleSheet
 * @private
 *
 * @return {string}
 */
StyleSheetRegistry.prototype._registerStyleAndReturnClassName = function(styleSheet) {
    "use strict";

    var styleHash = styleSheet.toMD5();

    if (this.registered.hasOwnProperty(styleHash)) {
        return this.registered[styleHash];
    }

    var classSelector = ".cls_" + (++this.count);
    var className = classSelector.substr(1);

    this.registered[styleHash] = className;

    // register and transform default rules
    styleSheet
        .rules()
        .map(function(rule) { return this.onRuleInsert(rule.toString(classSelector)); }.bind(this))
        .forEach(function(rule) {
            this._insertRule(rule, 0);
            this.rules.push(rule);
        }.bind(this));

    // transform and register media queries
    styleSheet
        .mediaQueries()
        .map(function(mediaQuery) { return this.onRuleInsert(mediaQuery.toString(classSelector)); }.bind(this))
        .forEach(function(rule) {
            this._insertRule(rule, 0);
            this.rules.push(rule);
        }.bind(this));

    // transform and register key frames
    styleSheet
        .keyFrames()
        .map(function(keyFrame) { return this.onRuleInsert(keyFrame.toString()); }.bind(this))
        .forEach(function(rule) {
            this._insertRule(rule, 0);
            this.rules.push(rule);
        }.bind(this));

    // return class name
    return className;
};

/**
 * Returns CSS ruleset
 *
 * @returns {string}
 */
StyleSheetRegistry.prototype.toString = function() {
    "use strict";

    return this.rules.join("");
};

/**
 * Returns simple JS object representation of internal state
 *
 * @returns {{count: number, registered: Object.<string, string>, rules: string[]}}
 */
StyleSheetRegistry.prototype.dehydrate = function() {
    "use strict";

    return {
        count: this.count,
        registered: this.registered,
        rules: this.rules
    }
};

/**
 * Sets internal state to given state
 *
 * @param {{count: number, registered: Object.<string, string>, rules: string[]}} state
 */
StyleSheetRegistry.prototype.rehydrate = function(state) {
    "use strict";

    this.count = state.count || 0;
    this.registered = state.registered || {};
    this.rules = state.rules || [];
};

module.exports = StyleSheetRegistry;
