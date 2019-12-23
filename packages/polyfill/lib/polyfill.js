/*!
 * @pixi/polyfill - v5.2.0
 * Compiled Mon, 23 Dec 2019 12:37:54 UTC
 *
 * @pixi/polyfill is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var es6PromisePolyfill = require('es6-promise-polyfill');
var objectAssign = _interopDefault(require('object-assign'));

// Support for IE 9 - 11 which does not include Promises
if (!window.Promise)
{
    window.Promise = es6PromisePolyfill.Polyfill;
}

// References:

if (!Object.assign)
{
    Object.assign = objectAssign;
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

// References:
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// https://gist.github.com/1579671
// http://updates.html5rocks.com/2012/05/requestAnimationFrame-API-now-with-sub-millisecond-precision
// https://gist.github.com/timhall/4078614
// https://github.com/Financial-Times/polyfill-service/tree/master/polyfills/requestAnimationFrame

// Expected to be used with Browserfiy
// Browserify automatically detects the use of `global` and passes the
// correct reference of `global`, `self`, and finally `window`

var ONE_FRAME_TIME = 16;

// Date.now
if (!(Date.now && Date.prototype.getTime))
{
    Date.now = function now()
    {
        return new Date().getTime();
    };
}

// performance.now
if (!(commonjsGlobal.performance && commonjsGlobal.performance.now))
{
    var startTime = Date.now();

    if (!commonjsGlobal.performance)
    {
        commonjsGlobal.performance = {};
    }

    commonjsGlobal.performance.now = function () { return Date.now() - startTime; };
}

// requestAnimationFrame
var lastTime = Date.now();
var vendors = ['ms', 'moz', 'webkit', 'o'];

for (var x = 0; x < vendors.length && !commonjsGlobal.requestAnimationFrame; ++x)
{
    var p = vendors[x];

    commonjsGlobal.requestAnimationFrame = commonjsGlobal[(p + "RequestAnimationFrame")];
    commonjsGlobal.cancelAnimationFrame = commonjsGlobal[(p + "CancelAnimationFrame")] || commonjsGlobal[(p + "CancelRequestAnimationFrame")];
}

if (!commonjsGlobal.requestAnimationFrame)
{
    commonjsGlobal.requestAnimationFrame = function (callback) {
        if (typeof callback !== 'function')
        {
            throw new TypeError((callback + "is not a function"));
        }

        var currentTime = Date.now();
        var delay = ONE_FRAME_TIME + lastTime - currentTime;

        if (delay < 0)
        {
            delay = 0;
        }

        lastTime = currentTime;

        return setTimeout(function () {
            lastTime = Date.now();
            callback(performance.now());
        }, delay);
    };
}

if (!commonjsGlobal.cancelAnimationFrame)
{
    commonjsGlobal.cancelAnimationFrame = function (id) { return clearTimeout(id); };
}

// References:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign

if (!Math.sign)
{
    Math.sign = function mathSign(x)
    {
        x = Number(x);

        if (x === 0 || isNaN(x))
        {
            return x;
        }

        return x > 0 ? 1 : -1;
    };
}

// References:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger

if (!Number.isInteger)
{
    Number.isInteger = function numberIsInteger(value)
    {
        return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
    };
}

if (!window.ArrayBuffer)
{
    window.ArrayBuffer = Array;
}

if (!window.Float32Array)
{
    window.Float32Array = Array;
}

if (!window.Uint32Array)
{
    window.Uint32Array = Array;
}

if (!window.Uint16Array)
{
    window.Uint16Array = Array;
}

if (!window.Uint8Array)
{
    window.Uint8Array = Array;
}

if (!window.Int32Array)
{
    window.Int32Array = Array;
}
//# sourceMappingURL=polyfill.js.map
