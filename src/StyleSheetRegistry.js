var ReactElement = require('react/lib/ReactElement');
var React = require('react');
var StyleSheet = require('./StyleSheet');

/**
 * StyleSheet registry
 *
 * Collecting style sheets and inserting rules in browser
 *
 * @param {Function} onRuleInsert       can be used to transform CSS
 * @constructor
 */
function StyleSheetRegistry(onRuleInsert) {
    var head;
    var style;
    var canUseDOM = !!(
        typeof window !== 'undefined' &&
        window.document &&
        window.document.createElement
    );

    /**
     * Number of registered styles
     *
     * Used for generating unique class names
     */
    this.count = 0;

    /**
     * Index of next rule
     *
     * @type {number}
     */
    this.ruleIndex = 0;

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
    this._insertRule = function insertRule(/* rule */) {
    };

    /**
     * This is called before rule is inserted (applied in browser)
     *
     * Can be used for CSS rule transformation (autoprefixer, ...)
     *
     * @type {Function}
     * @param {string} rule
     * @returns {string}
     */
    this.onRuleInsert = onRuleInsert || function _onRuleInsert(rule) {
        return rule;
    };

    // find style element and if does not exist, create one
    // keep reference to insertRule method
    // but just only in DOM!!
    if (canUseDOM) {
        head = document.querySelector('head');
        style = head.querySelector('#style-sheet-registry');

        if (!style) {
            style = document.createElement('style');
            style.id = 'style-sheet-registry';
            style.type = 'text/css';
            style.appendChild(document.createTextNode(''));

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
StyleSheetRegistry.prototype.styleElement = function styleElement(element, props) {
    var classNames = [];
    var className;

    if (!(props || {}).hasOwnProperty('styles')) {
        return element;
    }

    // if styles is array, traverse and register only objects
    if (Array.isArray(props.styles)) {
        props.styles.forEach(
            function registerStylesAndSetClassNames(style) {
                // if style is not instance of StyleSheet, skip
                // todo if is simple object (not instance of StyleSheet), use as inline style?
                if (!(style instanceof StyleSheet)) {
                    return;
                }

                className = this._registerStyleAndReturnClassName(style);

                // register only one instance of same style sheet
                if (classNames.indexOf(className) === -1) {
                    classNames.push(
                        className
                    );
                }
            }.bind(this)
        );
    } else if (props.styles instanceof StyleSheet) {
        classNames.push(
            this._registerStyleAndReturnClassName(props.styles)
        );
    }

    delete props.styles;

    if (classNames.length) {
        // set styles before classNames if are defined
        if (props.hasOwnProperty('className') && props.className.length) {
            props.className = classNames.join(' ') + ' ' + props.className;
        } else {
            props.className = classNames.join(' ');
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
StyleSheetRegistry.prototype._registerStyleAndReturnClassName = function _registerStyleAndReturnClassName(styleSheet) {
    var styleHash = styleSheet.toMD5();
    var classSelector;
    var className;

    if (this.registered.hasOwnProperty(styleHash)) {
        return this.registered[styleHash];
    }

    classSelector = '.cls_' + (++this.count);
    className = classSelector.substr(1);

    this.registered[styleHash] = className;

    // register and transform default rules
    styleSheet
        .rules()
        .map(function transformRule(rule) {
            return this.onRuleInsert(rule.toString(classSelector));
        }.bind(this))
        .forEach(function insertRule(rule) {
            this._insertRule(rule, this.ruleIndex++);
            this.rules.push(rule);
        }.bind(this));

    // transform and register media queries
    styleSheet
        .mediaQueries()
        .map(function transformRule(mediaQuery) {
            return this.onRuleInsert(mediaQuery.toString(classSelector));
        }.bind(this))
        .forEach(function insertRule(rule) {
            this._insertRule(rule, this.ruleIndex++);
            this.rules.push(rule);
        }.bind(this));

    // transform and register key frames
    styleSheet
        .keyFrames()
        .map(function transformRule(keyFrame) {
            return this.onRuleInsert(keyFrame.toString());
        }.bind(this))
        .forEach(function insertRule(rule) {
            this._insertRule(rule, this.ruleIndex++);
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
StyleSheetRegistry.prototype.toString = function toString() {
    return this.rules.join('');
};

/**
 * Returns style element with registered rules
 *
 * @returns {ReactElement}
 */
StyleSheetRegistry.prototype.element = function createStyleSheetElement() {
    return React.createElement(
        'style',
        {
            id: 'style-sheet-registry',
            type: 'text/css',
            dangerouslySetInnerHTML: { __html: this.toString() }
        }
    );
};

/**
 * Returns simple JS object representation of internal state
 *
 * @returns {{count: number, ruleIndex: number, registered: Object.<string, string>, rules: string[]}}
 */
StyleSheetRegistry.prototype.dehydrate = function dehydrate() {
    return {
        count: this.count,
        ruleIndex: this.ruleIndex,
        registered: this.registered,
        rules: this.rules
    };
};

/**
 * Sets internal state to given state
 *
 * @param {{count: number, ruleIndex: number, registered: Object.<string, string>, rules: string[]}} state
 */
StyleSheetRegistry.prototype.rehydrate = function rehydrate(state) {
    this.count = state.count || 0;
    this.ruleIndex = state.ruleIndex || 0;
    this.registered = state.registered || {};
    this.rules = state.rules || [];
};

module.exports = StyleSheetRegistry;
