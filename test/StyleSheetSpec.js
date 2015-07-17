import StyleSheet from '../src/StyleSheet';
import { expect } from 'chai';
import md5 from 'md5';

describe('StyleSheet', () => {

    describe('#create', () => {
        it('creates StyleSheet from object with Radium/React StyleSheet/React-Style like syntax', () => {
            const styleSheet = StyleSheet.create({
                fontSize: '10px',
                ':hover': {
                    fontSize: 20
                }
            });

            expect(styleSheet).to.be.instanceof(StyleSheet);
        });

        it('creates StyleSheet from nested styles with Radium/React StyleSheet/React-Style like syntax', () => {
            const styleSheet = StyleSheet.create({
                base: {
                    fontSize: '10px'
                },
                header: {
                    color: '#000'
                }
            });

            expect(styleSheet).to.be.an('object').and.have.property('base').with.instanceof(StyleSheet);
            expect(styleSheet).to.be.an('object').and.have.property('header').with.instanceof(StyleSheet);
        });
    });

    describe('#toMD5()', () => {

        it('lazy evaluates md5 hash for given styles', () => {
            const styleSheet = new StyleSheet({});

            expect(styleSheet.hashCode).to.equal(null);

            const hash = styleSheet.toMD5();

            expect(hash).to.equal(
                md5(
                    JSON.stringify({})
                )
            );

            expect(styleSheet.hashCode).to.equal(hash);
        });

        it('returns same hashes for same styles', () => {
            const styleSheet = new StyleSheet({ fontSize: '10px' });
            const styleSheet2 = new StyleSheet({ fontSize: '10px' });

            expect(styleSheet.toMD5()).to.equal(styleSheet2.toMD5());
        });

    });

    describe('#rules()', () => {

        it('returns basic rules', () => {
            const styleSheet = new StyleSheet({
                'default': { fontSize: '10px' },
                ':hover': { fontSize: '20px'},
                '@media all': {
                    'default': { fontSize: '10px' }
                },
                '@keyframes resize': {}
            });

            const rules = styleSheet.rules();

            expect(rules).to.be.a('array');
            expect(rules.length).to.be.equal(2);
        });

    });

    describe('#mediaQueries()', () => {

        it('returns media querie rules', () => {
            const styleSheet = new StyleSheet({
                'default': { fontSize: '10px' },
                ':hover': { fontSize: '20px'},
                '@media all': {
                    'default': { fontSize: '10px' }
                },
                '@keyframes resize': {}
            });

            const rules = styleSheet.mediaQueries();

            expect(rules).to.be.a('array');
            expect(rules.length).to.be.equal(1);
        });

    });

    describe('#keyframes()', () => {

        it('returns keyframes rules', () => {
            const styleSheet = new StyleSheet({
                'default': { fontSize: '10px' },
                ':hover': { fontSize: '20px'},
                '@media all': {
                    'default': { fontSize: '10px' }
                },
                '@keyframes resize': {}
            });

            const rules = styleSheet.keyFrames();

            expect(rules).to.be.a('array');
            expect(rules.length).to.be.equal(1);
        });

    });

});
