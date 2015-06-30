import { default as _jsdom } from 'jsdom';

export default function jsdom(source) {
    const document = _jsdom.jsdom(source || '<!doctype html><html><head></head><body></body></html>');

    return {
        document: document,
        window: document.parentWindow
    };
}
