import {} from '../src/createElement';
import React from 'react';
import { expect } from 'chai';
import { stub } from 'sinon';
import StyleSheet from '../src/StyleSheet';

class ProvideContextComponent extends React.Component {
    getChildContext() {
        return { _styleSheetRegistry: this.props.registry };
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
        const styleSheet = new StyleSheet({});
        let rendered;

        class RootComponent extends ProvideContextComponent {
            render() {
                return (<TestComponent />);
            }
        }

        class TestComponent extends React.Component {
            render() { return (<div styles={styleSheet} />); }
        }

        let registry = stub({
            styleElement() {}
        });

        registry.styleElement.returns(<div className='cls_1'></div>);

        rendered = React.renderToStaticMarkup(
            <RootComponent registry={registry} />
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

        let registry = stub({
            styleElement() {}
        });

        registry.styleElement.returns(<div className='cls_1'></div>);

        let rendered = React.renderToStaticMarkup(
            <RootComponent registry={registry} />
        );

        expect(rendered).to.equal('<div></div>');

    });

});
