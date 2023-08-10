'use strict';
const script = document.createElement('script');
script.setAttribute('type', 'module');
script.setAttribute('src', chrome.runtime.getURL('/dist/scripts/bundle.js'));
const head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
head.insertBefore(script, head.lastChild);
