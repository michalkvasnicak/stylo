var helpers = require("../helpers");
var simpleObjectProcessor = require("./simpleObjectProcessor");

function transformStyleObject(style) {
    "use strict";

    var properties = Object.keys(style), property, result = {};

    // extract all styling infos for media to styling info (something like flatten)
    // extracts @media { base: { font-size: 10px; } } to base: { @media: { font-size: 10px; } }
    while (property = properties.shift()) {
        if (property.indexOf("@media") === 0) {
            // parse media query for style definitions
            var _properties = Object.keys(style[property]);

            _properties.forEach(function(baseStyle) {

                if (style.hasOwnProperty(baseStyle)) {
                    style[baseStyle][property] = style[property][baseStyle];
                } else {
                    style[baseStyle] = {};
                    style[baseStyle][property] = style[property][baseStyle];
                }
            });
        } else {
            result[property] = style[property];
        }
    }

    Object.keys(result).forEach(function(styling) {
        result[styling] = simpleObjectProcessor(result[styling]);
    });

    return result;
}

module.exports = function(style, next) {
    "use strict";

    if (!helpers.isObject(style) || helpers.isSimpleJavascriptObject(style)) {
        return next(style);
    }

    var transformedStyles = transformStyleObject(style);

    return Object
        .keys(transformedStyles)
        .map(function(styling) {
            return [styling, transformedStyles[styling]];
        });
};
