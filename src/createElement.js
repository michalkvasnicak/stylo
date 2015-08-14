var React = require('react');
var ReactContext = require('react/lib/ReactContext');

var originalCreateElement = React.createElement;

React.createElement = function createElement(type, props) {

    // call original so we have ReactContext populated with current context
    var createdElement = originalCreateElement.apply(this, arguments);
    var currentContext;
    var registry;

    // if props does not have styles defined, skip and return element
    if (!(props || {}).hasOwnProperty('styles')) {
        return createdElement;
    }

    currentContext = ReactContext.current || {};

    // if style sheet registry is not defined on current context
    if (!currentContext.hasOwnProperty('_styleSheetRegistry')) {
        // todo show warning that registry is not defined on context
        return createdElement;
    }

    registry = currentContext._styleSheetRegistry;

    return registry.styleElement(createdElement, props);
};
