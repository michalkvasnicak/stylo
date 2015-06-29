var React = require("react");
var StyleSheetRegistry = require("./StyleSheetRegistry");

module.exports = {

    childContextTypes: {
        _styleSheetRegistry: React.PropTypes.instanceOf(StyleSheetRegistry).isRequired
    },

    propTypes: {
        registry: React.PropTypes.instanceOf(StyleSheetRegistry).isRequired
    },

    getChildContext: function() {
        "use strict";

        return {
            _styleSheetRegistry: this.props.registry
        }
    }
};
