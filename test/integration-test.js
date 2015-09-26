/* eslint react/no-multi-comp:0, no-unused-vars:0 */
import createElement from '../src/createElement';
import { expect } from 'chai';
import { spy } from 'sinon';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { StyleSheetRegistry, StyleSheet } from '../src';

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

describe('Integration test', () => {

    it('registers rules using insertRule API and keeps rules in collection', () => {
        const onRuleInsert = spy(function onRuleInsert(rule) {
            return rule;
        });

        const registry = new StyleSheetRegistry(onRuleInsert);

        const styleSheet = StyleSheet.create({
            fontSize: '10px',
            ':hover': {
                fontSize: '20px',
                color: '#000'
            }
        });

        const complexStyleSheet = StyleSheet.create({
            base: {
                background: '#000'
            },
            pom: {},
            test: {
                ':hover': {
                    color: '#ffffff'
                },
                '@media all': {
                    color: '#000'
                },
                '@keyframes resize': {
                    '10%': {
                        color: '#fff'
                    }
                }
            }
        });

        class DivParent extends React.Component {
            render() {
                return (
                    <div styles={styleSheet}>
                        <div styles={complexStyleSheet.base}></div>
                        <div styles={[styleSheet, null, complexStyleSheet, complexStyleSheet.base, false]}></div>
                        <div styles={[styleSheet, null, complexStyleSheet.test]}>Test bla bla</div>
                    </div>
                );
            }
        }

        DivParent.contextTypes = {
            '_styleSheetRegistry': React.PropTypes.object.isRequired
        };

        ReactDOM.renderToStaticMarkup(
            <ProvideContextComponent registry={registry}>
                <DivParent />
            </ProvideContextComponent>
        );

        expect(onRuleInsert.getCall(0).args[0]).to.be.equal('.cls_1{background:#000}');
        expect(onRuleInsert.getCall(1).args[0]).to.be.equal('.cls_2{font-size:10px}');
        expect(onRuleInsert.getCall(2).args[0]).to.be.equal('.cls_2:hover{font-size:20px;color:#000}');
        expect(onRuleInsert.getCall(3).args[0]).to.be.equal('.cls_3:hover{color:#ffffff}');
        expect(onRuleInsert.getCall(4).args[0]).to.be.equal('@media all{.cls_3{color:#000}}');
        expect(onRuleInsert.getCall(5).args[0]).to.be.equal('@keyframes resize{10%{color:#fff}}');
        expect(registry.toString()).to.be.equal(
            '.cls_1{background:#000}' + // first is complexStyleSheet.base
            '.cls_2{font-size:10px}.cls_2:hover{font-size:20px;color:#000}' +
            '.cls_3:hover{color:#ffffff}@media all{.cls_3{color:#000}}@keyframes resize{10%{color:#fff}}'
        );
    });

});
