/*!
 * @pixi/filter-displacement - v5.2.0
 * Compiled Mon, 23 Dec 2019 12:37:54 UTC
 *
 * @pixi/filter-displacement is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@pixi/core');
var math = require('@pixi/math');

var vertex = "attribute vec2 aVertexPosition;\r\n\r\nuniform mat3 projectionMatrix;\r\nuniform mat3 filterMatrix;\r\n\r\nvarying vec2 vTextureCoord;\r\nvarying vec2 vFilterCoord;\r\n\r\nuniform vec4 inputSize;\r\nuniform vec4 outputFrame;\r\n\r\nvec4 filterVertexPosition( void )\r\n{\r\n    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;\r\n\r\n    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);\r\n}\r\n\r\nvec2 filterTextureCoord( void )\r\n{\r\n    return aVertexPosition * (outputFrame.zw * inputSize.zw);\r\n}\r\n\r\nvoid main(void)\r\n{\r\n\tgl_Position = filterVertexPosition();\r\n\tvTextureCoord = filterTextureCoord();\r\n\tvFilterCoord = ( filterMatrix * vec3( vTextureCoord, 1.0)  ).xy;\r\n}\r\n";

var fragment = "varying vec2 vFilterCoord;\r\nvarying vec2 vTextureCoord;\r\n\r\nuniform vec2 scale;\r\nuniform mat2 rotation;\r\nuniform sampler2D uSampler;\r\nuniform sampler2D mapSampler;\r\n\r\nuniform highp vec4 inputSize;\r\nuniform vec4 inputClamp;\r\n\r\nvoid main(void)\r\n{\r\n  vec4 map =  texture2D(mapSampler, vFilterCoord);\r\n\r\n  map -= 0.5;\r\n  map.xy = scale * inputSize.zw * (rotation * map.xy);\r\n\r\n  gl_FragColor = texture2D(uSampler, clamp(vec2(vTextureCoord.x + map.x, vTextureCoord.y + map.y), inputClamp.xy, inputClamp.zw));\r\n}\r\n";

/**
 * The DisplacementFilter class uses the pixel values from the specified texture
 * (called the displacement map) to perform a displacement of an object.
 *
 * You can use this filter to apply all manor of crazy warping effects.
 * Currently the `r` property of the texture is used to offset the `x`
 * and the `g` property of the texture is used to offset the `y`.
 *
 * The way it works is it uses the values of the displacement map to look up the
 * correct pixels to output. This means it's not technically moving the original.
 * Instead, it's starting at the output and asking "which pixel from the original goes here".
 * For example, if a displacement map pixel has `red = 1` and the filter scale is `20`,
 * this filter will output the pixel approximately 20 pixels to the right of the original.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
var DisplacementFilter = /*@__PURE__*/(function (Filter) {
    function DisplacementFilter(sprite, scale)
    {
        var maskMatrix = new math.Matrix();

        sprite.renderable = false;

        Filter.call(this, vertex, fragment, {
            mapSampler: sprite._texture,
            filterMatrix: maskMatrix,
            scale: { x: 1, y: 1 },
            rotation: new Float32Array([1, 0, 0, 1]),
        });

        this.maskSprite = sprite;
        this.maskMatrix = maskMatrix;

        if (scale === null || scale === undefined)
        {
            scale = 20;
        }

        /**
         * scaleX, scaleY for displacements
         * @member {PIXI.Point}
         */
        this.scale = new math.Point(scale, scale);
    }

    if ( Filter ) DisplacementFilter.__proto__ = Filter;
    DisplacementFilter.prototype = Object.create( Filter && Filter.prototype );
    DisplacementFilter.prototype.constructor = DisplacementFilter;

    var prototypeAccessors = { map: { configurable: true } };

    /**
     * Applies the filter.
     *
     * @param {PIXI.systems.FilterSystem} filterManager - The manager.
     * @param {PIXI.RenderTexture} input - The input target.
     * @param {PIXI.RenderTexture} output - The output target.
     * @param {boolean} clear - Should the output be cleared before rendering to it.
     */
    DisplacementFilter.prototype.apply = function apply (filterManager, input, output, clear)
    {
        // fill maskMatrix with _normalized sprite texture coords_
        this.uniforms.filterMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, this.maskSprite);
        this.uniforms.scale.x = this.scale.x;
        this.uniforms.scale.y = this.scale.y;

        // Extract rotation from world transform
        var wt = this.maskSprite.transform.worldTransform;
        var lenX = Math.sqrt((wt.a * wt.a) + (wt.b * wt.b));
        var lenY = Math.sqrt((wt.c * wt.c) + (wt.d * wt.d));

        if (lenX !== 0 && lenY !== 0)
        {
            this.uniforms.rotation[0] = wt.a / lenX;
            this.uniforms.rotation[1] = wt.b / lenX;
            this.uniforms.rotation[2] = wt.c / lenY;
            this.uniforms.rotation[3] = wt.d / lenY;
        }

        // draw the filter...
        filterManager.applyFilter(this, input, output, clear);
    };

    /**
     * The texture used for the displacement map. Must be power of 2 sized texture.
     *
     * @member {PIXI.Texture}
     */
    prototypeAccessors.map.get = function ()
    {
        return this.uniforms.mapSampler;
    };

    prototypeAccessors.map.set = function (value) // eslint-disable-line require-jsdoc
    {
        this.uniforms.mapSampler = value;
    };

    Object.defineProperties( DisplacementFilter.prototype, prototypeAccessors );

    return DisplacementFilter;
}(core.Filter));

exports.DisplacementFilter = DisplacementFilter;
//# sourceMappingURL=filter-displacement.js.map
