/*!
 * @pixi/sprite-tiling - v5.2.0
 * Compiled Mon, 23 Dec 2019 12:37:54 UTC
 *
 * @pixi/sprite-tiling is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
this.PIXI = this.PIXI || {};
var _pixi_sprite_tiling = (function (exports, core, math, utils, sprite, constants) {
    'use strict';

    var tempPoint = new math.Point();

    /**
     * A tiling sprite is a fast way of rendering a tiling image
     *
     * @class
     * @extends PIXI.Sprite
     * @memberof PIXI
     */
    var TilingSprite = /*@__PURE__*/(function (Sprite) {
        function TilingSprite(texture, width, height)
        {
            if ( width === void 0 ) width = 100;
            if ( height === void 0 ) height = 100;

            Sprite.call(this, texture);

            /**
             * Tile transform
             *
             * @member {PIXI.Transform}
             */
            this.tileTransform = new math.Transform();

            // /// private

            /**
             * The with of the tiling sprite
             *
             * @member {number}
             * @private
             */
            this._width = width;

            /**
             * The height of the tiling sprite
             *
             * @member {number}
             * @private
             */
            this._height = height;

            /**
             * Canvas pattern
             *
             * @type {CanvasPattern}
             * @private
             */
            this._canvasPattern = null;

            /**
             * matrix that is applied to UV to get the coords in Texture normalized space to coords in BaseTexture space
             *
             * @member {PIXI.TextureMatrix}
             */
            this.uvMatrix = texture.uvMatrix || new core.TextureMatrix(texture);

            /**
             * Plugin that is responsible for rendering this element.
             * Allows to customize the rendering process without overriding '_render' method.
             *
             * @member {string}
             * @default 'tilingSprite'
             */
            this.pluginName = 'tilingSprite';

            /**
             * Whether or not anchor affects uvs
             *
             * @member {boolean}
             * @default false
             */
            this.uvRespectAnchor = false;
        }

        if ( Sprite ) TilingSprite.__proto__ = Sprite;
        TilingSprite.prototype = Object.create( Sprite && Sprite.prototype );
        TilingSprite.prototype.constructor = TilingSprite;

        var prototypeAccessors = { clampMargin: { configurable: true },tileScale: { configurable: true },tilePosition: { configurable: true },width: { configurable: true },height: { configurable: true } };
        /**
         * Changes frame clamping in corresponding textureTransform, shortcut
         * Change to -0.5 to add a pixel to the edge, recommended for transparent trimmed textures in atlas
         *
         * @default 0.5
         * @member {number}
         */
        prototypeAccessors.clampMargin.get = function ()
        {
            return this.uvMatrix.clampMargin;
        };

        prototypeAccessors.clampMargin.set = function (value) // eslint-disable-line require-jsdoc
        {
            this.uvMatrix.clampMargin = value;
            this.uvMatrix.update(true);
        };

        /**
         * The scaling of the image that is being tiled
         *
         * @member {PIXI.ObservablePoint}
         */
        prototypeAccessors.tileScale.get = function ()
        {
            return this.tileTransform.scale;
        };

        prototypeAccessors.tileScale.set = function (value) // eslint-disable-line require-jsdoc
        {
            this.tileTransform.scale.copyFrom(value);
        };

        /**
         * The offset of the image that is being tiled
         *
         * @member {PIXI.ObservablePoint}
         */
        prototypeAccessors.tilePosition.get = function ()
        {
            return this.tileTransform.position;
        };

        prototypeAccessors.tilePosition.set = function (value) // eslint-disable-line require-jsdoc
        {
            this.tileTransform.position.copyFrom(value);
        };

        /**
         * @private
         */
        TilingSprite.prototype._onTextureUpdate = function _onTextureUpdate ()
        {
            if (this.uvMatrix)
            {
                this.uvMatrix.texture = this._texture;
            }
            this._cachedTint = 0xFFFFFF;
        };

        /**
         * Renders the object using the WebGL renderer
         *
         * @protected
         * @param {PIXI.Renderer} renderer - The renderer
         */
        TilingSprite.prototype._render = function _render (renderer)
        {
            // tweak our texture temporarily..
            var texture = this._texture;

            if (!texture || !texture.valid)
            {
                return;
            }

            this.tileTransform.updateLocalTransform();
            this.uvMatrix.update();

            renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
            renderer.plugins[this.pluginName].render(this);
        };

        /**
         * Updates the bounds of the tiling sprite.
         *
         * @protected
         */
        TilingSprite.prototype._calculateBounds = function _calculateBounds ()
        {
            var minX = this._width * -this._anchor._x;
            var minY = this._height * -this._anchor._y;
            var maxX = this._width * (1 - this._anchor._x);
            var maxY = this._height * (1 - this._anchor._y);

            this._bounds.addFrame(this.transform, minX, minY, maxX, maxY);
        };

        /**
         * Gets the local bounds of the sprite object.
         *
         * @param {PIXI.Rectangle} rect - The output rectangle.
         * @return {PIXI.Rectangle} The bounds.
         */
        TilingSprite.prototype.getLocalBounds = function getLocalBounds (rect)
        {
            // we can do a fast local bounds if the sprite has no children!
            if (this.children.length === 0)
            {
                this._bounds.minX = this._width * -this._anchor._x;
                this._bounds.minY = this._height * -this._anchor._y;
                this._bounds.maxX = this._width * (1 - this._anchor._x);
                this._bounds.maxY = this._height * (1 - this._anchor._y);

                if (!rect)
                {
                    if (!this._localBoundsRect)
                    {
                        this._localBoundsRect = new math.Rectangle();
                    }

                    rect = this._localBoundsRect;
                }

                return this._bounds.getRectangle(rect);
            }

            return Sprite.prototype.getLocalBounds.call(this, rect);
        };

        /**
         * Checks if a point is inside this tiling sprite.
         *
         * @param {PIXI.Point} point - the point to check
         * @return {boolean} Whether or not the sprite contains the point.
         */
        TilingSprite.prototype.containsPoint = function containsPoint (point)
        {
            this.worldTransform.applyInverse(point, tempPoint);

            var width = this._width;
            var height = this._height;
            var x1 = -width * this.anchor._x;

            if (tempPoint.x >= x1 && tempPoint.x < x1 + width)
            {
                var y1 = -height * this.anchor._y;

                if (tempPoint.y >= y1 && tempPoint.y < y1 + height)
                {
                    return true;
                }
            }

            return false;
        };

        /**
         * Destroys this sprite and optionally its texture and children
         *
         * @param {object|boolean} [options] - Options parameter. A boolean will act as if all options
         *  have been set to that value
         * @param {boolean} [options.children=false] - if set to true, all the children will have their destroy
         *      method called as well. 'options' will be passed on to those calls.
         * @param {boolean} [options.texture=false] - Should it destroy the current texture of the sprite as well
         * @param {boolean} [options.baseTexture=false] - Should it destroy the base texture of the sprite as well
         */
        TilingSprite.prototype.destroy = function destroy (options)
        {
            Sprite.prototype.destroy.call(this, options);

            this.tileTransform = null;
            this.uvMatrix = null;
        };

        /**
         * Helper function that creates a new tiling sprite based on the source you provide.
         * The source can be - frame id, image url, video url, canvas element, video element, base texture
         *
         * @static
         * @param {number|string|PIXI.Texture|HTMLCanvasElement|HTMLVideoElement} source - Source to create texture from
         * @param {number} width - the width of the tiling sprite
         * @param {number} height - the height of the tiling sprite
         * @return {PIXI.TilingSprite} The newly created texture
         */
        TilingSprite.from = function from (source, width, height)
        {
            return new TilingSprite(core.Texture.from(source), width, height);
        };

        /**
         * Helper function that creates a tiling sprite that will use a texture from the TextureCache based on the frameId
         * The frame ids are created when a Texture packer file has been loaded
         *
         * @static
         * @param {string} frameId - The frame Id of the texture in the cache
         * @param {number} width - the width of the tiling sprite
         * @param {number} height - the height of the tiling sprite
         * @return {PIXI.TilingSprite} A new TilingSprite using a texture from the texture cache matching the frameId
         */
        TilingSprite.fromFrame = function fromFrame (frameId, width, height)
        {
            var texture = utils.TextureCache[frameId];

            if (!texture)
            {
                throw new Error(("The frameId \"" + frameId + "\" does not exist in the texture cache " + (this)));
            }

            return new TilingSprite(texture, width, height);
        };

        /**
         * Helper function that creates a sprite that will contain a texture based on an image url
         * If the image is not in the texture cache it will be loaded
         *
         * @static
         * @param {string} imageId - The image url of the texture
         * @param {number} width - the width of the tiling sprite
         * @param {number} height - the height of the tiling sprite
         * @param {Object} [options] - See {@link PIXI.BaseTexture}'s constructor for options.
         * @return {PIXI.TilingSprite} A new TilingSprite using a texture from the texture cache matching the image id
         */
        TilingSprite.fromImage = function fromImage (imageId, width, height, options)
        {
            // Fallback support for crossorigin, scaleMode parameters
            if (options && typeof options !== 'object')
            {
                options = {
                    scaleMode: arguments[4],
                    resourceOptions: {
                        crossorigin: arguments[3],
                    },
                };
            }

            return new TilingSprite(core.Texture.from(imageId, options), width, height);
        };

        /**
         * The width of the sprite, setting this will actually modify the scale to achieve the value set
         *
         * @member {number}
         */
        prototypeAccessors.width.get = function ()
        {
            return this._width;
        };

        prototypeAccessors.width.set = function (value) // eslint-disable-line require-jsdoc
        {
            this._width = value;
        };

        /**
         * The height of the TilingSprite, setting this will actually modify the scale to achieve the value set
         *
         * @member {number}
         */
        prototypeAccessors.height.get = function ()
        {
            return this._height;
        };

        prototypeAccessors.height.set = function (value) // eslint-disable-line require-jsdoc
        {
            this._height = value;
        };

        Object.defineProperties( TilingSprite.prototype, prototypeAccessors );

        return TilingSprite;
    }(sprite.Sprite));

    var vertex = "attribute vec2 aVertexPosition;\r\nattribute vec2 aTextureCoord;\r\n\r\nuniform mat3 projectionMatrix;\r\nuniform mat3 translationMatrix;\r\nuniform mat3 uTransform;\r\n\r\nvarying vec2 vTextureCoord;\r\n\r\nvoid main(void)\r\n{\r\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\r\n\r\n    vTextureCoord = (uTransform * vec3(aTextureCoord, 1.0)).xy;\r\n}\r\n";

    var fragment = "varying vec2 vTextureCoord;\r\n\r\nuniform sampler2D uSampler;\r\nuniform vec4 uColor;\r\nuniform mat3 uMapCoord;\r\nuniform vec4 uClampFrame;\r\nuniform vec2 uClampOffset;\r\n\r\nvoid main(void)\r\n{\r\n    vec2 coord = vTextureCoord - floor(vTextureCoord - uClampOffset);\r\n    coord = (uMapCoord * vec3(coord, 1.0)).xy;\r\n    coord = clamp(coord, uClampFrame.xy, uClampFrame.zw);\r\n\r\n    vec4 texSample = texture2D(uSampler, coord);\r\n    gl_FragColor = texSample * uColor;\r\n}\r\n";

    var fragmentSimple = "varying vec2 vTextureCoord;\r\n\r\nuniform sampler2D uSampler;\r\nuniform vec4 uColor;\r\n\r\nvoid main(void)\r\n{\r\n    vec4 sample = texture2D(uSampler, vTextureCoord);\r\n    gl_FragColor = sample * uColor;\r\n}\r\n";

    var tempMat = new math.Matrix();

    /**
     * WebGL renderer plugin for tiling sprites
     *
     * @class
     * @memberof PIXI
     * @extends PIXI.ObjectRenderer
     */
    var TilingSpriteRenderer = /*@__PURE__*/(function (ObjectRenderer) {
        function TilingSpriteRenderer(renderer)
        {
            ObjectRenderer.call(this, renderer);

            var uniforms = { globals: this.renderer.globalUniforms };

            this.shader = core.Shader.from(vertex, fragment, uniforms);

            this.simpleShader = core.Shader.from(vertex, fragmentSimple, uniforms);

            this.quad = new core.QuadUv();

            /**
             * The WebGL state in which this renderer will work.
             *
             * @member {PIXI.State}
             * @readonly
             */
            this.state = core.State.for2d();
        }

        if ( ObjectRenderer ) TilingSpriteRenderer.__proto__ = ObjectRenderer;
        TilingSpriteRenderer.prototype = Object.create( ObjectRenderer && ObjectRenderer.prototype );
        TilingSpriteRenderer.prototype.constructor = TilingSpriteRenderer;

        /**
         *
         * @param {PIXI.TilingSprite} ts tilingSprite to be rendered
         */
        TilingSpriteRenderer.prototype.render = function render (ts)
        {
            var renderer = this.renderer;
            var quad = this.quad;

            var vertices = quad.vertices;

            vertices[0] = vertices[6] = (ts._width) * -ts.anchor.x;
            vertices[1] = vertices[3] = ts._height * -ts.anchor.y;

            vertices[2] = vertices[4] = (ts._width) * (1.0 - ts.anchor.x);
            vertices[5] = vertices[7] = ts._height * (1.0 - ts.anchor.y);

            if (ts.uvRespectAnchor)
            {
                vertices = quad.uvs;

                vertices[0] = vertices[6] = -ts.anchor.x;
                vertices[1] = vertices[3] = -ts.anchor.y;

                vertices[2] = vertices[4] = 1.0 - ts.anchor.x;
                vertices[5] = vertices[7] = 1.0 - ts.anchor.y;
            }

            quad.invalidate();

            var tex = ts._texture;
            var baseTex = tex.baseTexture;
            var lt = ts.tileTransform.localTransform;
            var uv = ts.uvMatrix;
            var isSimple = baseTex.isPowerOfTwo
                && tex.frame.width === baseTex.width && tex.frame.height === baseTex.height;

            // auto, force repeat wrapMode for big tiling textures
            if (isSimple)
            {
                if (!baseTex._glTextures[renderer.CONTEXT_UID])
                {
                    if (baseTex.wrapMode === constants.WRAP_MODES.CLAMP)
                    {
                        baseTex.wrapMode = constants.WRAP_MODES.REPEAT;
                    }
                }
                else
                {
                    isSimple = baseTex.wrapMode !== constants.WRAP_MODES.CLAMP;
                }
            }

            var shader = isSimple ? this.simpleShader : this.shader;

            var w = tex.width;
            var h = tex.height;
            var W = ts._width;
            var H = ts._height;

            tempMat.set(lt.a * w / W,
                lt.b * w / H,
                lt.c * h / W,
                lt.d * h / H,
                lt.tx / W,
                lt.ty / H);

            // that part is the same as above:
            // tempMat.identity();
            // tempMat.scale(tex.width, tex.height);
            // tempMat.prepend(lt);
            // tempMat.scale(1.0 / ts._width, 1.0 / ts._height);

            tempMat.invert();
            if (isSimple)
            {
                tempMat.prepend(uv.mapCoord);
            }
            else
            {
                shader.uniforms.uMapCoord = uv.mapCoord.toArray(true);
                shader.uniforms.uClampFrame = uv.uClampFrame;
                shader.uniforms.uClampOffset = uv.uClampOffset;
            }

            shader.uniforms.uTransform = tempMat.toArray(true);
            shader.uniforms.uColor = utils.premultiplyTintToRgba(ts.tint, ts.worldAlpha,
                shader.uniforms.uColor, baseTex.alphaMode);
            shader.uniforms.translationMatrix = ts.transform.worldTransform.toArray(true);
            shader.uniforms.uSampler = tex;

            renderer.shader.bind(shader);
            renderer.geometry.bind(quad);// , renderer.shader.getGLShader());

            this.state.blendMode = utils.correctBlendMode(ts.blendMode, baseTex.alphaMode);
            renderer.state.set(this.state);
            renderer.geometry.draw(this.renderer.gl.TRIANGLES, 6, 0);
        };

        return TilingSpriteRenderer;
    }(core.ObjectRenderer));

    exports.TilingSprite = TilingSprite;
    exports.TilingSpriteRenderer = TilingSpriteRenderer;

    return exports;

}({}, PIXI, PIXI, PIXI.utils, PIXI, PIXI));
Object.assign(this.PIXI, _pixi_sprite_tiling);
//# sourceMappingURL=sprite-tiling.js.map
