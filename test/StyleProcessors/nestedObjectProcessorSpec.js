import nestedObjectProcessor from '../../src/StyleProcessors/nestedObjectProcessor';
import { spy } from 'sinon';
import { expect } from 'chai';

describe('nestedObjectProcessor middleware', () => {

    it('processes only nested javascript objects (nested objects with Radium/React-Style/ReactNative stylesheet like syntax)', () => {
        const validObject = {
            base: {
                fontSize: '10px',
                ':hover': { color: '#fff' },
                '@media screen and (min-width > 700px)': {
                    fontSize: '20px',
                    '@keyframes resize': { '0%': { color: '#ccc'} }
                },
                '@keyframes resize': { '0%': { color: '#ccc'} }
            },
            test: {
                ':hover': { color: '#fff' }
            }
        };

        const nextProcessor = spy();
        const result = nestedObjectProcessor(validObject, nextProcessor);

        expect(nextProcessor.called).to.be.equal(false);
        expect(result).to.be.eql(
            [
                ['base', {
                    'default': { fontSize: '10px' },
                    ':hover': { color: '#fff' },
                    '@media screen and (min-width > 700px)': {
                        'default': { fontSize: '20px' },
                        '@keyframes resize': { '0%': { color: '#ccc'} }
                    },
                    '@keyframes resize': { '0%': { color: '#ccc'} }
                }],
                ['test', {
                    ':hover': { color: '#fff' }
                }]
            ]
        );
    });

    it('calls next middleware if does not match style as nested js object', () => {
        const nextProcessor = spy();

        nestedObjectProcessor('', nextProcessor);
        nestedObjectProcessor(0, nextProcessor);
        nestedObjectProcessor(null, nextProcessor);
        nestedObjectProcessor(false, nextProcessor);
        nestedObjectProcessor(undefined, nextProcessor);
        nestedObjectProcessor({
            fontSize: '10px',
            ':hover': { color: '#fff' },
            '@media screen and (min-width > 700px)': {
                fontSize: '20px',
                '@keyframes resize': { '0%': { color: '#ccc'} }
            },
            '@keyframes resize': { '0%': { color: '#ccc'} }
        }, nextProcessor); // nested style syntax

        nestedObjectProcessor({
            fontSize: '10px',
            ':hover': { color: '#fff' },
            '@media screen and (min-width > 700px)': {
                fontSize: '20px',
                '@keyframes resize': { '0%': { color: '#ccc'} }
            },
            '@keyframes resize': { '0%': { color: '#ccc'} }
        }, nextProcessor);

        expect(nextProcessor.callCount).to.be.equal(7);
    });

});
