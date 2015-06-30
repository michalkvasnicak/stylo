import KeyFrames from '../src/KeyFrames';
import { expect } from 'chai';

describe('KeyFrames', () => {

    describe('#toString()', () => {

        it('returns empty CSS keyframes rule if no rules are defined', () => {
            const frames = new KeyFrames('@keyframes resize', {});

            expect(frames.toString()).to.be.equal('@keyframes resize{}');
        });

        it('returns CSS keyframes rule from rules', () => {
            const frames = new KeyFrames('@keyframes resize', {
                '100%': {
                    fontSize: '10px',
                    color: '#000'
                },
                '0%': {
                    fontSize: '20px',
                    color: '#fff'
                }
            });

            expect(frames.toString()).to.be.equal(
                '@keyframes resize{100%{font-size:10px;color:#000}0%{font-size:20px;color:#fff}}'
            );
        });
    });

});
