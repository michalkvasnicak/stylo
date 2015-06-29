var ReactElement = require("react/lib/ReactElement");
var ReactContext = require("react/lib/ReactContext");
var object = require("react/lib/ReactPropTypes").object;
var StyleSheet = require("./StyleSheet");
var invariant = require("react/lib/invariant");

var originalCreateElement = ReactElement.createElement;
var registryContextKey = "_styleSheetRegistry";

ReactElement.createElement = function(type, props) {
    props = props || {};

    // call original so we have ReactContext populated with current context
    var createdElement = originalCreateElement.apply(this, arguments);

    // if props does not have styles defined, skip and return element
    if (!props.hasOwnProperty("styles")) {
        return createdElement;
    }

    var currentContext = ReactContext.current || {};

    // if style sheet registry is not defined on current context
    if (!currentContext.hasOwnProperty("_styleSheetRegistry")) {
        //todo show warning that registry is not defined on context
        return createdElement;
    }

    var registry = currentContext._styleSheetRegistry;

    return registry.styleElement(createdElement, props);
};
