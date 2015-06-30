import simpleObjectProcessor from '../../src/StyleProcessors/simpleObjectProcessor';
import { spy } from 'sinon';
import { expect } from 'chai';

describe('simpleObjectProcessor middleware', () => {

    it('processes only simple javascript objects (No nesting, defined only as one style as Radium/React-Style/ReactNative stylesheet like syntax)', () => {
        const validObject = {
            fontSize: '10px',
            ':hover': { color: '#fff' },
            '@media screen and (min-width > 700px)': {
                fontSize: '20px',
                '@keyframes resize': { '0%': { color: '#ccc'} }
            },
            '@keyframes resize': { '0%': { color: '#ccc'} }
        };

        const nextProcessor = spy();
        const result = simpleObjectProcessor(validObject, nextProcessor);

        expect(nextProcessor.called).to.be.equal(false);
        expect(result).to.be.eql({
            'default': { fontSize: '10px' },
            ':hover': { color: '#fff' },
            '@media screen and (min-width > 700px)': {
                'default': { fontSize: '20px' },
                '@keyframes resize': { '0%': { color: '#ccc'} }
            },
            '@keyframes resize': { '0%': { color: '#ccc'} }
        });
    });

    it('calls next middleware if does not match style as simple js object', () => {
        const nextProcessor = spy();

        simpleObjectProcessor('', nextProcessor);
        simpleObjectProcessor(0, nextProcessor);
        simpleObjectProcessor(null, nextProcessor);
        simpleObjectProcessor(false, nextProcessor);
        simpleObjectProcessor(undefined, nextProcessor);
        simpleObjectProcessor({
            base: {},
            '@media screen and (min-width > 700px)': {
                base: {}
            }
        }, nextProcessor); // nested style syntax
        simpleObjectProcessor({
            '@media screen and (min-width > 700px)': {
                base: {}
            }
        }, nextProcessor);

        expect(nextProcessor.callCount).to.be.equal(7);
    });

});
