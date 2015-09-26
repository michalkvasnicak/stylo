/* eslint react/no-multi-comp:0, no-unused-vars:0 */
import createElement from '../src/createElement';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { expect } from 'chai';
import { stub } from 'sinon';
import StyleSheet from '../src/StyleSheet';
import StyleSheetRegistry from '../src/StyleSheetRegistry';

class ProvideContextComponent extends React.Component {
    getChildContext() {
        return { _styleSheetRegistry: this.props.registry };
    }

    render() {
        return this.props.children;
    }
}

ProvideContextComponent.childContextTypes = {
    _styleSheetRegistry: React.PropTypes.object.isRequired
};

ProvideContextComponent.propTypes = {
    registry: React.PropTypes.object.isRequired
};

describe('createElement', () => {

    it('styles element using StyleSheetRegistry', () => {
        const styleSheet = new StyleSheet();
        let rendered;

        class TestComponent extends React.Component {
            render() {
                return (<div styles={styleSheet} />);
            }
        }

        const registry = stub({
            styleElement() {}
        });

        registry.styleElement.returns(<div className="cls_1"></div>);

        rendered = React.renderToStaticMarkup(
            <ProvideContextComponent registry={registry}>
                <TestComponent />
            </ProvideContextComponent>
        );

        expect(rendered).to.equal('<div class="cls_1"></div>');
    });

    it('does not style element using StyleSheetRegistry if element does not have styles', () => {
        class RootComponent extends ProvideContextComponent {
            render() {
                return (<TestComponent />);
            }
        }

        class TestComponent extends React.Component {
            render() { return (<div />); }
        }

        const registry = stub({
            styleElement() {}
        });

        registry.styleElement.returns(<div className="cls_1"></div>);

        const rendered = ReactDOM.renderToStaticMarkup(
            <RootComponent registry={registry} />
        );

        expect(rendered).to.equal('<div></div>');
    });

});
