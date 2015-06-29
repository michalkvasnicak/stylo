# Stylo

[![Build Status](https://travis-ci.org/michalkvasnicak/stylo.svg?branch=master)](https://travis-ci.org/michalkvasnicak/stylo)

Stylo is painless approach for styling [React](https://facebook.github.io/react/) components.

It can be used with syntax similar to `StyleSheet.create` from [React Native](http://facebook.github.io/react-native/docs/stylesheet.html#content) or [Radium](https://github.com/FormidableLabs/radium)/[React-Style](https://github.com/js-next/react-style) syntax.

Stylo works server and client side. You just need to render `StyleSheetRegistry` to string on server and `dehydrate/rehydrate` it see Usage.

**This library is experimental and it not tested in production!! Use on your own risk! Pull requests are welcome**

## Features

* **Native CSS styling (no inline styles or javscript handlers for :hover, ...!)**: used styles are transformed to CSS and injected to Stylesheet in browser or can be turned to string on server side.
* **Can be used with existing CSS**: CSS classes are prepended to existing class names of component
* **CSS transformation can be implemented**: you can autoprefix or do whatever you want with generated CSS rules, just use `new StyleSheetRegistry(function(ruleString) { return ruleString; })`, it will be called before rule is inserted.

## Installation

`npm install stylo`

## Usage

First we need to make our application wrapper component to pass `StyleSheetRegistry` to child context. To make this possible, you can use `StyloWrapperMixin`.

```js
var Stylo = require("stylo");
var React = require("react");
var App = require("./app"); // your root app component
var serialize = require("serialize-javascript");

var Wrapper = React.createClass({
    mixins: [Stylo.StyloWrapperMixin],
    
    render: function() {
        return (<App />);
    }
});

// server.js

var registry = new Stylo.StyleSheetRegistry; // this should be created on every request! so every request has isolated styles
var renderedApp = React.renderToString(<Wrapper registry={registry} />);

// this needs to be done, so registry can generate right css classes, etc
// it has to be called after app is rendered but before static markup is rendered otherwise registry will be empty
var state = "window.__serializedRegistryState = " + serialize(registry.dehydrate) + ";";

React.renderToStaticMarkup(
    <html>
        <head>
            <style dangerouslySetInnerHTML={{ __html: registry.toString() }} />
        </head>
        <body>
            <div id="content" dangerouslySetInnerHTML={{ __html: renderedApp }} />
            <script dangerouslySetInnerHTML={{ __html: state }}></script>
            <script> load your app js </script>
        </body>
    </html>
);

// app.js

var Stylo = require("stylo");
var React = require("react");
var AppComponent = require("./AppComponent");

var Wrapper = React.createClass({
    mixins: [Stylo.StyloWrapperMixin],
    
    render: function() {
        return (<AppComponent />);
    }
});

var dehydratedState = window.__serializedRegistryState;
var registry = new Stylo.StyleSheetRegistry;

// rehydrate registry
registry.rehydrate(dehydratedState);

React.render(<Wrapper registry={registry} />, document.getElementById("content"));
```

### With syntax similar to [React Native](http://facebook.github.io/react-native/docs/stylesheet.html#content)

```js
var React = require("react");
var StyleSheet = require("stylo").StyleSheet;

var styles = StyleSheet.create({
    base: {
        fontSize: "10px",
        
        ":hover": {
            fontSize: "20px"
        },
        
        "@keyframes resize": {
            "10%": { /* ... */}
        }
    },
    another: {
        color: #000
    },
    
    "@media screen": {
        base: {
            fontSize: "20px"
        }
    }
});

module.exports = React.createClass({
    render: function() {
        return (
            <div styles={styles.base}>
                <div styles={[styles.base, styles.another]}>dynamic styles</div>
                <div styles={[styles.another, false, styles.base, {}]}>
                    uses only styles.another and styles.base
                </div>
            </div>
        );
    }
});
```

### With simple javascript objects (no nested styles)

```js
var React = require("react");
var StyleSheet = require("stylo").StyleSheet;

var styles = StyleSheet.create({
    fontSize: "10px",
    ":hover": {
        fontSize: "20px"
    }
});

module.exports = React.createClass({
    render: function() {
        return (
            <div styles={styles}>
                <div styles={[styles, styles2]}>dynamic styles</div>
                <div styles={[styles, false, styles2, {}]}>
                    uses only styles and styles2
                </div>
            </div>
        );
    }
});
```

## Contributing

Thanks for your interest! Pull requests are welcome but provide tests for them please.

This library is experimental and tests are not exhaustive enough to uncover all bugs.
 
## TODO

* pass simple javascript objects directly to inline styles?
* gh-pages
* creating stylesheet from LESS syntax ?
* creating stylesheet from CSS syntax
* add build (now it is just part of workflow, so it is build by application which is using it)
* eslint
