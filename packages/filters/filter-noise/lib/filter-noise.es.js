/*!
 * @pixi/filter-noise - v5.2.0
 * Compiled Mon, 23 Dec 2019 12:37:54 UTC
 *
 * @pixi/filter-noise is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
import { Filter, defaultFilterVertex } from '@pixi/core';

var fragment = "precision highp float;\r\n\r\nvarying vec2 vTextureCoord;\r\nvarying vec4 vColor;\r\n\r\nuniform float uNoise;\r\nuniform float uSeed;\r\nuniform sampler2D uSampler;\r\n\r\nfloat rand(vec2 co)\r\n{\r\n    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\r\n}\r\n\r\nvoid main()\r\n{\r\n    vec4 color = texture2D(uSampler, vTextureCoord);\r\n    float randomValue = rand(gl_FragCoord.xy * uSeed);\r\n    float diff = (randomValue - 0.5) * uNoise;\r\n\r\n    // Un-premultiply alpha before applying the color matrix. See issue #3539.\r\n    if (color.a > 0.0) {\r\n        color.rgb /= color.a;\r\n    }\r\n\r\n    color.r += diff;\r\n    color.g += diff;\r\n    color.b += diff;\r\n\r\n    // Premultiply alpha again.\r\n    color.rgb *= color.a;\r\n\r\n    gl_FragColor = color;\r\n}\r\n";

/**
 * @author Vico @vicocotea
 * original filter: https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/noise.js
 */

/**
 * A Noise effect filter.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
var NoiseFilter = /*@__PURE__*/(function (Filter) {
    function NoiseFilter(noise, seed)
    {
        if ( noise === void 0 ) noise = 0.5;
        if ( seed === void 0 ) seed = Math.random();

        Filter.call(this, defaultFilterVertex, fragment, {
            uNoise: 0,
            uSeed: 0,
        });

        this.noise = noise;
        this.seed = seed;
    }

    if ( Filter ) NoiseFilter.__proto__ = Filter;
    NoiseFilter.prototype = Object.create( Filter && Filter.prototype );
    NoiseFilter.prototype.constructor = NoiseFilter;

    var prototypeAccessors = { noise: { configurable: true },seed: { configurable: true } };

    /**
     * The amount of noise to apply, this value should be in the range (0, 1].
     *
     * @member {number}
     * @default 0.5
     */
    prototypeAccessors.noise.get = function ()
    {
        return this.uniforms.uNoise;
    };

    prototypeAccessors.noise.set = function (value) // eslint-disable-line require-jsdoc
    {
        this.uniforms.uNoise = value;
    };

    /**
     * A seed value to apply to the random noise generation. `Math.random()` is a good value to use.
     *
     * @member {number}
     */
    prototypeAccessors.seed.get = function ()
    {
        return this.uniforms.uSeed;
    };

    prototypeAccessors.seed.set = function (value) // eslint-disable-line require-jsdoc
    {
        this.uniforms.uSeed = value;
    };

    Object.defineProperties( NoiseFilter.prototype, prototypeAccessors );

    return NoiseFilter;
}(Filter));

export { NoiseFilter };
//# sourceMappingURL=filter-noise.es.js.map
