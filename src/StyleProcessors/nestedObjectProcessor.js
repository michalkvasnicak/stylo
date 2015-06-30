var helpers = require('../helpers');
var simpleObjectProcessor = require('./simpleObjectProcessor');

function transformStyleObject(style) {
    var properties = Object.keys(style);
    var property;
    var result = {};

    function moveMediaToParentRule(baseStyle) {

        if (style.hasOwnProperty(baseStyle)) {
            style[baseStyle][property] = style[property][baseStyle];
        } else {
            style[baseStyle] = {};
            style[baseStyle][property] = style[property][baseStyle];
        }
    }

    // extract all styling infos for media to styling info (something like flatten)
    // extracts @media { base: { font-size: 10px; } } to base: { @media: { font-size: 10px; } }
    while (property = properties.shift()) {
        if (property.indexOf('@media') === 0) {
            // parse media query for style definitions
            Object.keys(style[property]).forEach(moveMediaToParentRule);
        } else {
            result[property] = style[property];
        }
    }

    Object.keys(result).forEach(
        function transformSimpleObject(styling) {
            result[styling] = simpleObjectProcessor(result[styling]);
        }
    );

    return result;
}

module.exports = function nestedObjectProcessor(style, next) {
    var transformedStyles;

    if (!helpers.isObject(style) || helpers.isSimpleJavascriptObject(style)) {
        return next(style);
    }

    transformedStyles = transformStyleObject(style);

    return Object
        .keys(transformedStyles)
        .map(function transformToMultipleSyntax(styling) {
            return [styling, transformedStyles[styling]];
        });
};
