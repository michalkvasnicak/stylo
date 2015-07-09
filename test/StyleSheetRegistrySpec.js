import { expect } from 'chai';
import jsdom from './jsdom';
import StyleSheetRegistry from '../src/StyleSheetRegistry';
import StyleSheet from '../src/StyleSheet';
import { stub, spy } from 'sinon';
import React from 'react';

describe('StyleSheetRegistry', () => {

    describe('#styleElement()', () => {
        let registry;
        let insertRule;

        beforeEach(() => {
            registry = new StyleSheetRegistry();
            registry._insertRule = insertRule = spy();
        });

        it('skips element styling if element does not have styles prop and returns it', () => {
            const element = <div className='cls'></div>;

            const styledElement = registry.styleElement(element, {});

            expect(element).to.be.equal(styledElement);
        });

        describe('server side', () => {

            it('does not style element using non StyleSheet styles', () => {
                const element = <div></div>;
                let styledElement;

                styledElement = registry.styleElement(element, { className: 'cls', styles: false });

                expect(styledElement).to.not.equal(element);
                expect(styledElement.props).to.not.have.property('styles');
                expect(styledElement.props).to.have.property('className').that.is.equal('cls');

                styledElement = registry.styleElement(element, { className: 'cls', styles: [false, null, true, 10, 'pom', {}]});

                expect(styledElement).to.not.equal(element);
                expect(styledElement.props).to.not.have.property('styles');
                expect(styledElement.props).to.have.property('className').that.is.equal('cls');
            });

            it('styles element using StyleSheet styles', () => {
                let styleSheet = stub(new StyleSheet({}));
                let styleSheet2 = stub(new StyleSheet({ ':hover': { fontSize: '10px' }}));

                // restore to use original implementation
                styleSheet.toMD5.restore();
                styleSheet2.toMD5.restore();

                styleSheet.rules.returns([{ toString: () => '.cls_1{}'}]);
                styleSheet2.rules.returns([{ toString: () => '.cls_2{}'}]);
                styleSheet.mediaQueries.returns([]);
                styleSheet2.mediaQueries.returns([]);
                styleSheet.keyFrames.returns([]);
                styleSheet2.keyFrames.returns([]);

                const element = <div></div>;
                let styledElement;

                // one style
                styledElement = registry.styleElement(element, { className: 'cls', styles: styleSheet });

                expect(styledElement).to.not.equal(element);
                expect(styledElement.props).to.not.have.property('styles');
                expect(styledElement.props).to.have.property('className').that.is.equal('cls_1 cls');

                expect(insertRule.getCall(0).args[0]).to.be.eq('.cls_1{}');
                expect(insertRule.callCount).to.be.eq(1);

                // multiple styles
                styledElement = registry.styleElement(element, { className: 'cls', styles: [styleSheet, null, styleSheet2, 10, 'pom', {}]});

                expect(styledElement).to.not.equal(element);
                expect(styledElement.props).to.not.have.property('styles');
                expect(styledElement.props).to.have.property('className').that.is.equal('cls_1 cls_2 cls');

                // cls_1 is not called because it is already registered
                expect(insertRule.getCall(1).args[0]).to.be.eq('.cls_2{}');

                // duplicated styles
                styledElement = registry.styleElement(element, { className: 'cls', styles: [styleSheet, styleSheet, styleSheet2, 10, 'pom', {}]});

                expect(styledElement).to.not.equal(element);
                expect(styledElement.props).to.not.have.property('styles');
                expect(styledElement.props).to.have.property('className').that.is.equal('cls_1 cls_2 cls');

                expect(insertRule.callCount).to.be.eq(2);
            });

        });

        describe('client side', () => {

            beforeEach(() => {
                const { window, document } = jsdom('<!doctype html><html><head><style id="style-sheet-registry"></style></head><body></body></html>');

                global.window = window;
                global.document = document;

                insertRule = global.document.querySelector('style').sheet.insertRule = spy();

                registry = new StyleSheetRegistry();
            });

            afterEach(() => {
                delete global.window;
                delete global.document;
            });

            it('styles element using StyleSheet styles', () => {
                let styleSheet = stub(new StyleSheet({}));
                let styleSheet2 = stub(new StyleSheet({ ':hover': { fontSize: '10px' }}));

                // restore to use original implementation
                styleSheet.toMD5.restore();
                styleSheet2.toMD5.restore();

                styleSheet.rules.returns([{ toString: () => '.cls_1{}'}]);
                styleSheet2.rules.returns([{ toString: () => '.cls_2{}'}]);
                styleSheet.mediaQueries.returns([]);
                styleSheet2.mediaQueries.returns([]);
                styleSheet.keyFrames.returns([]);
                styleSheet2.keyFrames.returns([]);

                const element = <div></div>;
                let styledElement;

                // one style
                styledElement = registry.styleElement(element, { className: 'cls', styles: styleSheet });

                expect(styledElement).to.not.equal(element);
                expect(styledElement.props).to.not.have.property('styles');
                expect(styledElement.props).to.have.property('className').that.is.equal('cls_1 cls');

                expect(insertRule.getCall(0).args[0]).to.be.eq('.cls_1{}');
                expect(insertRule.getCall(0).args[1]).to.be.eq(0);
                expect(insertRule.callCount).to.be.eq(1);

                // multiple styles
                styledElement = registry.styleElement(element, { className: 'cls', styles: [styleSheet, null, styleSheet2, 10, 'pom', {}]});

                expect(styledElement).to.not.equal(element);
                expect(styledElement.props).to.not.have.property('styles');
                expect(styledElement.props).to.have.property('className').that.is.equal('cls_1 cls_2 cls');

                // cls_1 is not called because it is already registered
                expect(insertRule.getCall(1).args[0]).to.be.eq('.cls_2{}');
                expect(insertRule.getCall(1).args[1]).to.be.eq(1);

                // duplicated styles
                styledElement = registry.styleElement(element, { className: 'cls', styles: [styleSheet, styleSheet, styleSheet2, 10, 'pom', {}]});

                expect(styledElement).to.not.equal(element);
                expect(styledElement.props).to.not.have.property('styles');
                expect(styledElement.props).to.have.property('className').that.is.equal('cls_1 cls_2 cls');

                expect(insertRule.callCount).to.be.eq(2);
            });


        });

    });

    describe('#dehydrate()', () => {
        it('dehydrates internal state to simple JS object', () => {
            const registry = new StyleSheetRegistry();

            let styleSheet = stub(new StyleSheet({ 'default': { color: '#000', padding: '10px' }}));
            let styleSheet2 = stub(new StyleSheet({ ':hover': { fontSize: '10px' }}));

            // restore to use original implementation
            styleSheet.toMD5.restore();
            styleSheet2.toMD5.restore();

            styleSheet.rules.returns([{ toString: () => '.cls_1{color:#000;padding:10px}'}]);
            styleSheet2.rules.returns([{ toString: () => '.cls_2:hover{font-size:10px}'}]);
            styleSheet.mediaQueries.returns([{ toString: () => '@media all{.cls_1{color:#fff}}'}]);
            styleSheet2.mediaQueries.returns([]);
            styleSheet.keyFrames.returns([{ toString: () => '@keyframes resize{10%{color:#ff0000}}'}]);
            styleSheet2.keyFrames.returns([]);

            registry.styleElement(<div></div>, { className: 'cls', styles: [styleSheet, null, styleSheet2, 10, 'pom', {}]});

            const state = registry.dehydrate();

            expect(state).to.be.an('object');
            expect(state).to.have.property('count').that.is.equal(2);
            expect(state).to.have.property('registered').that.is.an('object');
            expect(Object.keys(state.registered)).to.have.property('length').that.is.equal(2);
            expect(state).to.have.property('rules').that.is.an('array').with.property('length').that.is.equal(4);
        });
    });

    describe('#rehydrate()', () => {
        it('rehydrates internal state from simple JS object', () => {
            const registry = new StyleSheetRegistry();

            let styleSheet2 = stub(new StyleSheet({ ':hover': { fontSize: '10px' }}));
            styleSheet2.toMD5.restore();

            styleSheet2.rules.returns([{ toString: () => '.cls_2:hover{font-size:10px}'}]);
            styleSheet2.mediaQueries.returns([]);
            styleSheet2.keyFrames.returns([]);

            registry.rehydrate({
                count: 2,
                registered: { hash: 'cls_1', hash2: 'cls_2' },
                rules: ['.cls_1{color:#000;padding:10px}', '.cls_2:hover{font-size:10px}']
            });

            expect(registry).to.have.property('count').that.is.equal(2);
            expect(registry).to.have.property('registered').that.is.an('object');
            expect(registry).to.have.property('rules').that.is.an('array').with.property('length').that.is.equal(2);

            registry.styleElement(<div></div>, { className: 'cls', styles: styleSheet2});

            expect(registry.count).to.be.equal(3);
            expect(registry.rules.length).to.be.equal(3);
        });
    });

    describe('#toString()', () => {

        it('returns CSS ruleset', () => {
            const registry = new StyleSheetRegistry();

            let styleSheet = stub(new StyleSheet({ 'default': { color: '#000', padding: '10px' }}));
            let styleSheet2 = stub(new StyleSheet({ ':hover': { fontSize: '10px' }}));

            // restore to use original implementation
            styleSheet.toMD5.restore();
            styleSheet2.toMD5.restore();

            styleSheet.rules.returns([{ toString: () => '.cls_1{color:#000;padding:10px}'}]);
            styleSheet2.rules.returns([{ toString: () => '.cls_2:hover{font-size:10px}'}]);
            styleSheet.mediaQueries.returns([]);
            styleSheet2.mediaQueries.returns([]);
            styleSheet.keyFrames.returns([]);
            styleSheet2.keyFrames.returns([]);

            registry.styleElement(<div></div>, { className: 'cls', styles: [styleSheet, null, styleSheet2, 10, 'pom', {}]});

            expect(registry.toString()).to.be.equal(
                '.cls_1{color:#000;padding:10px}.cls_2:hover{font-size:10px}'
            );
        });

    });

});
