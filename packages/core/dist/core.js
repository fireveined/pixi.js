/*!
 * @pixi/core - v5.2.0
 * Compiled Mon, 23 Dec 2019 12:37:54 UTC
 *
 * @pixi/core is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
this.PIXI = this.PIXI || {};
var _pixi_core = (function (exports, runner, utils, constants, settings, ticker, math, display) {
    'use strict';

    /**
     * Base resource class for textures that manages validation and uploading, depending on its type.
     *
     * Uploading of a base texture to the GPU is required.
     *
     * @class
     * @memberof PIXI.resources
     */
    var Resource = function Resource(width, height)
    {
        if ( width === void 0 ) width = 0;
        if ( height === void 0 ) height = 0;

        /**
         * Internal width of the resource
         * @member {number}
         * @protected
         */
        this._width = width;

        /**
         * Internal height of the resource
         * @member {number}
         * @protected
         */
        this._height = height;

        /**
         * If resource has been destroyed
         * @member {boolean}
         * @readonly
         * @default false
         */
        this.destroyed = false;

        /**
         * `true` if resource is created by BaseTexture
         * useful for doing cleanup with BaseTexture destroy
         * and not cleaning up resources that were created
         * externally.
         * @member {boolean}
         * @protected
         */
        this.internal = false;

        /**
         * Mini-runner for handling resize events
         *
         * @member {Runner}
         * @private
         */
        this.onResize = new runner.Runner('setRealSize', 2);

        /**
         * Mini-runner for handling update events
         *
         * @member {Runner}
         * @private
         */
        this.onUpdate = new runner.Runner('update');

        /**
         * Handle internal errors, such as loading errors
         *
         * @member {Runner}
         * @private
         */
        this.onError = new runner.Runner('onError', 1);
    };

    var prototypeAccessors = { valid: { configurable: true },width: { configurable: true },height: { configurable: true } };

    /**
     * Bind to a parent BaseTexture
     *
     * @param {PIXI.BaseTexture} baseTexture - Parent texture
     */
    Resource.prototype.bind = function bind (baseTexture)
    {
        this.onResize.add(baseTexture);
        this.onUpdate.add(baseTexture);
        this.onError.add(baseTexture);

        // Call a resize immediate if we already
        // have the width and height of the resource
        if (this._width || this._height)
        {
            this.onResize.run(this._width, this._height);
        }
    };

    /**
     * Unbind to a parent BaseTexture
     *
     * @param {PIXI.BaseTexture} baseTexture - Parent texture
     */
    Resource.prototype.unbind = function unbind (baseTexture)
    {
        this.onResize.remove(baseTexture);
        this.onUpdate.remove(baseTexture);
        this.onError.remove(baseTexture);
    };

    /**
     * Trigger a resize event
     * @param {number} width X dimension
     * @param {number} height Y dimension
     */
    Resource.prototype.resize = function resize (width, height)
    {
        if (width !== this._width || height !== this._height)
        {
            this._width = width;
            this._height = height;
            this.onResize.run(width, height);
        }
    };

    /**
     * Has been validated
     * @readonly
     * @member {boolean}
     */
    prototypeAccessors.valid.get = function ()
    {
        return !!this._width && !!this._height;
    };

    /**
     * Has been updated trigger event
     */
    Resource.prototype.update = function update ()
    {
        if (!this.destroyed)
        {
            this.onUpdate.run();
        }
    };

    /**
     * This can be overridden to start preloading a resource
     * or do any other prepare step.
     * @protected
     * @return {Promise<void>} Handle the validate event
     */
    Resource.prototype.load = function load ()
    {
        return Promise.resolve();
    };

    /**
     * The width of the resource.
     *
     * @member {number}
     * @readonly
     */
    prototypeAccessors.width.get = function ()
    {
        return this._width;
    };

    /**
     * The height of the resource.
     *
     * @member {number}
     * @readonly
     */
    prototypeAccessors.height.get = function ()
    {
        return this._height;
    };

    /**
     * Uploads the texture or returns false if it cant for some reason. Override this.
     *
     * @param {PIXI.Renderer} renderer - yeah, renderer!
     * @param {PIXI.BaseTexture} baseTexture - the texture
     * @param {PIXI.GLTexture} glTexture - texture instance for this webgl context
     * @returns {boolean} true is success
     */
    Resource.prototype.upload = function upload (renderer, baseTexture, glTexture) // eslint-disable-line no-unused-vars
    {
        return false;
    };

    /**
     * Set the style, optional to override
     *
     * @param {PIXI.Renderer} renderer - yeah, renderer!
     * @param {PIXI.BaseTexture} baseTexture - the texture
     * @param {PIXI.GLTexture} glTexture - texture instance for this webgl context
     * @returns {boolean} `true` is success
     */
    Resource.prototype.style = function style (renderer, baseTexture, glTexture) // eslint-disable-line no-unused-vars
    {
        return false;
    };

    /**
     * Clean up anything, this happens when destroying is ready.
     *
     * @protected
     */
    Resource.prototype.dispose = function dispose ()
    {
        // override
    };

    /**
     * Call when destroying resource, unbind any BaseTexture object
     * before calling this method, as reference counts are maintained
     * internally.
     */
    Resource.prototype.destroy = function destroy ()
    {
        if (!this.destroyed)
        {
            this.destroyed = true;
            this.dispose();
            this.onError.removeAll();
            this.onError = null;
            this.onResize.removeAll();
            this.onResize = null;
            this.onUpdate.removeAll();
            this.onUpdate = null;
        }
    };

    Object.defineProperties( Resource.prototype, prototypeAccessors );

    /**
     * Base for all the image/canvas resources
     * @class
     * @extends PIXI.resources.Resource
     * @memberof PIXI.resources
     */
    var BaseImageResource = /*@__PURE__*/(function (Resource) {
        function BaseImageResource(source)
        {
            var width = source.naturalWidth || source.videoWidth || source.width;
            var height = source.naturalHeight || source.videoHeight || source.height;

            Resource.call(this, width, height);

            /**
             * The source element
             * @member {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|SVGElement}
             * @readonly
             */
            this.source = source;

            /**
             * If set to `true`, will force `texImage2D` over `texSubImage2D` for uploading.
             * Certain types of media (e.g. video) using `texImage2D` is more performant.
             * @member {boolean}
             * @default false
             * @private
             */
            this.noSubImage = false;
        }

        if ( Resource ) BaseImageResource.__proto__ = Resource;
        BaseImageResource.prototype = Object.create( Resource && Resource.prototype );
        BaseImageResource.prototype.constructor = BaseImageResource;

        /**
         * Set cross origin based detecting the url and the crossorigin
         * @protected
         * @param {HTMLElement} element - Element to apply crossOrigin
         * @param {string} url - URL to check
         * @param {boolean|string} [crossorigin=true] - Cross origin value to use
         */
        BaseImageResource.crossOrigin = function crossOrigin (element, url, crossorigin)
        {
            if (crossorigin === undefined && url.indexOf('data:') !== 0)
            {
                element.crossOrigin = utils.determineCrossOrigin(url);
            }
            else if (crossorigin !== false)
            {
                element.crossOrigin = typeof crossorigin === 'string' ? crossorigin : 'anonymous';
            }
        };

        /**
         * Upload the texture to the GPU.
         * @param {PIXI.Renderer} renderer Upload to the renderer
         * @param {PIXI.BaseTexture} baseTexture Reference to parent texture
         * @param {PIXI.GLTexture} glTexture
         * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|SVGElement} [source] (optional)
         * @returns {boolean} true is success
         */
        BaseImageResource.prototype.upload = function upload (renderer, baseTexture, glTexture, source)
        {
            var gl = renderer.gl;
            var width = baseTexture.realWidth;
            var height = baseTexture.realHeight;

            source = source || this.source;

            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.alphaMode === constants.ALPHA_MODES.UNPACK);

            if (!this.noSubImage
                && baseTexture.target === gl.TEXTURE_2D
                && glTexture.width === width
                && glTexture.height === height)
            {
                gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, baseTexture.format, baseTexture.type, source);
            }
            else
            {
                glTexture.width = width;
                glTexture.height = height;

                gl.texImage2D(baseTexture.target, 0, baseTexture.format, baseTexture.format, baseTexture.type, source);
            }

            return true;
        };

        /**
         * Checks if source width/height was changed, resize can cause extra baseTexture update.
         * Triggers one update in any case.
         */
        BaseImageResource.prototype.update = function update ()
        {
            if (this.destroyed)
            {
                return;
            }

            var width = this.source.naturalWidth || this.source.videoWidth || this.source.width;
            var height = this.source.naturalHeight || this.source.videoHeight || this.source.height;

            this.resize(width, height);

            Resource.prototype.update.call(this);
        };

        /**
         * Destroy this BaseImageResource
         * @override
         * @param {PIXI.BaseTexture} [fromTexture] Optional base texture
         * @return {boolean} Destroy was successful
         */
        BaseImageResource.prototype.dispose = function dispose ()
        {
            this.source = null;
        };

        return BaseImageResource;
    }(Resource));

    /**
     * Resource type for HTMLImageElement.
     * @class
     * @extends PIXI.resources.BaseImageResource
     * @memberof PIXI.resources
     */
    var ImageResource = /*@__PURE__*/(function (BaseImageResource) {
        function ImageResource(source, options)
        {
            options = options || {};

            if (!(source instanceof HTMLImageElement))
            {
                var imageElement = new Image();

                BaseImageResource.crossOrigin(imageElement, source, options.crossorigin);

                imageElement.src = source;
                source = imageElement;
            }

            BaseImageResource.call(this, source);

            // FireFox 68, and possibly other versions, seems like setting the HTMLImageElement#width and #height
            // to non-zero values before its loading completes if images are in a cache.
            // Because of this, need to set the `_width` and the `_height` to zero to avoid uploading incomplete images.
            // Please refer to the issue #5968 (https://github.com/pixijs/pixi.js/issues/5968).
            if (!source.complete && !!this._width && !!this._height)
            {
                this._width = 0;
                this._height = 0;
            }

            /**
             * URL of the image source
             * @member {string}
             */
            this.url = source.src;

            /**
             * When process is completed
             * @member {Promise<void>}
             * @private
             */
            this._process = null;

            /**
             * If the image should be disposed after upload
             * @member {boolean}
             * @default false
             */
            this.preserveBitmap = false;

            /**
             * If capable, convert the image using createImageBitmap API
             * @member {boolean}
             * @default PIXI.settings.CREATE_IMAGE_BITMAP
             */
            this.createBitmap = (options.createBitmap !== undefined
                ? options.createBitmap : settings.settings.CREATE_IMAGE_BITMAP) && !!window.createImageBitmap;

            /**
             * Controls texture alphaMode field
             * Copies from options
             * Default is `null`, copies option from baseTexture
             *
             * @member {PIXI.ALPHA_MODES|null}
             * @readonly
             */
            this.alphaMode = typeof options.alphaMode === 'number' ? options.alphaMode : null;

            if (options.premultiplyAlpha !== undefined)
            {
                // triggers deprecation
                this.premultiplyAlpha = options.premultiplyAlpha;
            }

            /**
             * The ImageBitmap element created for HTMLImageElement
             * @member {ImageBitmap}
             * @default null
             */
            this.bitmap = null;

            /**
             * Promise when loading
             * @member {Promise<void>}
             * @private
             * @default null
             */
            this._load = null;

            if (options.autoLoad !== false)
            {
                this.load();
            }
        }

        if ( BaseImageResource ) ImageResource.__proto__ = BaseImageResource;
        ImageResource.prototype = Object.create( BaseImageResource && BaseImageResource.prototype );
        ImageResource.prototype.constructor = ImageResource;

        /**
         * returns a promise when image will be loaded and processed
         *
         * @param {boolean} [createBitmap=true] whether process image into bitmap
         * @returns {Promise<void>}
         */
        ImageResource.prototype.load = function load (createBitmap)
        {
            var this$1 = this;

            if (createBitmap !== undefined)
            {
                this.createBitmap = createBitmap;
            }

            if (this._load)
            {
                return this._load;
            }

            this._load = new Promise(function (resolve) {
                this$1.url = this$1.source.src;
                var ref = this$1;
                var source = ref.source;

                var completed = function () {
                    if (this$1.destroyed)
                    {
                        return;
                    }
                    source.onload = null;
                    source.onerror = null;

                    this$1.resize(source.width, source.height);
                    this$1._load = null;

                    if (this$1.createBitmap)
                    {
                        resolve(this$1.process());
                    }
                    else
                    {
                        resolve(this$1);
                    }
                };

                if (source.complete && source.src)
                {
                    completed();
                }
                else
                {
                    source.onload = completed;
                    source.onerror = function (event) { return this$1.onError.run(event); };
                }
            });

            return this._load;
        };

        /**
         * Called when we need to convert image into BitmapImage.
         * Can be called multiple times, real promise is cached inside.
         *
         * @returns {Promise<void>} cached promise to fill that bitmap
         */
        ImageResource.prototype.process = function process ()
        {
            var this$1 = this;

            if (this._process !== null)
            {
                return this._process;
            }
            if (this.bitmap !== null || !window.createImageBitmap)
            {
                return Promise.resolve(this);
            }

            this._process = window.createImageBitmap(this.source,
                0, 0, this.source.width, this.source.height,
                {
                    premultiplyAlpha: this.premultiplyAlpha === constants.ALPHA_MODES.UNPACK ? 'premultiply' : 'none',
                })
                .then(function (bitmap) {
                    if (this$1.destroyed)
                    {
                        return Promise.reject();
                    }
                    this$1.bitmap = bitmap;
                    this$1.update();
                    this$1._process = null;

                    return Promise.resolve(this$1);
                });

            return this._process;
        };

        /**
         * Upload the image resource to GPU.
         *
         * @param {PIXI.Renderer} renderer - Renderer to upload to
         * @param {PIXI.BaseTexture} baseTexture - BaseTexture for this resource
         * @param {PIXI.GLTexture} glTexture - GLTexture to use
         * @returns {boolean} true is success
         */
        ImageResource.prototype.upload = function upload (renderer, baseTexture, glTexture)
        {
            if (typeof this.alphaMode === 'number')
            {
                // bitmap stores unpack premultiply flag, we dont have to notify texImage2D about it

                baseTexture.alphaMode = this.alphaMode;
            }

            if (!this.createBitmap)
            {
                return BaseImageResource.prototype.upload.call(this, renderer, baseTexture, glTexture);
            }
            if (!this.bitmap)
            {
                // yeah, ignore the output
                this.process();
                if (!this.bitmap)
                {
                    return false;
                }
            }

            BaseImageResource.prototype.upload.call(this, renderer, baseTexture, glTexture, this.bitmap);

            if (!this.preserveBitmap)
            {
                // checks if there are other renderers that possibly need this bitmap

                var flag = true;

                for (var key in baseTexture._glTextures)
                {
                    var otherTex = baseTexture._glTextures[key];

                    if (otherTex !== glTexture && otherTex.dirtyId !== baseTexture.dirtyId)
                    {
                        flag = false;
                        break;
                    }
                }

                if (flag)
                {
                    if (this.bitmap.close)
                    {
                        this.bitmap.close();
                    }

                    this.bitmap = null;
                }
            }

            return true;
        };

        /**
         * Destroys this texture
         * @override
         */
        ImageResource.prototype.dispose = function dispose ()
        {
            this.source.onload = null;
            this.source.onerror = null;

            BaseImageResource.prototype.dispose.call(this);

            if (this.bitmap)
            {
                this.bitmap.close();
                this.bitmap = null;
            }
            this._process = null;
            this._load = null;
        };

        return ImageResource;
    }(BaseImageResource));

    /**
     * Collection of installed resource types, class must extend {@link PIXI.resources.Resource}.
     * @example
     * class CustomResource extends PIXI.resources.Resource {
     *   // MUST have source, options constructor signature
     *   // for auto-detected resources to be created.
     *   constructor(source, options) {
     *     super();
     *   }
     *   upload(renderer, baseTexture, glTexture) {
     *     // upload with GL
     *     return true;
     *   }
     *   // used to auto-detect resource
     *   static test(source, extension) {
     *     return extension === 'xyz'|| source instanceof SomeClass;
     *   }
     * }
     * // Install the new resource type
     * PIXI.resources.INSTALLED.push(CustomResource);
     *
     * @name PIXI.resources.INSTALLED
     * @type {Array<*>}
     * @static
     * @readonly
     */
    var INSTALLED = [];

    /**
     * Create a resource element from a single source element. This
     * auto-detects which type of resource to create. All resources that
     * are auto-detectable must have a static `test` method and a constructor
     * with the arguments `(source, options?)`. Currently, the supported
     * resources for auto-detection include:
     *  - {@link PIXI.resources.ImageResource}
     *  - {@link PIXI.resources.CanvasResource}
     *  - {@link PIXI.resources.VideoResource}
     *  - {@link PIXI.resources.SVGResource}
     *  - {@link PIXI.resources.BufferResource}
     * @static
     * @function PIXI.resources.autoDetectResource
     * @param {string|*} source - Resource source, this can be the URL to the resource,
     *        a typed-array (for BufferResource), HTMLVideoElement, SVG data-uri
     *        or any other resource that can be auto-detected. If not resource is
     *        detected, it's assumed to be an ImageResource.
     * @param {object} [options] - Pass-through options to use for Resource
     * @param {number} [options.width] - Width of BufferResource or SVG rasterization
     * @param {number} [options.height] - Height of BufferResource or SVG rasterization
     * @param {boolean} [options.autoLoad=true] - Image, SVG and Video flag to start loading
     * @param {number} [options.scale=1] - SVG source scale. Overridden by width, height
     * @param {boolean} [options.createBitmap=PIXI.settings.CREATE_IMAGE_BITMAP] - Image option to create Bitmap object
     * @param {boolean} [options.crossorigin=true] - Image and Video option to set crossOrigin
     * @param {boolean} [options.autoPlay=true] - Video option to start playing video immediately
     * @param {number} [options.updateFPS=0] - Video option to update how many times a second the
     *        texture should be updated from the video. Leave at 0 to update at every render
     * @return {PIXI.resources.Resource} The created resource.
     */
    function autoDetectResource(source, options)
    {
        if (!source)
        {
            return null;
        }

        var extension = '';

        if (typeof source === 'string')
        {
            // search for file extension: period, 3-4 chars, then ?, # or EOL
            var result = (/\.(\w{3,4})(?:$|\?|#)/i).exec(source);

            if (result)
            {
                extension = result[1].toLowerCase();
            }
        }

        for (var i = INSTALLED.length - 1; i >= 0; --i)
        {
            var ResourcePlugin = INSTALLED[i];

            if (ResourcePlugin.test && ResourcePlugin.test(source, extension))
            {
                return new ResourcePlugin(source, options);
            }
        }

        // When in doubt: probably an image
        // might be appropriate to throw an error or return null
        return new ImageResource(source, options);
    }

    /**
     * @interface SharedArrayBuffer
     */

    /**
     * Buffer resource with data of typed array.
     * @class
     * @extends PIXI.resources.Resource
     * @memberof PIXI.resources
     */
    var BufferResource = /*@__PURE__*/(function (Resource) {
        function BufferResource(source, options)
        {
            var ref = options || {};
            var width = ref.width;
            var height = ref.height;

            if (!width || !height)
            {
                throw new Error('BufferResource width or height invalid');
            }

            Resource.call(this, width, height);

            /**
             * Source array
             * Cannot be ClampedUint8Array because it cant be uploaded to WebGL
             *
             * @member {Float32Array|Uint8Array|Uint32Array}
             */
            this.data = source;
        }

        if ( Resource ) BufferResource.__proto__ = Resource;
        BufferResource.prototype = Object.create( Resource && Resource.prototype );
        BufferResource.prototype.constructor = BufferResource;

        /**
         * Upload the texture to the GPU.
         * @param {PIXI.Renderer} renderer Upload to the renderer
         * @param {PIXI.BaseTexture} baseTexture Reference to parent texture
         * @param {PIXI.GLTexture} glTexture glTexture
         * @returns {boolean} true is success
         */
        BufferResource.prototype.upload = function upload (renderer, baseTexture, glTexture)
        {
            var gl = renderer.gl;

            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.alphaMode === constants.ALPHA_MODES.UNPACK);

            if (glTexture.width === baseTexture.width && glTexture.height === baseTexture.height)
            {
                gl.texSubImage2D(
                    baseTexture.target,
                    0,
                    0,
                    0,
                    baseTexture.width,
                    baseTexture.height,
                    baseTexture.format,
                    baseTexture.type,
                    this.data
                );
            }
            else
            {
                glTexture.width = baseTexture.width;
                glTexture.height = baseTexture.height;

                gl.texImage2D(
                    baseTexture.target,
                    0,
                    glTexture.internalFormat,
                    baseTexture.width,
                    baseTexture.height,
                    0,
                    baseTexture.format,
                    glTexture.type,
                    this.data
                );
            }

            return true;
        };

        /**
         * Destroy and don't use after this
         * @override
         */
        BufferResource.prototype.dispose = function dispose ()
        {
            this.data = null;
        };

        /**
         * Used to auto-detect the type of resource.
         *
         * @static
         * @param {*} source - The source object
         * @return {boolean} `true` if <canvas>
         */
        BufferResource.test = function test (source)
        {
            return source instanceof Float32Array
                || source instanceof Uint8Array
                || source instanceof Uint32Array;
        };

        return BufferResource;
    }(Resource));

    var defaultBufferOptions = {
        scaleMode: constants.SCALE_MODES.NEAREST,
        format: constants.FORMATS.RGBA,
        alphaMode: constants.ALPHA_MODES.NPM,
    };

    /**
     * A Texture stores the information that represents an image.
     * All textures have a base texture, which contains information about the source.
     * Therefore you can have many textures all using a single BaseTexture
     *
     * @class
     * @extends PIXI.utils.EventEmitter
     * @memberof PIXI
     * @param {PIXI.resources.Resource|string|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} [resource=null]
     *        The current resource to use, for things that aren't Resource objects, will be converted
     *        into a Resource.
     * @param {Object} [options] - Collection of options
     * @param {PIXI.MIPMAP_MODES} [options.mipmap=PIXI.settings.MIPMAP_TEXTURES] - If mipmapping is enabled for texture
     * @param {number} [options.anisotropicLevel=PIXI.settings.ANISOTROPIC_LEVEL] - Anisotropic filtering level of texture
     * @param {PIXI.WRAP_MODES} [options.wrapMode=PIXI.settings.WRAP_MODE] - Wrap mode for textures
     * @param {PIXI.SCALE_MODES} [options.scaleMode=PIXI.settings.SCALE_MODE] - Default scale mode, linear, nearest
     * @param {PIXI.FORMATS} [options.format=PIXI.FORMATS.RGBA] - GL format type
     * @param {PIXI.TYPES} [options.type=PIXI.TYPES.UNSIGNED_BYTE] - GL data type
     * @param {PIXI.TARGETS} [options.target=PIXI.TARGETS.TEXTURE_2D] - GL texture target
     * @param {PIXI.ALPHA_MODES} [options.alphaMode=PIXI.ALPHA_MODES.UNPACK] - Pre multiply the image alpha
     * @param {number} [options.width=0] - Width of the texture
     * @param {number} [options.height=0] - Height of the texture
     * @param {number} [options.resolution] - Resolution of the base texture
     * @param {object} [options.resourceOptions] - Optional resource options,
     *        see {@link PIXI.resources.autoDetectResource autoDetectResource}
     */
    var BaseTexture = /*@__PURE__*/(function (EventEmitter) {
        function BaseTexture(resource, options)
        {
            if ( resource === void 0 ) resource = null;
            if ( options === void 0 ) options = null;

            EventEmitter.call(this);

            options = options || {};

            var alphaMode = options.alphaMode;
            var mipmap = options.mipmap;
            var anisotropicLevel = options.anisotropicLevel;
            var scaleMode = options.scaleMode;
            var width = options.width;
            var height = options.height;
            var wrapMode = options.wrapMode;
            var format = options.format;
            var type = options.type;
            var target = options.target;
            var resolution = options.resolution;
            var resourceOptions = options.resourceOptions;

            // Convert the resource to a Resource object
            if (resource && !(resource instanceof Resource))
            {
                resource = autoDetectResource(resource, resourceOptions);
                resource.internal = true;
            }

            /**
             * The width of the base texture set when the image has loaded
             *
             * @readonly
             * @member {number}
             */
            this.width = width || 0;

            /**
             * The height of the base texture set when the image has loaded
             *
             * @readonly
             * @member {number}
             */
            this.height = height || 0;

            /**
             * The resolution / device pixel ratio of the texture
             *
             * @member {number}
             * @default PIXI.settings.RESOLUTION
             */
            this.resolution = resolution || settings.settings.RESOLUTION;

            /**
             * Mipmap mode of the texture, affects downscaled images
             *
             * @member {PIXI.MIPMAP_MODES}
             * @default PIXI.settings.MIPMAP_TEXTURES
             */
            this.mipmap = mipmap !== undefined ? mipmap : settings.settings.MIPMAP_TEXTURES;

            /**
             * Anisotropic filtering level of texture
             *
             * @member {number}
             * @default PIXI.settings.ANISOTROPIC_LEVEL
             */
            this.anisotropicLevel = anisotropicLevel !== undefined ? anisotropicLevel : settings.settings.ANISOTROPIC_LEVEL;

            /**
             * How the texture wraps
             * @member {number}
             */
            this.wrapMode = wrapMode || settings.settings.WRAP_MODE;

            /**
             * The scale mode to apply when scaling this texture
             *
             * @member {PIXI.SCALE_MODES}
             * @default PIXI.settings.SCALE_MODE
             */
            this.scaleMode = scaleMode !== undefined ? scaleMode : settings.settings.SCALE_MODE;

            /**
             * The pixel format of the texture
             *
             * @member {PIXI.FORMATS}
             * @default PIXI.FORMATS.RGBA
             */
            this.format = format || constants.FORMATS.RGBA;

            /**
             * The type of resource data
             *
             * @member {PIXI.TYPES}
             * @default PIXI.TYPES.UNSIGNED_BYTE
             */
            this.type = type || constants.TYPES.UNSIGNED_BYTE;

            /**
             * The target type
             *
             * @member {PIXI.TARGETS}
             * @default PIXI.TARGETS.TEXTURE_2D
             */
            this.target = target || constants.TARGETS.TEXTURE_2D;

            /**
             * How to treat premultiplied alpha, see {@link PIXI.ALPHA_MODES}.
             *
             * @member {PIXI.ALPHA_MODES}
             * @default PIXI.ALPHA_MODES.UNPACK
             */
            this.alphaMode = alphaMode !== undefined ? alphaMode : constants.ALPHA_MODES.UNPACK;

            if (options.premultiplyAlpha !== undefined)
            {
                // triggers deprecation
                this.premultiplyAlpha = options.premultiplyAlpha;
            }

            /**
             * Global unique identifier for this BaseTexture
             *
             * @member {string}
             * @protected
             */
            this.uid = utils.uid();

            /**
             * Used by automatic texture Garbage Collection, stores last GC tick when it was bound
             *
             * @member {number}
             * @protected
             */
            this.touched = 0;

            /**
             * Whether or not the texture is a power of two, try to use power of two textures as much
             * as you can
             *
             * @readonly
             * @member {boolean}
             * @default false
             */
            this.isPowerOfTwo = false;
            this._refreshPOT();

            /**
             * The map of render context textures where this is bound
             *
             * @member {Object}
             * @private
             */
            this._glTextures = {};

            /**
             * Used by TextureSystem to only update texture to the GPU when needed.
             * Please call `update()` to increment it.
             *
             * @readonly
             * @member {number}
             */
            this.dirtyId = 0;

            /**
             * Used by TextureSystem to only update texture style when needed.
             *
             * @protected
             * @member {number}
             */
            this.dirtyStyleId = 0;

            /**
             * Currently default cache ID.
             *
             * @member {string}
             */
            this.cacheId = null;

            /**
             * Generally speaking means when resource is loaded.
             * @readonly
             * @member {boolean}
             */
            this.valid = width > 0 && height > 0;

            /**
             * The collection of alternative cache ids, since some BaseTextures
             * can have more than one ID, short name and longer full URL
             *
             * @member {Array<string>}
             * @readonly
             */
            this.textureCacheIds = [];

            /**
             * Flag if BaseTexture has been destroyed.
             *
             * @member {boolean}
             * @readonly
             */
            this.destroyed = false;

            /**
             * The resource used by this BaseTexture, there can only
             * be one resource per BaseTexture, but textures can share
             * resources.
             *
             * @member {PIXI.resources.Resource}
             * @readonly
             */
            this.resource = null;

            /**
             * Number of the texture batch, used by multi-texture renderers
             *
             * @member {number}
             */
            this._batchEnabled = 0;

            /**
             * Location inside texture batch, used by multi-texture renderers
             *
             * @member {number}
             */
            this._batchLocation = 0;

            /**
             * Fired when a not-immediately-available source finishes loading.
             *
             * @protected
             * @event PIXI.BaseTexture#loaded
             * @param {PIXI.BaseTexture} baseTexture - Resource loaded.
             */

            /**
             * Fired when a not-immediately-available source fails to load.
             *
             * @protected
             * @event PIXI.BaseTexture#error
             * @param {PIXI.BaseTexture} baseTexture - Resource errored.
             * @param {ErrorEvent} event - Load error event.
             */

            /**
             * Fired when BaseTexture is updated.
             *
             * @protected
             * @event PIXI.BaseTexture#loaded
             * @param {PIXI.BaseTexture} baseTexture - Resource loaded.
             */

            /**
             * Fired when BaseTexture is updated.
             *
             * @protected
             * @event PIXI.BaseTexture#update
             * @param {PIXI.BaseTexture} baseTexture - Instance of texture being updated.
             */

            /**
             * Fired when BaseTexture is destroyed.
             *
             * @protected
             * @event PIXI.BaseTexture#dispose
             * @param {PIXI.BaseTexture} baseTexture - Instance of texture being destroyed.
             */

            // Set the resource
            this.setResource(resource);
        }

        if ( EventEmitter ) BaseTexture.__proto__ = EventEmitter;
        BaseTexture.prototype = Object.create( EventEmitter && EventEmitter.prototype );
        BaseTexture.prototype.constructor = BaseTexture;

        var prototypeAccessors = { realWidth: { configurable: true },realHeight: { configurable: true } };

        /**
         * Pixel width of the source of this texture
         *
         * @readonly
         * @member {number}
         */
        prototypeAccessors.realWidth.get = function ()
        {
            return Math.ceil((this.width * this.resolution) - 1e-4);
        };

        /**
         * Pixel height of the source of this texture
         *
         * @readonly
         * @member {number}
         */
        prototypeAccessors.realHeight.get = function ()
        {
            return Math.ceil((this.height * this.resolution) - 1e-4);
        };

        /**
         * Changes style options of BaseTexture
         *
         * @param {PIXI.SCALE_MODES} [scaleMode] - Pixi scalemode
         * @param {PIXI.MIPMAP_MODES} [mipmap] - enable mipmaps
         * @returns {PIXI.BaseTexture} this
         */
        BaseTexture.prototype.setStyle = function setStyle (scaleMode, mipmap)
        {
            var dirty;

            if (scaleMode !== undefined && scaleMode !== this.scaleMode)
            {
                this.scaleMode = scaleMode;
                dirty = true;
            }

            if (mipmap !== undefined && mipmap !== this.mipmap)
            {
                this.mipmap = mipmap;
                dirty = true;
            }

            if (dirty)
            {
                this.dirtyStyleId++;
            }

            return this;
        };

        /**
         * Changes w/h/resolution. Texture becomes valid if width and height are greater than zero.
         *
         * @param {number} width Visual width
         * @param {number} height Visual height
         * @param {number} [resolution] Optionally set resolution
         * @returns {PIXI.BaseTexture} this
         */
        BaseTexture.prototype.setSize = function setSize (width, height, resolution)
        {
            this.resolution = resolution || this.resolution;
            this.width = width;
            this.height = height;
            this._refreshPOT();
            this.update();

            return this;
        };

        /**
         * Sets real size of baseTexture, preserves current resolution.
         *
         * @param {number} realWidth Full rendered width
         * @param {number} realHeight Full rendered height
         * @param {number} [resolution] Optionally set resolution
         * @returns {PIXI.BaseTexture} this
         */
        BaseTexture.prototype.setRealSize = function setRealSize (realWidth, realHeight, resolution)
        {
            this.resolution = resolution || this.resolution;
            this.width = realWidth / this.resolution;
            this.height = realHeight / this.resolution;
            this._refreshPOT();
            this.update();

            return this;
        };

        /**
         * Refresh check for isPowerOfTwo texture based on size
         *
         * @private
         */
        BaseTexture.prototype._refreshPOT = function _refreshPOT ()
        {
            this.isPowerOfTwo = utils.isPow2(this.realWidth) && utils.isPow2(this.realHeight);
        };

        /**
         * Changes resolution
         *
         * @param {number} [resolution] res
         * @returns {PIXI.BaseTexture} this
         */
        BaseTexture.prototype.setResolution = function setResolution (resolution)
        {
            var oldResolution = this.resolution;

            if (oldResolution === resolution)
            {
                return this;
            }

            this.resolution = resolution;

            if (this.valid)
            {
                this.width = this.width * oldResolution / resolution;
                this.height = this.height * oldResolution / resolution;
                this.emit('update', this);
            }

            this._refreshPOT();

            return this;
        };

        /**
         * Sets the resource if it wasn't set. Throws error if resource already present
         *
         * @param {PIXI.resources.Resource} resource - that is managing this BaseTexture
         * @returns {PIXI.BaseTexture} this
         */
        BaseTexture.prototype.setResource = function setResource (resource)
        {
            if (this.resource === resource)
            {
                return this;
            }

            if (this.resource)
            {
                throw new Error('Resource can be set only once');
            }

            resource.bind(this);

            this.resource = resource;

            return this;
        };

        /**
         * Invalidates the object. Texture becomes valid if width and height are greater than zero.
         */
        BaseTexture.prototype.update = function update ()
        {
            if (!this.valid)
            {
                if (this.width > 0 && this.height > 0)
                {
                    this.valid = true;
                    this.emit('loaded', this);
                    this.emit('update', this);
                }
            }
            else
            {
                this.dirtyId++;
                this.dirtyStyleId++;
                this.emit('update', this);
            }
        };

        /**
         * Handle errors with resources.
         * @private
         * @param {ErrorEvent} event - Error event emitted.
         */
        BaseTexture.prototype.onError = function onError (event)
        {
            this.emit('error', this, event);
        };

        /**
         * Destroys this base texture.
         * The method stops if resource doesn't want this texture to be destroyed.
         * Removes texture from all caches.
         */
        BaseTexture.prototype.destroy = function destroy ()
        {
            // remove and destroy the resource
            if (this.resource)
            {
                this.resource.unbind(this);
                // only destroy resourced created internally
                if (this.resource.internal)
                {
                    this.resource.destroy();
                }
                this.resource = null;
            }

            if (this.cacheId)
            {
                delete utils.BaseTextureCache[this.cacheId];
                delete utils.TextureCache[this.cacheId];

                this.cacheId = null;
            }

            // finally let the WebGL renderer know..
            this.dispose();

            BaseTexture.removeFromCache(this);
            this.textureCacheIds = null;

            this.destroyed = true;
        };

        /**
         * Frees the texture from WebGL memory without destroying this texture object.
         * This means you can still use the texture later which will upload it to GPU
         * memory again.
         *
         * @fires PIXI.BaseTexture#dispose
         */
        BaseTexture.prototype.dispose = function dispose ()
        {
            this.emit('dispose', this);
        };

        /**
         * Helper function that creates a base texture based on the source you provide.
         * The source can be - image url, image element, canvas element. If the
         * source is an image url or an image element and not in the base texture
         * cache, it will be created and loaded.
         *
         * @static
         * @param {string|HTMLImageElement|HTMLCanvasElement|SVGElement|HTMLVideoElement} source - The
         *        source to create base texture from.
         * @param {object} [options] See {@link PIXI.BaseTexture}'s constructor for options.
         * @param {boolean} [strict] Enforce strict-mode, see {@link PIXI.settings.STRICT_TEXTURE_CACHE}.
         * @returns {PIXI.BaseTexture} The new base texture.
         */
        BaseTexture.from = function from (source, options, strict)
        {
            if ( strict === void 0 ) strict = settings.settings.STRICT_TEXTURE_CACHE;

            var isFrame = typeof source === 'string';
            var cacheId = null;

            if (isFrame)
            {
                cacheId = source;
            }
            else
            {
                if (!source._pixiId)
                {
                    source._pixiId = "pixiid_" + (utils.uid());
                }

                cacheId = source._pixiId;
            }

            var baseTexture = utils.BaseTextureCache[cacheId];

            // Strict-mode rejects invalid cacheIds
            if (isFrame && strict && !baseTexture)
            {
                throw new Error(("The cacheId \"" + cacheId + "\" does not exist in BaseTextureCache."));
            }

            if (!baseTexture)
            {
                baseTexture = new BaseTexture(source, options);
                baseTexture.cacheId = cacheId;
                BaseTexture.addToCache(baseTexture, cacheId);
            }

            return baseTexture;
        };

        /**
         * Create a new BaseTexture with a BufferResource from a Float32Array.
         * RGBA values are floats from 0 to 1.
         * @static
         * @param {Float32Array|Uint8Array} buffer The optional array to use, if no data
         *        is provided, a new Float32Array is created.
         * @param {number} width - Width of the resource
         * @param {number} height - Height of the resource
         * @param {object} [options] See {@link PIXI.BaseTexture}'s constructor for options.
         * @return {PIXI.BaseTexture} The resulting new BaseTexture
         */
        BaseTexture.fromBuffer = function fromBuffer (buffer, width, height, options)
        {
            buffer = buffer || new Float32Array(width * height * 4);

            var resource = new BufferResource(buffer, { width: width, height: height });
            var type = buffer instanceof Float32Array ? constants.TYPES.FLOAT : constants.TYPES.UNSIGNED_BYTE;

            return new BaseTexture(resource, Object.assign(defaultBufferOptions, options || { width: width, height: height, type: type }));
        };

        /**
         * Adds a BaseTexture to the global BaseTextureCache. This cache is shared across the whole PIXI object.
         *
         * @static
         * @param {PIXI.BaseTexture} baseTexture - The BaseTexture to add to the cache.
         * @param {string} id - The id that the BaseTexture will be stored against.
         */
        BaseTexture.addToCache = function addToCache (baseTexture, id)
        {
            if (id)
            {
                if (baseTexture.textureCacheIds.indexOf(id) === -1)
                {
                    baseTexture.textureCacheIds.push(id);
                }

                if (utils.BaseTextureCache[id])
                {
                    // eslint-disable-next-line no-console
                    console.warn(("BaseTexture added to the cache with an id [" + id + "] that already had an entry"));
                }

                utils.BaseTextureCache[id] = baseTexture;
            }
        };

        /**
         * Remove a BaseTexture from the global BaseTextureCache.
         *
         * @static
         * @param {string|PIXI.BaseTexture} baseTexture - id of a BaseTexture to be removed, or a BaseTexture instance itself.
         * @return {PIXI.BaseTexture|null} The BaseTexture that was removed.
         */
        BaseTexture.removeFromCache = function removeFromCache (baseTexture)
        {
            if (typeof baseTexture === 'string')
            {
                var baseTextureFromCache = utils.BaseTextureCache[baseTexture];

                if (baseTextureFromCache)
                {
                    var index = baseTextureFromCache.textureCacheIds.indexOf(baseTexture);

                    if (index > -1)
                    {
                        baseTextureFromCache.textureCacheIds.splice(index, 1);
                    }

                    delete utils.BaseTextureCache[baseTexture];

                    return baseTextureFromCache;
                }
            }
            else if (baseTexture && baseTexture.textureCacheIds)
            {
                for (var i = 0; i < baseTexture.textureCacheIds.length; ++i)
                {
                    delete utils.BaseTextureCache[baseTexture.textureCacheIds[i]];
                }

                baseTexture.textureCacheIds.length = 0;

                return baseTexture;
            }

            return null;
        };

        Object.defineProperties( BaseTexture.prototype, prototypeAccessors );

        return BaseTexture;
    }(utils.EventEmitter));

    /**
     * Global number of the texture batch, used by multi-texture renderers
     *
     * @static
     * @member {number}
     */
    BaseTexture._globalBatch = 0;

    /**
     * A resource that contains a number of sources.
     *
     * @class
     * @extends PIXI.resources.Resource
     * @memberof PIXI.resources
     * @param {number|Array<*>} source - Number of items in array or the collection
     *        of image URLs to use. Can also be resources, image elements, canvas, etc.
     * @param {object} [options] Options to apply to {@link PIXI.resources.autoDetectResource}
     * @param {number} [options.width] - Width of the resource
     * @param {number} [options.height] - Height of the resource
     */
    var ArrayResource = /*@__PURE__*/(function (Resource) {
        function ArrayResource(source, options)
        {
            options = options || {};

            var urls;
            var length = source;

            if (Array.isArray(source))
            {
                urls = source;
                length = source.length;
            }

            Resource.call(this, options.width, options.height);

            /**
             * Collection of resources.
             * @member {Array<PIXI.BaseTexture>}
             * @readonly
             */
            this.items = [];

            /**
             * Dirty IDs for each part
             * @member {Array<number>}
             * @readonly
             */
            this.itemDirtyIds = [];

            for (var i = 0; i < length; i++)
            {
                var partTexture = new BaseTexture();

                this.items.push(partTexture);
                this.itemDirtyIds.push(-1);
            }

            /**
             * Number of elements in array
             *
             * @member {number}
             * @readonly
             */
            this.length = length;

            /**
             * Promise when loading
             * @member {Promise}
             * @private
             * @default null
             */
            this._load = null;

            if (urls)
            {
                for (var i$1 = 0; i$1 < length; i$1++)
                {
                    this.addResourceAt(autoDetectResource(urls[i$1], options), i$1);
                }
            }
        }

        if ( Resource ) ArrayResource.__proto__ = Resource;
        ArrayResource.prototype = Object.create( Resource && Resource.prototype );
        ArrayResource.prototype.constructor = ArrayResource;

        /**
         * Destroy this BaseImageResource
         * @override
         */
        ArrayResource.prototype.dispose = function dispose ()
        {
            for (var i = 0, len = this.length; i < len; i++)
            {
                this.items[i].destroy();
            }
            this.items = null;
            this.itemDirtyIds = null;
            this._load = null;
        };

        /**
         * Set a resource by ID
         *
         * @param {PIXI.resources.Resource} resource
         * @param {number} index - Zero-based index of resource to set
         * @return {PIXI.resources.ArrayResource} Instance for chaining
         */
        ArrayResource.prototype.addResourceAt = function addResourceAt (resource, index)
        {
            var baseTexture = this.items[index];

            if (!baseTexture)
            {
                throw new Error(("Index " + index + " is out of bounds"));
            }

            // Inherit the first resource dimensions
            if (resource.valid && !this.valid)
            {
                this.resize(resource.width, resource.height);
            }

            this.items[index].setResource(resource);

            return this;
        };

        /**
         * Set the parent base texture
         * @member {PIXI.BaseTexture}
         * @override
         */
        ArrayResource.prototype.bind = function bind (baseTexture)
        {
            Resource.prototype.bind.call(this, baseTexture);

            baseTexture.target = constants.TARGETS.TEXTURE_2D_ARRAY;

            for (var i = 0; i < this.length; i++)
            {
                this.items[i].on('update', baseTexture.update, baseTexture);
            }
        };

        /**
         * Unset the parent base texture
         * @member {PIXI.BaseTexture}
         * @override
         */
        ArrayResource.prototype.unbind = function unbind (baseTexture)
        {
            Resource.prototype.unbind.call(this, baseTexture);

            for (var i = 0; i < this.length; i++)
            {
                this.items[i].off('update', baseTexture.update, baseTexture);
            }
        };

        /**
         * Load all the resources simultaneously
         * @override
         * @return {Promise<void>} When load is resolved
         */
        ArrayResource.prototype.load = function load ()
        {
            var this$1 = this;

            if (this._load)
            {
                return this._load;
            }

            var resources = this.items.map(function (item) { return item.resource; });

            // TODO: also implement load part-by-part strategy
            var promises = resources.map(function (item) { return item.load(); });

            this._load = Promise.all(promises)
                .then(function () {
                    var ref = resources[0];
                    var width = ref.width;
                    var height = ref.height;

                    this$1.resize(width, height);

                    return Promise.resolve(this$1);
                }
                );

            return this._load;
        };

        /**
         * Upload the resources to the GPU.
         * @param {PIXI.Renderer} renderer
         * @param {PIXI.BaseTexture} texture
         * @param {PIXI.GLTexture} glTexture
         * @returns {boolean} whether texture was uploaded
         */
        ArrayResource.prototype.upload = function upload (renderer, texture, glTexture)
        {
            var ref = this;
            var length = ref.length;
            var itemDirtyIds = ref.itemDirtyIds;
            var items = ref.items;
            var gl = renderer.gl;

            if (glTexture.dirtyId < 0)
            {
                gl.texImage3D(
                    gl.TEXTURE_2D_ARRAY,
                    0,
                    texture.format,
                    this._width,
                    this._height,
                    length,
                    0,
                    texture.format,
                    texture.type,
                    null
                );
            }

            for (var i = 0; i < length; i++)
            {
                var item = items[i];

                if (itemDirtyIds[i] < item.dirtyId)
                {
                    itemDirtyIds[i] = item.dirtyId;
                    if (item.valid)
                    {
                        gl.texSubImage3D(
                            gl.TEXTURE_2D_ARRAY,
                            0,
                            0, // xoffset
                            0, // yoffset
                            i, // zoffset
                            item.resource.width,
                            item.resource.height,
                            1,
                            texture.format,
                            texture.type,
                            item.resource.source
                        );
                    }
                }
            }

            return true;
        };

        return ArrayResource;
    }(Resource));

    /**
     * @interface OffscreenCanvas
     */

    /**
     * Resource type for HTMLCanvasElement.
     * @class
     * @extends PIXI.resources.BaseImageResource
     * @memberof PIXI.resources
     * @param {HTMLCanvasElement} source - Canvas element to use
     */
    var CanvasResource = /*@__PURE__*/(function (BaseImageResource) {
        function CanvasResource () {
            BaseImageResource.apply(this, arguments);
        }

        if ( BaseImageResource ) CanvasResource.__proto__ = BaseImageResource;
        CanvasResource.prototype = Object.create( BaseImageResource && BaseImageResource.prototype );
        CanvasResource.prototype.constructor = CanvasResource;

        CanvasResource.test = function test (source)
        {
            var OffscreenCanvas = window.OffscreenCanvas;

            // Check for browsers that don't yet support OffscreenCanvas
            if (OffscreenCanvas && source instanceof OffscreenCanvas)
            {
                return true;
            }

            return source instanceof HTMLCanvasElement;
        };

        return CanvasResource;
    }(BaseImageResource));

    /**
     * Resource for a CubeTexture which contains six resources.
     *
     * @class
     * @extends PIXI.resources.ArrayResource
     * @memberof PIXI.resources
     * @param {Array<string|PIXI.resources.Resource>} [source] Collection of URLs or resources
     *        to use as the sides of the cube.
     * @param {object} [options] - ImageResource options
     * @param {number} [options.width] - Width of resource
     * @param {number} [options.height] - Height of resource
     */
    var CubeResource = /*@__PURE__*/(function (ArrayResource) {
        function CubeResource(source, options)
        {
            options = options || {};

            ArrayResource.call(this, source, options);

            if (this.length !== CubeResource.SIDES)
            {
                throw new Error(("Invalid length. Got " + (this.length) + ", expected 6"));
            }

            for (var i = 0; i < CubeResource.SIDES; i++)
            {
                this.items[i].target = constants.TARGETS.TEXTURE_CUBE_MAP_POSITIVE_X + i;
            }

            if (options.autoLoad !== false)
            {
                this.load();
            }
        }

        if ( ArrayResource ) CubeResource.__proto__ = ArrayResource;
        CubeResource.prototype = Object.create( ArrayResource && ArrayResource.prototype );
        CubeResource.prototype.constructor = CubeResource;

        /**
         * Add binding
         *
         * @override
         * @param {PIXI.BaseTexture} baseTexture - parent base texture
         */
        CubeResource.prototype.bind = function bind (baseTexture)
        {
            ArrayResource.prototype.bind.call(this, baseTexture);

            baseTexture.target = constants.TARGETS.TEXTURE_CUBE_MAP;
        };

        /**
         * Upload the resource
         *
         * @returns {boolean} true is success
         */
        CubeResource.prototype.upload = function upload (renderer, baseTexture, glTexture)
        {
            var dirty = this.itemDirtyIds;

            for (var i = 0; i < CubeResource.SIDES; i++)
            {
                var side = this.items[i];

                if (dirty[i] < side.dirtyId)
                {
                    dirty[i] = side.dirtyId;
                    if (side.valid)
                    {
                        side.resource.upload(renderer, side, glTexture);
                    }
                    else
                    {
                        // TODO: upload zero buffer
                    }
                }
            }

            return true;
        };

        return CubeResource;
    }(ArrayResource));

    /**
     * Number of texture sides to store for CubeResources
     *
     * @name PIXI.resources.CubeResource.SIDES
     * @static
     * @member {number}
     * @default 6
     */
    CubeResource.SIDES = 6;

    /**
     * Resource type for SVG elements and graphics.
     * @class
     * @extends PIXI.resources.BaseImageResource
     * @memberof PIXI.resources
     * @param {string} source - Base64 encoded SVG element or URL for SVG file.
     * @param {object} [options] - Options to use
     * @param {number} [options.scale=1] Scale to apply to SVG. Overridden by...
     * @param {number} [options.width] Rasterize SVG this wide. Aspect ratio preserved if height not specified.
     * @param {number} [options.height] Rasterize SVG this high. Aspect ratio preserved if width not specified.
     * @param {boolean} [options.autoLoad=true] Start loading right away.
     */
    var SVGResource = /*@__PURE__*/(function (BaseImageResource) {
        function SVGResource(source, options)
        {
            options = options || {};

            BaseImageResource.call(this, document.createElement('canvas'));
            this._width = 0;
            this._height = 0;

            /**
             * Base64 encoded SVG element or URL for SVG file
             * @readonly
             * @member {string}
             */
            this.svg = source;

            /**
             * The source scale to apply when rasterizing on load
             * @readonly
             * @member {number}
             */
            this.scale = options.scale || 1;

            /**
             * A width override for rasterization on load
             * @readonly
             * @member {number}
             */
            this._overrideWidth = options.width;

            /**
             * A height override for rasterization on load
             * @readonly
             * @member {number}
             */
            this._overrideHeight = options.height;

            /**
             * Call when completely loaded
             * @private
             * @member {function}
             */
            this._resolve = null;

            /**
             * Cross origin value to use
             * @private
             * @member {boolean|string}
             */
            this._crossorigin = options.crossorigin;

            /**
             * Promise when loading
             * @member {Promise<void>}
             * @private
             * @default null
             */
            this._load = null;

            if (options.autoLoad !== false)
            {
                this.load();
            }
        }

        if ( BaseImageResource ) SVGResource.__proto__ = BaseImageResource;
        SVGResource.prototype = Object.create( BaseImageResource && BaseImageResource.prototype );
        SVGResource.prototype.constructor = SVGResource;

        SVGResource.prototype.load = function load ()
        {
            var this$1 = this;

            if (this._load)
            {
                return this._load;
            }

            this._load = new Promise(function (resolve) {
                // Save this until after load is finished
                this$1._resolve = function () {
                    this$1.resize(this$1.source.width, this$1.source.height);
                    resolve(this$1);
                };

                // Convert SVG inline string to data-uri
                if ((/^\<svg/).test(this$1.svg.trim()))
                {
                    if (!btoa)
                    {
                        throw new Error('Your browser doesn\'t support base64 conversions.');
                    }
                    this$1.svg = "data:image/svg+xml;base64," + (btoa(unescape(encodeURIComponent(this$1.svg))));
                }

                this$1._loadSvg();
            });

            return this._load;
        };

        /**
         * Loads an SVG image from `imageUrl` or `data URL`.
         *
         * @private
         */
        SVGResource.prototype._loadSvg = function _loadSvg ()
        {
            var this$1 = this;

            var tempImage = new Image();

            BaseImageResource.crossOrigin(tempImage, this.svg, this._crossorigin);
            tempImage.src = this.svg;

            tempImage.onerror = function (event) {
                tempImage.onerror = null;
                this$1.onError.run(event);
            };

            tempImage.onload = function () {
                var svgWidth = tempImage.width;
                var svgHeight = tempImage.height;

                if (!svgWidth || !svgHeight)
                {
                    throw new Error('The SVG image must have width and height defined (in pixels), canvas API needs them.');
                }

                // Set render size
                var width = svgWidth * this$1.scale;
                var height = svgHeight * this$1.scale;

                if (this$1._overrideWidth || this$1._overrideHeight)
                {
                    width = this$1._overrideWidth || this$1._overrideHeight / svgHeight * svgWidth;
                    height = this$1._overrideHeight || this$1._overrideWidth / svgWidth * svgHeight;
                }
                width = Math.round(width);
                height = Math.round(height);

                // Create a canvas element
                var canvas = this$1.source;

                canvas.width = width;
                canvas.height = height;
                canvas._pixiId = "canvas_" + (utils.uid());

                // Draw the Svg to the canvas
                canvas
                    .getContext('2d')
                    .drawImage(tempImage, 0, 0, svgWidth, svgHeight, 0, 0, width, height);

                this$1._resolve();
                this$1._resolve = null;
            };
        };

        /**
         * Get size from an svg string using regexp.
         *
         * @method
         * @param {string} svgString - a serialized svg element
         * @return {PIXI.ISize} image extension
         */
        SVGResource.getSize = function getSize (svgString)
        {
            var sizeMatch = SVGResource.SVG_SIZE.exec(svgString);
            var size = {};

            if (sizeMatch)
            {
                size[sizeMatch[1]] = Math.round(parseFloat(sizeMatch[3]));
                size[sizeMatch[5]] = Math.round(parseFloat(sizeMatch[7]));
            }

            return size;
        };

        /**
         * Destroys this texture
         * @override
         */
        SVGResource.prototype.dispose = function dispose ()
        {
            BaseImageResource.prototype.dispose.call(this);
            this._resolve = null;
            this._crossorigin = null;
        };

        /**
         * Used to auto-detect the type of resource.
         *
         * @static
         * @param {*} source - The source object
         * @param {string} extension - The extension of source, if set
         */
        SVGResource.test = function test (source, extension)
        {
            // url file extension is SVG
            return extension === 'svg'
                // source is SVG data-uri
                || (typeof source === 'string' && source.indexOf('data:image/svg+xml;base64') === 0)
                // source is SVG inline
                || (typeof source === 'string' && source.indexOf('<svg') === 0);
        };

        return SVGResource;
    }(BaseImageResource));

    /**
     * RegExp for SVG size.
     *
     * @static
     * @constant {RegExp|string} SVG_SIZE
     * @memberof PIXI.resources.SVGResource
     * @example &lt;svg width="100" height="100"&gt;&lt;/svg&gt;
     */
    SVGResource.SVG_SIZE = /<svg[^>]*(?:\s(width|height)=('|")(\d*(?:\.\d+)?)(?:px)?('|"))[^>]*(?:\s(width|height)=('|")(\d*(?:\.\d+)?)(?:px)?('|"))[^>]*>/i; // eslint-disable-line max-len

    /**
     * Resource type for HTMLVideoElement.
     * @class
     * @extends PIXI.resources.BaseImageResource
     * @memberof PIXI.resources
     * @param {HTMLVideoElement|object|string|Array<string|object>} source - Video element to use.
     * @param {object} [options] - Options to use
     * @param {boolean} [options.autoLoad=true] - Start loading the video immediately
     * @param {boolean} [options.autoPlay=true] - Start playing video immediately
     * @param {number} [options.updateFPS=0] - How many times a second to update the texture from the video.
     * Leave at 0 to update at every render.
     * @param {boolean} [options.crossorigin=true] - Load image using cross origin
     */
    var VideoResource = /*@__PURE__*/(function (BaseImageResource) {
        function VideoResource(source, options)
        {
            options = options || {};

            if (!(source instanceof HTMLVideoElement))
            {
                var videoElement = document.createElement('video');

                // workaround for https://github.com/pixijs/pixi.js/issues/5996
                videoElement.setAttribute('preload', 'auto');
                videoElement.setAttribute('webkit-playsinline', '');
                videoElement.setAttribute('playsinline', '');

                if (typeof source === 'string')
                {
                    source = [source];
                }

                BaseImageResource.crossOrigin(videoElement, (source[0].src || source[0]), options.crossorigin);

                // array of objects or strings
                for (var i = 0; i < source.length; ++i)
                {
                    var sourceElement = document.createElement('source');

                    var ref = source[i];
                    var src = ref.src;
                    var mime = ref.mime;

                    src = src || source[i];

                    var baseSrc = src.split('?').shift().toLowerCase();
                    var ext = baseSrc.substr(baseSrc.lastIndexOf('.') + 1);

                    mime = mime || ("video/" + ext);

                    sourceElement.src = src;
                    sourceElement.type = mime;

                    videoElement.appendChild(sourceElement);
                }

                // Override the source
                source = videoElement;
            }

            BaseImageResource.call(this, source);

            this.noSubImage = true;
            this._autoUpdate = true;
            this._isAutoUpdating = false;
            this._updateFPS = options.updateFPS || 0;
            this._msToNextUpdate = 0;

            /**
             * When set to true will automatically play videos used by this texture once
             * they are loaded. If false, it will not modify the playing state.
             *
             * @member {boolean}
             * @default true
             */
            this.autoPlay = options.autoPlay !== false;

            /**
             * Promise when loading
             * @member {Promise<void>}
             * @private
             * @default null
             */
            this._load = null;

            /**
             * Callback when completed with load.
             * @member {function}
             * @private
             */
            this._resolve = null;

            // Bind for listeners
            this._onCanPlay = this._onCanPlay.bind(this);
            this._onError = this._onError.bind(this);

            if (options.autoLoad !== false)
            {
                this.load();
            }
        }

        if ( BaseImageResource ) VideoResource.__proto__ = BaseImageResource;
        VideoResource.prototype = Object.create( BaseImageResource && BaseImageResource.prototype );
        VideoResource.prototype.constructor = VideoResource;

        var prototypeAccessors = { autoUpdate: { configurable: true },updateFPS: { configurable: true } };

        /**
         * Trigger updating of the texture
         *
         * @param {number} [deltaTime=0] - time delta since last tick
         */
        VideoResource.prototype.update = function update (deltaTime)
        {
            if ( deltaTime === void 0 ) deltaTime = 0;

            if (!this.destroyed)
            {
                // account for if video has had its playbackRate changed
                var elapsedMS = ticker.Ticker.shared.elapsedMS * this.source.playbackRate;

                this._msToNextUpdate = Math.floor(this._msToNextUpdate - elapsedMS);
                if (!this._updateFPS || this._msToNextUpdate <= 0)
                {
                    BaseImageResource.prototype.update.call(this, deltaTime);
                    this._msToNextUpdate = this._updateFPS ? Math.floor(1000 / this._updateFPS) : 0;
                }
            }
        };

        /**
         * Start preloading the video resource.
         *
         * @protected
         * @return {Promise<void>} Handle the validate event
         */
        VideoResource.prototype.load = function load ()
        {
            var this$1 = this;

            if (this._load)
            {
                return this._load;
            }

            var source = this.source;

            if ((source.readyState === source.HAVE_ENOUGH_DATA || source.readyState === source.HAVE_FUTURE_DATA)
                && source.width && source.height)
            {
                source.complete = true;
            }

            source.addEventListener('play', this._onPlayStart.bind(this));
            source.addEventListener('pause', this._onPlayStop.bind(this));

            if (!this._isSourceReady())
            {
                source.addEventListener('canplay', this._onCanPlay);
                source.addEventListener('canplaythrough', this._onCanPlay);
                source.addEventListener('error', this._onError, true);
            }
            else
            {
                this._onCanPlay();
            }

            this._load = new Promise(function (resolve) {
                if (this$1.valid)
                {
                    resolve(this$1);
                }
                else
                {
                    this$1._resolve = resolve;

                    source.load();
                }
            });

            return this._load;
        };

        /**
         * Handle video error events.
         *
         * @private
         */
        VideoResource.prototype._onError = function _onError ()
        {
            this.source.removeEventListener('error', this._onError, true);
            this.onError.run(event);
        };

        /**
         * Returns true if the underlying source is playing.
         *
         * @private
         * @return {boolean} True if playing.
         */
        VideoResource.prototype._isSourcePlaying = function _isSourcePlaying ()
        {
            var source = this.source;

            return (source.currentTime > 0 && source.paused === false && source.ended === false && source.readyState > 2);
        };

        /**
         * Returns true if the underlying source is ready for playing.
         *
         * @private
         * @return {boolean} True if ready.
         */
        VideoResource.prototype._isSourceReady = function _isSourceReady ()
        {
            return this.source.readyState === 3 || this.source.readyState === 4;
        };

        /**
         * Runs the update loop when the video is ready to play
         *
         * @private
         */
        VideoResource.prototype._onPlayStart = function _onPlayStart ()
        {
            // Just in case the video has not received its can play even yet..
            if (!this.valid)
            {
                this._onCanPlay();
            }

            if (!this._isAutoUpdating && this.autoUpdate)
            {
                ticker.Ticker.shared.add(this.update, this);
                this._isAutoUpdating = true;
            }
        };

        /**
         * Fired when a pause event is triggered, stops the update loop
         *
         * @private
         */
        VideoResource.prototype._onPlayStop = function _onPlayStop ()
        {
            if (this._isAutoUpdating)
            {
                ticker.Ticker.shared.remove(this.update, this);
                this._isAutoUpdating = false;
            }
        };

        /**
         * Fired when the video is loaded and ready to play
         *
         * @private
         */
        VideoResource.prototype._onCanPlay = function _onCanPlay ()
        {
            var ref = this;
            var source = ref.source;

            source.removeEventListener('canplay', this._onCanPlay);
            source.removeEventListener('canplaythrough', this._onCanPlay);

            var valid = this.valid;

            this.resize(source.videoWidth, source.videoHeight);

            // prevent multiple loaded dispatches..
            if (!valid && this._resolve)
            {
                this._resolve(this);
                this._resolve = null;
            }

            if (this._isSourcePlaying())
            {
                this._onPlayStart();
            }
            else if (this.autoPlay)
            {
                source.play();
            }
        };

        /**
         * Destroys this texture
         * @override
         */
        VideoResource.prototype.dispose = function dispose ()
        {
            if (this._isAutoUpdating)
            {
                ticker.Ticker.shared.remove(this.update, this);
            }

            if (this.source)
            {
                this.source.removeEventListener('error', this._onError, true);
                this.source.pause();
                this.source.src = '';
                this.source.load();
            }
            BaseImageResource.prototype.dispose.call(this);
        };

        /**
         * Should the base texture automatically update itself, set to true by default
         *
         * @member {boolean}
         */
        prototypeAccessors.autoUpdate.get = function ()
        {
            return this._autoUpdate;
        };

        prototypeAccessors.autoUpdate.set = function (value) // eslint-disable-line require-jsdoc
        {
            if (value !== this._autoUpdate)
            {
                this._autoUpdate = value;

                if (!this._autoUpdate && this._isAutoUpdating)
                {
                    ticker.Ticker.shared.remove(this.update, this);
                    this._isAutoUpdating = false;
                }
                else if (this._autoUpdate && !this._isAutoUpdating)
                {
                    ticker.Ticker.shared.add(this.update, this);
                    this._isAutoUpdating = true;
                }
            }
        };

        /**
         * How many times a second to update the texture from the video. Leave at 0 to update at every render.
         * A lower fps can help performance, as updating the texture at 60fps on a 30ps video may not be efficient.
         *
         * @member {number}
         */
        prototypeAccessors.updateFPS.get = function ()
        {
            return this._updateFPS;
        };

        prototypeAccessors.updateFPS.set = function (value) // eslint-disable-line require-jsdoc
        {
            if (value !== this._updateFPS)
            {
                this._updateFPS = value;
            }
        };

        /**
         * Used to auto-detect the type of resource.
         *
         * @static
         * @param {*} source - The source object
         * @param {string} extension - The extension of source, if set
         * @return {boolean} `true` if video source
         */
        VideoResource.test = function test (source, extension)
        {
            return (source instanceof HTMLVideoElement)
                || VideoResource.TYPES.indexOf(extension) > -1;
        };

        Object.defineProperties( VideoResource.prototype, prototypeAccessors );

        return VideoResource;
    }(BaseImageResource));

    /**
     * List of common video file extensions supported by VideoResource.
     * @constant
     * @member {Array<string>}
     * @static
     * @readonly
     */
    VideoResource.TYPES = ['mp4', 'm4v', 'webm', 'ogg', 'ogv', 'h264', 'avi', 'mov'];

    /**
     * Resource type for ImageBitmap.
     * @class
     * @extends PIXI.resources.BaseImageResource
     * @memberof PIXI.resources
     * @param {ImageBitmap} source - Image element to use
     */
    var ImageBitmapResource = /*@__PURE__*/(function (BaseImageResource) {
        function ImageBitmapResource () {
            BaseImageResource.apply(this, arguments);
        }

        if ( BaseImageResource ) ImageBitmapResource.__proto__ = BaseImageResource;
        ImageBitmapResource.prototype = Object.create( BaseImageResource && BaseImageResource.prototype );
        ImageBitmapResource.prototype.constructor = ImageBitmapResource;

        ImageBitmapResource.test = function test (source)
        {
            return !!window.createImageBitmap && source instanceof ImageBitmap;
        };

        return ImageBitmapResource;
    }(BaseImageResource));

    INSTALLED.push(
        ImageResource,
        ImageBitmapResource,
        CanvasResource,
        VideoResource,
        SVGResource,
        BufferResource,
        CubeResource,
        ArrayResource
    );

    var index = ({
        INSTALLED: INSTALLED,
        autoDetectResource: autoDetectResource,
        ArrayResource: ArrayResource,
        BufferResource: BufferResource,
        CanvasResource: CanvasResource,
        CubeResource: CubeResource,
        ImageResource: ImageResource,
        ImageBitmapResource: ImageBitmapResource,
        SVGResource: SVGResource,
        VideoResource: VideoResource,
        Resource: Resource,
        BaseImageResource: BaseImageResource
    });

    /**
     * System is a base class used for extending systems used by the {@link PIXI.Renderer}
     *
     * @see PIXI.Renderer#addSystem
     * @class
     * @memberof PIXI
     */
    var System = function System(renderer)
    {
        /**
         * The renderer this manager works for.
         *
         * @member {PIXI.Renderer}
         */
        this.renderer = renderer;
    };

    /**
     * Generic destroy methods to be overridden by the subclass
     */
    System.prototype.destroy = function destroy ()
    {
        this.renderer = null;
    };

    /**
     * Resource type for DepthTexture.
     * @class
     * @extends PIXI.resources.BufferResource
     * @memberof PIXI.resources
     */
    var DepthResource = /*@__PURE__*/(function (BufferResource) {
        function DepthResource () {
            BufferResource.apply(this, arguments);
        }

        if ( BufferResource ) DepthResource.__proto__ = BufferResource;
        DepthResource.prototype = Object.create( BufferResource && BufferResource.prototype );
        DepthResource.prototype.constructor = DepthResource;

        DepthResource.prototype.upload = function upload (renderer, baseTexture, glTexture)
        {
            var gl = renderer.gl;

            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.alphaMode === constants.ALPHA_MODES.UNPACK);

            if (glTexture.width === baseTexture.width && glTexture.height === baseTexture.height)
            {
                gl.texSubImage2D(
                    baseTexture.target,
                    0,
                    0,
                    0,
                    baseTexture.width,
                    baseTexture.height,
                    baseTexture.format,
                    baseTexture.type,
                    this.data
                );
            }
            else
            {
                glTexture.width = baseTexture.width;
                glTexture.height = baseTexture.height;

                gl.texImage2D(
                    baseTexture.target,
                    0,
                    gl.DEPTH_COMPONENT16, // Needed for depth to render properly in webgl2.0
                    baseTexture.width,
                    baseTexture.height,
                    0,
                    baseTexture.format,
                    baseTexture.type,
                    this.data
                );
            }

            return true;
        };

        return DepthResource;
    }(BufferResource));

    /**
     * Frame buffer used by the BaseRenderTexture
     *
     * @class
     * @memberof PIXI
     */
    var Framebuffer = function Framebuffer(width, height)
    {
        this.width = Math.ceil(width || 100);
        this.height = Math.ceil(height || 100);

        this.stencil = false;
        this.depth = false;

        this.dirtyId = 0;
        this.dirtyFormat = 0;
        this.dirtySize = 0;

        this.depthTexture = null;
        this.colorTextures = [];

        this.glFramebuffers = {};

        this.disposeRunner = new runner.Runner('disposeFramebuffer', 2);
    };

    var prototypeAccessors$1 = { colorTexture: { configurable: true } };

    /**
     * Reference to the colorTexture.
     *
     * @member {PIXI.Texture[]}
     * @readonly
     */
    prototypeAccessors$1.colorTexture.get = function ()
    {
        return this.colorTextures[0];
    };

    /**
     * Add texture to the colorTexture array
     *
     * @param {number} [index=0] - Index of the array to add the texture to
     * @param {PIXI.Texture} [texture] - Texture to add to the array
     */
    Framebuffer.prototype.addColorTexture = function addColorTexture (index, texture)
    {
            if ( index === void 0 ) index = 0;

        // TODO add some validation to the texture - same width / height etc?
        this.colorTextures[index] = texture || new BaseTexture(null, { scaleMode: 0,
            resolution: 1,
            mipmap: false,
            width: this.width,
            height: this.height });

        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    };

    /**
     * Add a depth texture to the frame buffer
     *
     * @param {PIXI.Texture} [texture] - Texture to add
     */
    Framebuffer.prototype.addDepthTexture = function addDepthTexture (texture)
    {
        /* eslint-disable max-len */
        this.depthTexture = texture || new BaseTexture(new DepthResource(null, { width: this.width, height: this.height }), { scaleMode: 0,
            resolution: 1,
            width: this.width,
            height: this.height,
            mipmap: false,
            format: constants.FORMATS.DEPTH_COMPONENT,
            type: constants.TYPES.UNSIGNED_SHORT });
        /* eslint-disable max-len */
        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    };

    /**
     * Enable depth on the frame buffer
     */
    Framebuffer.prototype.enableDepth = function enableDepth ()
    {
        this.depth = true;

        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    };

    /**
     * Enable stencil on the frame buffer
     */
    Framebuffer.prototype.enableStencil = function enableStencil ()
    {
        this.stencil = true;

        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    };

    /**
     * Resize the frame buffer
     *
     * @param {number} width - Width of the frame buffer to resize to
     * @param {number} height - Height of the frame buffer to resize to
     */
    Framebuffer.prototype.resize = function resize (width, height)
    {
        width = Math.ceil(width);
        height = Math.ceil(height);

        if (width === this.width && height === this.height) { return; }

        this.width = width;
        this.height = height;

        this.dirtyId++;
        this.dirtySize++;

        for (var i = 0; i < this.colorTextures.length; i++)
        {
            var texture = this.colorTextures[i];
            var resolution = texture.resolution;

            // take into acount the fact the texture may have a different resolution..
            texture.setSize(width / resolution, height / resolution);
        }

        if (this.depthTexture)
        {
            var resolution$1 = this.depthTexture.resolution;

            this.depthTexture.setSize(width / resolution$1, height / resolution$1);
        }
    };

    /**
     * disposes WebGL resources that are connected to this geometry
     */
    Framebuffer.prototype.dispose = function dispose ()
    {
        this.disposeRunner.run(this, false);
    };

    Object.defineProperties( Framebuffer.prototype, prototypeAccessors$1 );

    /**
     * A BaseRenderTexture is a special texture that allows any PixiJS display object to be rendered to it.
     *
     * __Hint__: All DisplayObjects (i.e. Sprites) that render to a BaseRenderTexture should be preloaded
     * otherwise black rectangles will be drawn instead.
     *
     * A BaseRenderTexture takes a snapshot of any Display Object given to its render method. The position
     * and rotation of the given Display Objects is ignored. For example:
     *
     * ```js
     * let renderer = PIXI.autoDetectRenderer();
     * let baseRenderTexture = new PIXI.BaseRenderTexture({ width: 800, height: 600 });
     * let renderTexture = new PIXI.RenderTexture(baseRenderTexture);
     * let sprite = PIXI.Sprite.from("spinObj_01.png");
     *
     * sprite.position.x = 800/2;
     * sprite.position.y = 600/2;
     * sprite.anchor.x = 0.5;
     * sprite.anchor.y = 0.5;
     *
     * renderer.render(sprite, renderTexture);
     * ```
     *
     * The Sprite in this case will be rendered using its local transform. To render this sprite at 0,0
     * you can clear the transform
     *
     * ```js
     *
     * sprite.setTransform()
     *
     * let baseRenderTexture = new PIXI.BaseRenderTexture({ width: 100, height: 100 });
     * let renderTexture = new PIXI.RenderTexture(baseRenderTexture);
     *
     * renderer.render(sprite, renderTexture);  // Renders to center of RenderTexture
     * ```
     *
     * @class
     * @extends PIXI.BaseTexture
     * @memberof PIXI
     */
    var BaseRenderTexture = /*@__PURE__*/(function (BaseTexture) {
        function BaseRenderTexture(options)
        {
            if (typeof options === 'number')
            {
                /* eslint-disable prefer-rest-params */
                // Backward compatibility of signature
                var width$1 = arguments[0];
                var height$1 = arguments[1];
                var scaleMode = arguments[2];
                var resolution = arguments[3];

                options = { width: width$1, height: height$1, scaleMode: scaleMode, resolution: resolution };
                /* eslint-enable prefer-rest-params */
            }

            BaseTexture.call(this, null, options);

            var ref = options || {};
            var width = ref.width;
            var height = ref.height;

            // Set defaults
            this.mipmap = false;
            this.width = Math.ceil(width) || 100;
            this.height = Math.ceil(height) || 100;
            this.valid = true;

            /**
             * A reference to the canvas render target (we only need one as this can be shared across renderers)
             *
             * @protected
             * @member {object}
             */
            this._canvasRenderTarget = null;

            this.clearColor = [0, 0, 0, 0];

            this.framebuffer = new Framebuffer(this.width * this.resolution, this.height * this.resolution)
                .addColorTexture(0, this);

            // TODO - could this be added the systems?

            /**
             * The data structure for the stencil masks.
             *
             * @member {PIXI.MaskData[]}
             */
            this.maskStack = [];

            /**
             * The data structure for the filters.
             *
             * @member {Object[]}
             */
            this.filterStack = [{}];
        }

        if ( BaseTexture ) BaseRenderTexture.__proto__ = BaseTexture;
        BaseRenderTexture.prototype = Object.create( BaseTexture && BaseTexture.prototype );
        BaseRenderTexture.prototype.constructor = BaseRenderTexture;

        /**
         * Resizes the BaseRenderTexture.
         *
         * @param {number} width - The width to resize to.
         * @param {number} height - The height to resize to.
         */
        BaseRenderTexture.prototype.resize = function resize (width, height)
        {
            width = Math.ceil(width);
            height = Math.ceil(height);
            this.framebuffer.resize(width * this.resolution, height * this.resolution);
        };

        /**
         * Frees the texture and framebuffer from WebGL memory without destroying this texture object.
         * This means you can still use the texture later which will upload it to GPU
         * memory again.
         *
         * @fires PIXI.BaseTexture#dispose
         */
        BaseRenderTexture.prototype.dispose = function dispose ()
        {
            this.framebuffer.dispose();

            BaseTexture.prototype.dispose.call(this);
        };

        /**
         * Destroys this texture.
         *
         */
        BaseRenderTexture.prototype.destroy = function destroy ()
        {
            BaseTexture.prototype.destroy.call(this, true);

            this.framebuffer = null;
        };

        return BaseRenderTexture;
    }(BaseTexture));

    /**
     * Stores a texture's frame in UV coordinates, in
     * which everything lies in the rectangle `[(0,0), (1,0),
     * (1,1), (0,1)]`.
     *
     * | Corner       | Coordinates |
     * |--------------|-------------|
     * | Top-Left     | `(x0,y0)`   |
     * | Top-Right    | `(x1,y1)`   |
     * | Bottom-Right | `(x2,y2)`   |
     * | Bottom-Left  | `(x3,y3)`   |
     *
     * @class
     * @protected
     * @memberof PIXI
     */
    var TextureUvs = function TextureUvs()
    {
        /**
         * X-component of top-left corner `(x0,y0)`.
         *
         * @member {number}
         */
        this.x0 = 0;

        /**
         * Y-component of top-left corner `(x0,y0)`.
         *
         * @member {number}
         */
        this.y0 = 0;

        /**
         * X-component of top-right corner `(x1,y1)`.
         *
         * @member {number}
         */
        this.x1 = 1;

        /**
         * Y-component of top-right corner `(x1,y1)`.
         *
         * @member {number}
         */
        this.y1 = 0;

        /**
         * X-component of bottom-right corner `(x2,y2)`.
         *
         * @member {number}
         */
        this.x2 = 1;

        /**
         * Y-component of bottom-right corner `(x2,y2)`.
         *
         * @member {number}
         */
        this.y2 = 1;

        /**
         * X-component of bottom-left corner `(x3,y3)`.
         *
         * @member {number}
         */
        this.x3 = 0;

        /**
         * Y-component of bottom-right corner `(x3,y3)`.
         *
         * @member {number}
         */
        this.y3 = 1;

        this.uvsFloat32 = new Float32Array(8);
    };

    /**
     * Sets the texture Uvs based on the given frame information.
     *
     * @protected
     * @param {PIXI.Rectangle} frame - The frame of the texture
     * @param {PIXI.Rectangle} baseFrame - The base frame of the texture
     * @param {number} rotate - Rotation of frame, see {@link PIXI.groupD8}
     */
    TextureUvs.prototype.set = function set (frame, baseFrame, rotate)
    {
        var tw = baseFrame.width;
        var th = baseFrame.height;

        if (rotate)
        {
            // width and height div 2 div baseFrame size
            var w2 = frame.width / 2 / tw;
            var h2 = frame.height / 2 / th;

            // coordinates of center
            var cX = (frame.x / tw) + w2;
            var cY = (frame.y / th) + h2;

            rotate = math.groupD8.add(rotate, math.groupD8.NW); // NW is top-left corner
            this.x0 = cX + (w2 * math.groupD8.uX(rotate));
            this.y0 = cY + (h2 * math.groupD8.uY(rotate));

            rotate = math.groupD8.add(rotate, 2); // rotate 90 degrees clockwise
            this.x1 = cX + (w2 * math.groupD8.uX(rotate));
            this.y1 = cY + (h2 * math.groupD8.uY(rotate));

            rotate = math.groupD8.add(rotate, 2);
            this.x2 = cX + (w2 * math.groupD8.uX(rotate));
            this.y2 = cY + (h2 * math.groupD8.uY(rotate));

            rotate = math.groupD8.add(rotate, 2);
            this.x3 = cX + (w2 * math.groupD8.uX(rotate));
            this.y3 = cY + (h2 * math.groupD8.uY(rotate));
        }
        else
        {
            this.x0 = frame.x / tw;
            this.y0 = frame.y / th;

            this.x1 = (frame.x + frame.width) / tw;
            this.y1 = frame.y / th;

            this.x2 = (frame.x + frame.width) / tw;
            this.y2 = (frame.y + frame.height) / th;

            this.x3 = frame.x / tw;
            this.y3 = (frame.y + frame.height) / th;
        }

        this.uvsFloat32[0] = this.x0;
        this.uvsFloat32[1] = this.y0;
        this.uvsFloat32[2] = this.x1;
        this.uvsFloat32[3] = this.y1;
        this.uvsFloat32[4] = this.x2;
        this.uvsFloat32[5] = this.y2;
        this.uvsFloat32[6] = this.x3;
        this.uvsFloat32[7] = this.y3;
    };

    var DEFAULT_UVS = new TextureUvs();

    /**
     * A texture stores the information that represents an image or part of an image.
     *
     * It cannot be added to the display list directly; instead use it as the texture for a Sprite.
     * If no frame is provided for a texture, then the whole image is used.
     *
     * You can directly create a texture from an image and then reuse it multiple times like this :
     *
     * ```js
     * let texture = PIXI.Texture.from('assets/image.png');
     * let sprite1 = new PIXI.Sprite(texture);
     * let sprite2 = new PIXI.Sprite(texture);
     * ```
     *
     * If you didnt pass the texture frame to constructor, it enables `noFrame` mode:
     * it subscribes on baseTexture events, it automatically resizes at the same time as baseTexture.
     *
     * Textures made from SVGs, loaded or not, cannot be used before the file finishes processing.
     * You can check for this by checking the sprite's _textureID property.
     * ```js
     * var texture = PIXI.Texture.from('assets/image.svg');
     * var sprite1 = new PIXI.Sprite(texture);
     * //sprite1._textureID should not be undefined if the texture has finished processing the SVG file
     * ```
     * You can use a ticker or rAF to ensure your sprites load the finished textures after processing. See issue #3068.
     *
     * @class
     * @extends PIXI.utils.EventEmitter
     * @memberof PIXI
     */
    var Texture = /*@__PURE__*/(function (EventEmitter) {
        function Texture(baseTexture, frame, orig, trim, rotate, anchor)
        {
            EventEmitter.call(this);

            /**
             * Does this Texture have any frame data assigned to it?
             *
             * This mode is enabled automatically if no frame was passed inside constructor.
             *
             * In this mode texture is subscribed to baseTexture events, and fires `update` on any change.
             *
             * Beware, after loading or resize of baseTexture event can fired two times!
             * If you want more control, subscribe on baseTexture itself.
             *
             * ```js
             * texture.on('update', () => {});
             * ```
             *
             * Any assignment of `frame` switches off `noFrame` mode.
             *
             * @member {boolean}
             */
            this.noFrame = false;

            if (!frame)
            {
                this.noFrame = true;
                frame = new math.Rectangle(0, 0, 1, 1);
            }

            if (baseTexture instanceof Texture)
            {
                baseTexture = baseTexture.baseTexture;
            }

            /**
             * The base texture that this texture uses.
             *
             * @member {PIXI.BaseTexture}
             */
            this.baseTexture = baseTexture;

            /**
             * This is the area of the BaseTexture image to actually copy to the Canvas / WebGL when rendering,
             * irrespective of the actual frame size or placement (which can be influenced by trimmed texture atlases)
             *
             * @member {PIXI.Rectangle}
             */
            this._frame = frame;

            /**
             * This is the trimmed area of original texture, before it was put in atlas
             * Please call `updateUvs()` after you change coordinates of `trim` manually.
             *
             * @member {PIXI.Rectangle}
             */
            this.trim = trim;

            /**
             * This will let the renderer know if the texture is valid. If it's not then it cannot be rendered.
             *
             * @member {boolean}
             */
            this.valid = false;

            /**
             * This will let a renderer know that a texture has been updated (used mainly for WebGL uv updates)
             *
             * @member {boolean}
             */
            this.requiresUpdate = false;

            /**
             * The WebGL UV data cache. Can be used as quad UV
             *
             * @member {PIXI.TextureUvs}
             * @protected
             */
            this._uvs = DEFAULT_UVS;

            /**
             * Default TextureMatrix instance for this texture
             * By default that object is not created because its heavy
             *
             * @member {PIXI.TextureMatrix}
             */
            this.uvMatrix = null;

            /**
             * This is the area of original texture, before it was put in atlas
             *
             * @member {PIXI.Rectangle}
             */
            this.orig = orig || frame;// new Rectangle(0, 0, 1, 1);

            this._rotate = Number(rotate || 0);

            if (rotate === true)
            {
                // this is old texturepacker legacy, some games/libraries are passing "true" for rotated textures
                this._rotate = 2;
            }
            else if (this._rotate % 2 !== 0)
            {
                throw new Error('attempt to use diamond-shaped UVs. If you are sure, set rotation manually');
            }

            /**
             * Anchor point that is used as default if sprite is created with this texture.
             * Changing the `defaultAnchor` at a later point of time will not update Sprite's anchor point.
             * @member {PIXI.Point}
             * @default {0,0}
             */
            this.defaultAnchor = anchor ? new math.Point(anchor.x, anchor.y) : new math.Point(0, 0);

            /**
             * Update ID is observed by sprites and TextureMatrix instances.
             * Call updateUvs() to increment it.
             *
             * @member {number}
             * @protected
             */

            this._updateID = 0;

            /**
             * The ids under which this Texture has been added to the texture cache. This is
             * automatically set as long as Texture.addToCache is used, but may not be set if a
             * Texture is added directly to the TextureCache array.
             *
             * @member {string[]}
             */
            this.textureCacheIds = [];

            if (!baseTexture.valid)
            {
                baseTexture.once('loaded', this.onBaseTextureUpdated, this);
            }
            else if (this.noFrame)
            {
                // if there is no frame we should monitor for any base texture changes..
                if (baseTexture.valid)
                {
                    this.onBaseTextureUpdated(baseTexture);
                }
            }
            else
            {
                this.frame = frame;
            }

            if (this.noFrame)
            {
                baseTexture.on('update', this.onBaseTextureUpdated, this);
            }
        }

        if ( EventEmitter ) Texture.__proto__ = EventEmitter;
        Texture.prototype = Object.create( EventEmitter && EventEmitter.prototype );
        Texture.prototype.constructor = Texture;

        var prototypeAccessors = { resolution: { configurable: true },frame: { configurable: true },rotate: { configurable: true },width: { configurable: true },height: { configurable: true } };

        /**
         * Updates this texture on the gpu.
         *
         * Calls the TextureResource update.
         *
         * If you adjusted `frame` manually, please call `updateUvs()` instead.
         *
         */
        Texture.prototype.update = function update ()
        {
            if (this.baseTexture.resource)
            {
                this.baseTexture.resource.update();
            }
        };

        /**
         * Called when the base texture is updated
         *
         * @protected
         * @param {PIXI.BaseTexture} baseTexture - The base texture.
         */
        Texture.prototype.onBaseTextureUpdated = function onBaseTextureUpdated (baseTexture)
        {
            if (this.noFrame)
            {
                if (!this.baseTexture.valid)
                {
                    return;
                }

                this._frame.width = baseTexture.width;
                this._frame.height = baseTexture.height;
                this.valid = true;
                this.updateUvs();
            }
            else
            {
                // TODO this code looks confusing.. boo to abusing getters and setters!
                // if user gave us frame that has bigger size than resized texture it can be a problem
                this.frame = this._frame;
            }

            this.emit('update', this);
        };

        /**
         * Destroys this texture
         *
         * @param {boolean} [destroyBase=false] Whether to destroy the base texture as well
         */
        Texture.prototype.destroy = function destroy (destroyBase)
        {
            if (this.baseTexture)
            {
                if (destroyBase)
                {
                    var ref = this.baseTexture;
                    var resource = ref.resource;

                    // delete the texture if it exists in the texture cache..
                    // this only needs to be removed if the base texture is actually destroyed too..
                    if (resource && utils.TextureCache[resource.url])
                    {
                        Texture.removeFromCache(resource.url);
                    }

                    this.baseTexture.destroy();
                }

                this.baseTexture.off('update', this.onBaseTextureUpdated, this);

                this.baseTexture = null;
            }

            this._frame = null;
            this._uvs = null;
            this.trim = null;
            this.orig = null;

            this.valid = false;

            Texture.removeFromCache(this);
            this.textureCacheIds = null;
        };

        /**
         * Creates a new texture object that acts the same as this one.
         *
         * @return {PIXI.Texture} The new texture
         */
        Texture.prototype.clone = function clone ()
        {
            return new Texture(this.baseTexture, this.frame, this.orig, this.trim, this.rotate, this.defaultAnchor);
        };

        /**
         * Updates the internal WebGL UV cache. Use it after you change `frame` or `trim` of the texture.
         * Call it after changing the frame
         */
        Texture.prototype.updateUvs = function updateUvs ()
        {
            if (this._uvs === DEFAULT_UVS)
            {
                this._uvs = new TextureUvs();
            }

            this._uvs.set(this._frame, this.baseTexture, this.rotate);

            this._updateID++;
        };

        /**
         * Helper function that creates a new Texture based on the source you provide.
         * The source can be - frame id, image url, video url, canvas element, video element, base texture
         *
         * @static
         * @param {string|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|PIXI.BaseTexture} source
         *        Source to create texture from
         * @param {object} [options] See {@link PIXI.BaseTexture}'s constructor for options.
         * @param {boolean} [strict] Enforce strict-mode, see {@link PIXI.settings.STRICT_TEXTURE_CACHE}.
         * @return {PIXI.Texture} The newly created texture
         */
        Texture.from = function from (source, options, strict)
        {
            if ( options === void 0 ) options = {};
            if ( strict === void 0 ) strict = settings.settings.STRICT_TEXTURE_CACHE;

            var isFrame = typeof source === 'string';
            var cacheId = null;

            if (isFrame)
            {
                cacheId = source;
            }
            else
            {
                if (!source._pixiId)
                {
                    source._pixiId = "pixiid_" + (utils.uid());
                }

                cacheId = source._pixiId;
            }

            var texture = utils.TextureCache[cacheId];

            // Strict-mode rejects invalid cacheIds
            if (isFrame && strict && !texture)
            {
                throw new Error(("The cacheId \"" + cacheId + "\" does not exist in TextureCache."));
            }

            if (!texture)
            {
                if (!options.resolution)
                {
                    options.resolution = utils.getResolutionOfUrl(source);
                }

                texture = new Texture(new BaseTexture(source, options));
                texture.baseTexture.cacheId = cacheId;

                BaseTexture.addToCache(texture.baseTexture, cacheId);
                Texture.addToCache(texture, cacheId);
            }

            // lets assume its a base texture!
            return texture;
        };

        /**
         * Create a new Texture with a BufferResource from a Float32Array.
         * RGBA values are floats from 0 to 1.
         * @static
         * @param {Float32Array|Uint8Array} buffer The optional array to use, if no data
         *        is provided, a new Float32Array is created.
         * @param {number} width - Width of the resource
         * @param {number} height - Height of the resource
         * @param {object} [options] See {@link PIXI.BaseTexture}'s constructor for options.
         * @return {PIXI.Texture} The resulting new BaseTexture
         */
        Texture.fromBuffer = function fromBuffer (buffer, width, height, options)
        {
            return new Texture(BaseTexture.fromBuffer(buffer, width, height, options));
        };

        /**
         * Create a texture from a source and add to the cache.
         *
         * @static
         * @param {HTMLImageElement|HTMLCanvasElement} source - The input source.
         * @param {String} imageUrl - File name of texture, for cache and resolving resolution.
         * @param {String} [name] - Human readable name for the texture cache. If no name is
         *        specified, only `imageUrl` will be used as the cache ID.
         * @return {PIXI.Texture} Output texture
         */
        Texture.fromLoader = function fromLoader (source, imageUrl, name)
        {
            var resource = new ImageResource(source);

            resource.url = imageUrl;

            var baseTexture = new BaseTexture(resource, {
                scaleMode: settings.settings.SCALE_MODE,
                resolution: utils.getResolutionOfUrl(imageUrl),
            });

            var texture = new Texture(baseTexture);

            // No name, use imageUrl instead
            if (!name)
            {
                name = imageUrl;
            }

            // lets also add the frame to pixi's global cache for 'fromLoader' function
            BaseTexture.addToCache(texture.baseTexture, name);
            Texture.addToCache(texture, name);

            // also add references by url if they are different.
            if (name !== imageUrl)
            {
                BaseTexture.addToCache(texture.baseTexture, imageUrl);
                Texture.addToCache(texture, imageUrl);
            }

            return texture;
        };

        /**
         * Adds a Texture to the global TextureCache. This cache is shared across the whole PIXI object.
         *
         * @static
         * @param {PIXI.Texture} texture - The Texture to add to the cache.
         * @param {string} id - The id that the Texture will be stored against.
         */
        Texture.addToCache = function addToCache (texture, id)
        {
            if (id)
            {
                if (texture.textureCacheIds.indexOf(id) === -1)
                {
                    texture.textureCacheIds.push(id);
                }

                if (utils.TextureCache[id])
                {
                    // eslint-disable-next-line no-console
                    console.warn(("Texture added to the cache with an id [" + id + "] that already had an entry"));
                }

                utils.TextureCache[id] = texture;
            }
        };

        /**
         * Remove a Texture from the global TextureCache.
         *
         * @static
         * @param {string|PIXI.Texture} texture - id of a Texture to be removed, or a Texture instance itself
         * @return {PIXI.Texture|null} The Texture that was removed
         */
        Texture.removeFromCache = function removeFromCache (texture)
        {
            if (typeof texture === 'string')
            {
                var textureFromCache = utils.TextureCache[texture];

                if (textureFromCache)
                {
                    var index = textureFromCache.textureCacheIds.indexOf(texture);

                    if (index > -1)
                    {
                        textureFromCache.textureCacheIds.splice(index, 1);
                    }

                    delete utils.TextureCache[texture];

                    return textureFromCache;
                }
            }
            else if (texture && texture.textureCacheIds)
            {
                for (var i = 0; i < texture.textureCacheIds.length; ++i)
                {
                    // Check that texture matches the one being passed in before deleting it from the cache.
                    if (utils.TextureCache[texture.textureCacheIds[i]] === texture)
                    {
                        delete utils.TextureCache[texture.textureCacheIds[i]];
                    }
                }

                texture.textureCacheIds.length = 0;

                return texture;
            }

            return null;
        };

        /**
         * Returns resolution of baseTexture
         *
         * @member {number}
         * @readonly
         */
        prototypeAccessors.resolution.get = function ()
        {
            return this.baseTexture.resolution;
        };

        /**
         * The frame specifies the region of the base texture that this texture uses.
         * Please call `updateUvs()` after you change coordinates of `frame` manually.
         *
         * @member {PIXI.Rectangle}
         */
        prototypeAccessors.frame.get = function ()
        {
            return this._frame;
        };

        prototypeAccessors.frame.set = function (frame) // eslint-disable-line require-jsdoc
        {
            this._frame = frame;

            this.noFrame = false;

            var x = frame.x;
            var y = frame.y;
            var width = frame.width;
            var height = frame.height;
            var xNotFit = x + width > this.baseTexture.width;
            var yNotFit = y + height > this.baseTexture.height;

            if (xNotFit || yNotFit)
            {
                var relationship = xNotFit && yNotFit ? 'and' : 'or';
                var errorX = "X: " + x + " + " + width + " = " + (x + width) + " > " + (this.baseTexture.width);
                var errorY = "Y: " + y + " + " + height + " = " + (y + height) + " > " + (this.baseTexture.height);

                throw new Error('Texture Error: frame does not fit inside the base Texture dimensions: '
                    + errorX + " " + relationship + " " + errorY);
            }

            this.valid = width && height && this.baseTexture.valid;

            if (!this.trim && !this.rotate)
            {
                this.orig = frame;
            }

            if (this.valid)
            {
                this.updateUvs();
            }
        };

        /**
         * Indicates whether the texture is rotated inside the atlas
         * set to 2 to compensate for texture packer rotation
         * set to 6 to compensate for spine packer rotation
         * can be used to rotate or mirror sprites
         * See {@link PIXI.groupD8} for explanation
         *
         * @member {number}
         */
        prototypeAccessors.rotate.get = function ()
        {
            return this._rotate;
        };

        prototypeAccessors.rotate.set = function (rotate) // eslint-disable-line require-jsdoc
        {
            this._rotate = rotate;
            if (this.valid)
            {
                this.updateUvs();
            }
        };

        /**
         * The width of the Texture in pixels.
         *
         * @member {number}
         */
        prototypeAccessors.width.get = function ()
        {
            return this.orig.width;
        };

        /**
         * The height of the Texture in pixels.
         *
         * @member {number}
         */
        prototypeAccessors.height.get = function ()
        {
            return this.orig.height;
        };

        Object.defineProperties( Texture.prototype, prototypeAccessors );

        return Texture;
    }(utils.EventEmitter));

    function createWhiteTexture()
    {
        var canvas = document.createElement('canvas');

        canvas.width = 16;
        canvas.height = 16;

        var context = canvas.getContext('2d');

        context.fillStyle = 'white';
        context.fillRect(0, 0, 16, 16);

        return new Texture(new BaseTexture(new CanvasResource(canvas)));
    }

    function removeAllHandlers(tex)
    {
        tex.destroy = function _emptyDestroy() { /* empty */ };
        tex.on = function _emptyOn() { /* empty */ };
        tex.once = function _emptyOnce() { /* empty */ };
        tex.emit = function _emptyEmit() { /* empty */ };
    }

    /**
     * An empty texture, used often to not have to create multiple empty textures.
     * Can not be destroyed.
     *
     * @static
     * @constant
     * @member {PIXI.Texture}
     */
    Texture.EMPTY = new Texture(new BaseTexture());
    removeAllHandlers(Texture.EMPTY);
    removeAllHandlers(Texture.EMPTY.baseTexture);

    /**
     * A white texture of 16x16 size, used for graphics and other things
     * Can not be destroyed.
     *
     * @static
     * @constant
     * @member {PIXI.Texture}
     */
    Texture.WHITE = createWhiteTexture();
    removeAllHandlers(Texture.WHITE);
    removeAllHandlers(Texture.WHITE.baseTexture);

    /**
     * A RenderTexture is a special texture that allows any PixiJS display object to be rendered to it.
     *
     * __Hint__: All DisplayObjects (i.e. Sprites) that render to a RenderTexture should be preloaded
     * otherwise black rectangles will be drawn instead.
     *
     * __Hint-2__: The actual memory allocation will happen on first render.
     * You shouldn't create renderTextures each frame just to delete them after, try to reuse them.
     *
     * A RenderTexture takes a snapshot of any Display Object given to its render method. For example:
     *
     * ```js
     * let renderer = PIXI.autoDetectRenderer();
     * let renderTexture = PIXI.RenderTexture.create(800, 600);
     * let sprite = PIXI.Sprite.from("spinObj_01.png");
     *
     * sprite.position.x = 800/2;
     * sprite.position.y = 600/2;
     * sprite.anchor.x = 0.5;
     * sprite.anchor.y = 0.5;
     *
     * renderer.render(sprite, renderTexture);
     * ```
     *
     * The Sprite in this case will be rendered using its local transform. To render this sprite at 0,0
     * you can clear the transform
     *
     * ```js
     *
     * sprite.setTransform()
     *
     * let renderTexture = new PIXI.RenderTexture.create(100, 100);
     *
     * renderer.render(sprite, renderTexture);  // Renders to center of RenderTexture
     * ```
     *
     * @class
     * @extends PIXI.Texture
     * @memberof PIXI
     */
    var RenderTexture = /*@__PURE__*/(function (Texture) {
        function RenderTexture(baseRenderTexture, frame)
        {
            // support for legacy..
            var _legacyRenderer = null;

            if (!(baseRenderTexture instanceof BaseRenderTexture))
            {
                /* eslint-disable prefer-rest-params, no-console */
                var width = arguments[1];
                var height = arguments[2];
                var scaleMode = arguments[3];
                var resolution = arguments[4];

                // we have an old render texture..
                console.warn(("Please use RenderTexture.create(" + width + ", " + height + ") instead of the ctor directly."));
                _legacyRenderer = arguments[0];
                /* eslint-enable prefer-rest-params, no-console */

                frame = null;
                baseRenderTexture = new BaseRenderTexture({
                    width: width,
                    height: height,
                    scaleMode: scaleMode,
                    resolution: resolution,
                });
            }

            /**
             * The base texture object that this texture uses
             *
             * @member {PIXI.BaseTexture}
             */
            Texture.call(this, baseRenderTexture, frame);

            this.legacyRenderer = _legacyRenderer;

            /**
             * This will let the renderer know if the texture is valid. If it's not then it cannot be rendered.
             *
             * @member {boolean}
             */
            this.valid = true;

            /**
             * Stores `sourceFrame` when this texture is inside current filter stack.
             * You can read it inside filters.
             *
             * @readonly
             * @member {PIXI.Rectangle}
             */
            this.filterFrame = null;

            /**
             * The key for pooled texture of FilterSystem
             * @protected
             * @member {string}
             */
            this.filterPoolKey = null;

            this.updateUvs();
        }

        if ( Texture ) RenderTexture.__proto__ = Texture;
        RenderTexture.prototype = Object.create( Texture && Texture.prototype );
        RenderTexture.prototype.constructor = RenderTexture;

        /**
         * Resizes the RenderTexture.
         *
         * @param {number} width - The width to resize to.
         * @param {number} height - The height to resize to.
         * @param {boolean} [resizeBaseTexture=true] - Should the baseTexture.width and height values be resized as well?
         */
        RenderTexture.prototype.resize = function resize (width, height, resizeBaseTexture)
        {
            if ( resizeBaseTexture === void 0 ) resizeBaseTexture = true;

            width = Math.ceil(width);
            height = Math.ceil(height);

            // TODO - could be not required..
            this.valid = (width > 0 && height > 0);

            this._frame.width = this.orig.width = width;
            this._frame.height = this.orig.height = height;

            if (resizeBaseTexture)
            {
                this.baseTexture.resize(width, height);
            }

            this.updateUvs();
        };

        /**
         * Changes the resolution of baseTexture, but does not change framebuffer size.
         *
         * @param {number} resolution - The new resolution to apply to RenderTexture
         */
        RenderTexture.prototype.setResolution = function setResolution (resolution)
        {
            var ref = this;
            var baseTexture = ref.baseTexture;

            if (baseTexture.resolution === resolution)
            {
                return;
            }

            baseTexture.setResolution(resolution);
            this.resize(baseTexture.width, baseTexture.height, false);
        };

        /**
         * A short hand way of creating a render texture.
         *
         * @param {object} [options] - Options
         * @param {number} [options.width=100] - The width of the render texture
         * @param {number} [options.height=100] - The height of the render texture
         * @param {number} [options.scaleMode=PIXI.settings.SCALE_MODE] - See {@link PIXI.SCALE_MODES} for possible values
         * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the texture being generated
         * @return {PIXI.RenderTexture} The new render texture
         */
        RenderTexture.create = function create (options)
        {
            // fallback, old-style: create(width, height, scaleMode, resolution)
            if (typeof options === 'number')
            {
                /* eslint-disable prefer-rest-params */
                options = {
                    width: options,
                    height: arguments[1],
                    scaleMode: arguments[2],
                    resolution: arguments[3],
                };
                /* eslint-enable prefer-rest-params */
            }

            return new RenderTexture(new BaseRenderTexture(options));
        };

        return RenderTexture;
    }(Texture));

    /**
     * Experimental!
     *
     * Texture pool, used by FilterSystem and plugins
     * Stores collection of temporary pow2 or screen-sized renderTextures
     *
     * If you use custom RenderTexturePool for your filters, you can use methods
     * `getFilterTexture` and `returnFilterTexture` same as in
     *
     * @class
     * @memberof PIXI
     */
    var RenderTexturePool = function RenderTexturePool(textureOptions)
    {
        this.texturePool = {};
        this.textureOptions = textureOptions || {};
        /**
         * Allow renderTextures of the same size as screen, not just pow2
         *
         * Automatically sets to true after `setScreenSize`
         *
         * @member {boolean}
         * @default false
         */
        this.enableFullScreen = false;

        this._pixelsWidth = 0;
        this._pixelsHeight = 0;
    };

    /**
     * creates of texture with params that were specified in pool constructor
     *
     * @param {number} realWidth width of texture in pixels
     * @param {number} realHeight height of texture in pixels
     * @returns {RenderTexture}
     */
    RenderTexturePool.prototype.createTexture = function createTexture (realWidth, realHeight)
    {
        var baseRenderTexture = new BaseRenderTexture(Object.assign({
            width: realWidth,
            height: realHeight,
            resolution: 1,
        }, this.textureOptions));

        return new RenderTexture(baseRenderTexture);
    };

    /**
     * Gets a Power-of-Two render texture or fullScreen texture
     *
     * @protected
     * @param {number} minWidth - The minimum width of the render texture in real pixels.
     * @param {number} minHeight - The minimum height of the render texture in real pixels.
     * @param {number} [resolution=1] - The resolution of the render texture.
     * @return {PIXI.RenderTexture} The new render texture.
     */
    RenderTexturePool.prototype.getOptimalTexture = function getOptimalTexture (minWidth, minHeight, resolution)
    {
            if ( resolution === void 0 ) resolution = 1;

        var key = RenderTexturePool.SCREEN_KEY;

        minWidth *= resolution;
        minHeight *= resolution;

        if (!this.enableFullScreen || minWidth !== this._pixelsWidth || minHeight !== this._pixelsHeight)
        {
            minWidth = utils.nextPow2(minWidth);
            minHeight = utils.nextPow2(minHeight);
            key = ((minWidth & 0xFFFF) << 16) | (minHeight & 0xFFFF);
        }

        if (!this.texturePool[key])
        {
            this.texturePool[key] = [];
        }

        var renderTexture = this.texturePool[key].pop();

        if (!renderTexture)
        {
            renderTexture = this.createTexture(minWidth, minHeight);
        }

        renderTexture.filterPoolKey = key;
        renderTexture.setResolution(resolution);

        return renderTexture;
    };

    /**
     * Gets extra texture of the same size as input renderTexture
     *
     * `getFilterTexture(input, 0.5)` or `getFilterTexture(0.5, input)`
     *
     * @param {PIXI.RenderTexture} input renderTexture from which size and resolution will be copied
     * @param {number} [resolution] override resolution of the renderTexture
     *  It overrides, it does not multiply
     * @returns {PIXI.RenderTexture}
     */
    RenderTexturePool.prototype.getFilterTexture = function getFilterTexture (input, resolution)
    {
        var filterTexture = this.getOptimalTexture(input.width, input.height, resolution || input.resolution);

        filterTexture.filterFrame = input.filterFrame;

        return filterTexture;
    };

    /**
     * Place a render texture back into the pool.
     * @param {PIXI.RenderTexture} renderTexture - The renderTexture to free
     */
    RenderTexturePool.prototype.returnTexture = function returnTexture (renderTexture)
    {
        var key = renderTexture.filterPoolKey;

        renderTexture.filterFrame = null;
        this.texturePool[key].push(renderTexture);
    };

    /**
     * Alias for returnTexture, to be compliant with FilterSystem interface
     * @param {PIXI.RenderTexture} renderTexture - The renderTexture to free
     */
    RenderTexturePool.prototype.returnFilterTexture = function returnFilterTexture (renderTexture)
    {
        this.returnTexture(renderTexture);
    };

    /**
     * Clears the pool
     *
     * @param {boolean} [destroyTextures=true] destroy all stored textures
     */
    RenderTexturePool.prototype.clear = function clear (destroyTextures)
    {
        destroyTextures = destroyTextures !== false;
        if (destroyTextures)
        {
            for (var i in this.texturePool)
            {
                var textures = this.texturePool[i];

                if (textures)
                {
                    for (var j = 0; j < textures.length; j++)
                    {
                        textures[j].destroy(true);
                    }
                }
            }
        }

        this.texturePool = {};
    };

    /**
     * If screen size was changed, drops all screen-sized textures,
     * sets new screen size, sets `enableFullScreen` to true
     *
     * Size is measured in pixels, `renderer.view` can be passed here, not `renderer.screen`
     *
     * @param {PIXI.ISize} size - Initial size of screen
     */
    RenderTexturePool.prototype.setScreenSize = function setScreenSize (size)
    {
        if (size.width === this._pixelsWidth
            && size.height === this._pixelsHeight)
        {
            return;
        }

        var screenKey = RenderTexturePool.SCREEN_KEY;
        var textures = this.texturePool[screenKey];

        this.enableFullScreen = size.width > 0 && size.height > 0;

        if (textures)
        {
            for (var j = 0; j < textures.length; j++)
            {
                textures[j].destroy(true);
            }
        }
        this.texturePool[screenKey] = [];

        this._pixelsWidth = size.width;
        this._pixelsHeight = size.height;
    };

    /**
     * Key that is used to store fullscreen renderTextures in a pool
     *
     * @static
     * @const {string}
     */
    RenderTexturePool.SCREEN_KEY = 'screen';

    /* eslint-disable max-len */

    /**
     * Holds the information for a single attribute structure required to render geometry.
     *
     * This does not contain the actual data, but instead has a buffer id that maps to a {@link PIXI.Buffer}
     * This can include anything from positions, uvs, normals, colors etc.
     *
     * @class
     * @memberof PIXI
     */
    var Attribute = function Attribute(buffer, size, normalized, type, stride, start, instance)
    {
        if ( normalized === void 0 ) normalized = false;
        if ( type === void 0 ) type = 5126;

        this.buffer = buffer;
        this.size = size;
        this.normalized = normalized;
        this.type = type;
        this.stride = stride;
        this.start = start;
        this.instance = instance;
    };

    /**
     * Destroys the Attribute.
     */
    Attribute.prototype.destroy = function destroy ()
    {
        this.buffer = null;
    };

    /**
     * Helper function that creates an Attribute based on the information provided
     *
     * @static
     * @param {string} buffer  the id of the buffer that this attribute will look for
     * @param {Number} [size=0] the size of the attribute. If you have 2 floats per vertex (eg position x and y) this would be 2
     * @param {Boolean} [normalized=false] should the data be normalized.
     * @param {Number} [start=0] How far into the array to start reading values (used for interleaving data)
     * @param {Number} [type=PIXI.TYPES.FLOAT] what type of number is the attribute. Check {@link PIXI.TYPES} to see the ones available
     * @param {Number} [stride=0] How far apart (in floats) the start of each value is. (used for interleaving data)
     *
     * @returns {PIXI.Attribute} A new {@link PIXI.Attribute} based on the information provided
     */
    Attribute.from = function from (buffer, size, normalized, type, stride)
    {
        return new Attribute(buffer, size, normalized, type, stride);
    };

    var UID = 0;
    /* eslint-disable max-len */

    /**
     * A wrapper for data so that it can be used and uploaded by WebGL
     *
     * @class
     * @memberof PIXI
     */
    var Buffer = function Buffer(data, _static, index)
    {
        if ( _static === void 0 ) _static = true;
        if ( index === void 0 ) index = false;

        /**
         * The data in the buffer, as a typed array
         *
         * @member {ArrayBuffer| SharedArrayBuffer|ArrayBufferView}
         */
        this.data = data || new Float32Array(1);

        /**
         * A map of renderer IDs to webgl buffer
         *
         * @private
         * @member {object<number, GLBuffer>}
         */
        this._glBuffers = {};

        this._updateID = 0;

        this.index = index;

        this.static = _static;

        this.id = UID++;

        this.disposeRunner = new runner.Runner('disposeBuffer', 2);
    };

    // TODO could explore flagging only a partial upload?
    /**
     * flags this buffer as requiring an upload to the GPU
     * @param {ArrayBuffer|SharedArrayBuffer|ArrayBufferView} [data] the data to update in the buffer.
     */
    Buffer.prototype.update = function update (data)
    {
        this.data = data || this.data;
        this._updateID++;
    };

    /**
     * disposes WebGL resources that are connected to this geometry
     */
    Buffer.prototype.dispose = function dispose ()
    {
        this.disposeRunner.run(this, false);
    };

    /**
     * Destroys the buffer
     */
    Buffer.prototype.destroy = function destroy ()
    {
        this.dispose();

        this.data = null;
    };

    /**
     * Helper function that creates a buffer based on an array or TypedArray
     *
     * @static
     * @param {ArrayBufferView | number[]} data the TypedArray that the buffer will store. If this is a regular Array it will be converted to a Float32Array.
     * @return {PIXI.Buffer} A new Buffer based on the data provided.
     */
    Buffer.from = function from (data)
    {
        if (data instanceof Array)
        {
            data = new Float32Array(data);
        }

        return new Buffer(data);
    };

    function getBufferType(array)
    {
        if (array.BYTES_PER_ELEMENT === 4)
        {
            if (array instanceof Float32Array)
            {
                return 'Float32Array';
            }
            else if (array instanceof Uint32Array)
            {
                return 'Uint32Array';
            }

            return 'Int32Array';
        }
        else if (array.BYTES_PER_ELEMENT === 2)
        {
            if (array instanceof Uint16Array)
            {
                return 'Uint16Array';
            }
        }
        else if (array.BYTES_PER_ELEMENT === 1)
        {
            if (array instanceof Uint8Array)
            {
                return 'Uint8Array';
            }
        }

        // TODO map out the rest of the array elements!
        return null;
    }

    /* eslint-disable object-shorthand */
    var map = {
        Float32Array: Float32Array,
        Uint32Array: Uint32Array,
        Int32Array: Int32Array,
        Uint8Array: Uint8Array,
    };

    function interleaveTypedArrays(arrays, sizes)
    {
        var outSize = 0;
        var stride = 0;
        var views = {};

        for (var i = 0; i < arrays.length; i++)
        {
            stride += sizes[i];
            outSize += arrays[i].length;
        }

        var buffer = new ArrayBuffer(outSize * 4);

        var out = null;
        var littleOffset = 0;

        for (var i$1 = 0; i$1 < arrays.length; i$1++)
        {
            var size = sizes[i$1];
            var array = arrays[i$1];

            var type = getBufferType(array);

            if (!views[type])
            {
                views[type] = new map[type](buffer);
            }

            out = views[type];

            for (var j = 0; j < array.length; j++)
            {
                var indexStart = ((j / size | 0) * stride) + littleOffset;
                var index = j % size;

                out[indexStart + index] = array[j];
            }

            littleOffset += size;
        }

        return new Float32Array(buffer);
    }

    var byteSizeMap = { 5126: 4, 5123: 2, 5121: 1 };
    var UID$1 = 0;

    /* eslint-disable object-shorthand */
    var map$1 = {
        Float32Array: Float32Array,
        Uint32Array: Uint32Array,
        Int32Array: Int32Array,
        Uint8Array: Uint8Array,
        Uint16Array: Uint16Array,
    };

    /* eslint-disable max-len */

    /**
     * The Geometry represents a model. It consists of two components:
     * - GeometryStyle - The structure of the model such as the attributes layout
     * - GeometryData - the data of the model - this consists of buffers.
     * This can include anything from positions, uvs, normals, colors etc.
     *
     * Geometry can be defined without passing in a style or data if required (thats how I prefer!)
     *
     * ```js
     * let geometry = new PIXI.Geometry();
     *
     * geometry.addAttribute('positions', [0, 0, 100, 0, 100, 100, 0, 100], 2);
     * geometry.addAttribute('uvs', [0,0,1,0,1,1,0,1],2)
     * geometry.addIndex([0,1,2,1,3,2])
     *
     * ```
     * @class
     * @memberof PIXI
     */
    var Geometry = function Geometry(buffers, attributes)
    {
        if ( buffers === void 0 ) buffers = [];
        if ( attributes === void 0 ) attributes = {};

        this.buffers = buffers;

        this.indexBuffer = null;

        this.attributes = attributes;

        /**
         * A map of renderer IDs to webgl VAOs
         *
         * @protected
         * @type {object}
         */
        this.glVertexArrayObjects = {};

        this.id = UID$1++;

        this.instanced = false;

        /**
         * Number of instances in this geometry, pass it to `GeometrySystem.draw()`
         * @member {number}
         * @default 1
         */
        this.instanceCount = 1;

        this.disposeRunner = new runner.Runner('disposeGeometry', 2);

        /**
         * Count of existing (not destroyed) meshes that reference this geometry
         * @member {number}
         */
        this.refCount = 0;
    };

    /**
    *
    * Adds an attribute to the geometry
    *
    * @param {String} id - the name of the attribute (matching up to a shader)
    * @param {PIXI.Buffer|number[]} [buffer] the buffer that holds the data of the attribute . You can also provide an Array and a buffer will be created from it.
    * @param {Number} [size=0] the size of the attribute. If you have 2 floats per vertex (eg position x and y) this would be 2
    * @param {Boolean} [normalized=false] should the data be normalized.
    * @param {Number} [type=PIXI.TYPES.FLOAT] what type of number is the attribute. Check {PIXI.TYPES} to see the ones available
    * @param {Number} [stride=0] How far apart (in floats) the start of each value is. (used for interleaving data)
    * @param {Number} [start=0] How far into the array to start reading values (used for interleaving data)
    *
    * @return {PIXI.Geometry} returns self, useful for chaining.
    */
    Geometry.prototype.addAttribute = function addAttribute (id, buffer, size, normalized, type, stride, start, instance)
    {
            if ( normalized === void 0 ) normalized = false;
            if ( instance === void 0 ) instance = false;

        if (!buffer)
        {
            throw new Error('You must pass a buffer when creating an attribute');
        }

        // check if this is a buffer!
        if (!buffer.data)
        {
            // its an array!
            if (buffer instanceof Array)
            {
                buffer = new Float32Array(buffer);
            }

            buffer = new Buffer(buffer);
        }

        var ids = id.split('|');

        if (ids.length > 1)
        {
            for (var i = 0; i < ids.length; i++)
            {
                this.addAttribute(ids[i], buffer, size, normalized, type);
            }

            return this;
        }

        var bufferIndex = this.buffers.indexOf(buffer);

        if (bufferIndex === -1)
        {
            this.buffers.push(buffer);
            bufferIndex = this.buffers.length - 1;
        }

        this.attributes[id] = new Attribute(bufferIndex, size, normalized, type, stride, start, instance);

        // assuming that if there is instanced data then this will be drawn with instancing!
        this.instanced = this.instanced || instance;

        return this;
    };

    /**
     * returns the requested attribute
     *
     * @param {String} id  the name of the attribute required
     * @return {PIXI.Attribute} the attribute requested.
     */
    Geometry.prototype.getAttribute = function getAttribute (id)
    {
        return this.attributes[id];
    };

    /**
     * returns the requested buffer
     *
     * @param {String} id  the name of the buffer required
     * @return {PIXI.Buffer} the buffer requested.
     */
    Geometry.prototype.getBuffer = function getBuffer (id)
    {
        return this.buffers[this.getAttribute(id).buffer];
    };

    /**
    *
    * Adds an index buffer to the geometry
    * The index buffer contains integers, three for each triangle in the geometry, which reference the various attribute buffers (position, colour, UV coordinates, other UV coordinates, normal, …). There is only ONE index buffer.
    *
    * @param {PIXI.Buffer|number[]} [buffer] the buffer that holds the data of the index buffer. You can also provide an Array and a buffer will be created from it.
    * @return {PIXI.Geometry} returns self, useful for chaining.
    */
    Geometry.prototype.addIndex = function addIndex (buffer)
    {
        if (!buffer.data)
        {
            // its an array!
            if (buffer instanceof Array)
            {
                buffer = new Uint16Array(buffer);
            }

            buffer = new Buffer(buffer);
        }

        buffer.index = true;
        this.indexBuffer = buffer;

        if (this.buffers.indexOf(buffer) === -1)
        {
            this.buffers.push(buffer);
        }

        return this;
    };

    /**
     * returns the index buffer
     *
     * @return {PIXI.Buffer} the index buffer.
     */
    Geometry.prototype.getIndex = function getIndex ()
    {
        return this.indexBuffer;
    };

    /**
     * this function modifies the structure so that all current attributes become interleaved into a single buffer
     * This can be useful if your model remains static as it offers a little performance boost
     *
     * @return {PIXI.Geometry} returns self, useful for chaining.
     */
    Geometry.prototype.interleave = function interleave ()
    {
        // a simple check to see if buffers are already interleaved..
        if (this.buffers.length === 1 || (this.buffers.length === 2 && this.indexBuffer)) { return this; }

        // assume already that no buffers are interleaved
        var arrays = [];
        var sizes = [];
        var interleavedBuffer = new Buffer();
        var i;

        for (i in this.attributes)
        {
            var attribute = this.attributes[i];

            var buffer = this.buffers[attribute.buffer];

            arrays.push(buffer.data);

            sizes.push((attribute.size * byteSizeMap[attribute.type]) / 4);

            attribute.buffer = 0;
        }

        interleavedBuffer.data = interleaveTypedArrays(arrays, sizes);

        for (i = 0; i < this.buffers.length; i++)
        {
            if (this.buffers[i] !== this.indexBuffer)
            {
                this.buffers[i].destroy();
            }
        }

        this.buffers = [interleavedBuffer];

        if (this.indexBuffer)
        {
            this.buffers.push(this.indexBuffer);
        }

        return this;
    };

    Geometry.prototype.getSize = function getSize ()
    {
        for (var i in this.attributes)
        {
            var attribute = this.attributes[i];
            var buffer = this.buffers[attribute.buffer];

            return buffer.data.length / ((attribute.stride / 4) || attribute.size);
        }

        return 0;
    };

    /**
     * disposes WebGL resources that are connected to this geometry
     */
    Geometry.prototype.dispose = function dispose ()
    {
        this.disposeRunner.run(this, false);
    };

    /**
     * Destroys the geometry.
     */
    Geometry.prototype.destroy = function destroy ()
    {
        this.dispose();

        this.buffers = null;
        this.indexBuffer = null;
        this.attributes = null;
    };

    /**
     * returns a clone of the geometry
     *
     * @returns {PIXI.Geometry} a new clone of this geometry
     */
    Geometry.prototype.clone = function clone ()
    {
        var geometry = new Geometry();

        for (var i = 0; i < this.buffers.length; i++)
        {
            geometry.buffers[i] = new Buffer(this.buffers[i].data.slice());
        }

        for (var i$1 in this.attributes)
        {
            var attrib = this.attributes[i$1];

            geometry.attributes[i$1] = new Attribute(
                attrib.buffer,
                attrib.size,
                attrib.normalized,
                attrib.type,
                attrib.stride,
                attrib.start,
                attrib.instance
            );
        }

        if (this.indexBuffer)
        {
            geometry.indexBuffer = geometry.buffers[this.buffers.indexOf(this.indexBuffer)];
            geometry.indexBuffer.index = true;
        }

        return geometry;
    };

    /**
     * merges an array of geometries into a new single one
     * geometry attribute styles must match for this operation to work
     *
     * @param {PIXI.Geometry[]} geometries array of geometries to merge
     * @returns {PIXI.Geometry} shiny new geometry!
     */
    Geometry.merge = function merge (geometries)
    {
        // todo add a geometry check!
        // also a size check.. cant be too big!]

        var geometryOut = new Geometry();

        var arrays = [];
        var sizes = [];
        var offsets = [];

        var geometry;

        // pass one.. get sizes..
        for (var i = 0; i < geometries.length; i++)
        {
            geometry = geometries[i];

            for (var j = 0; j < geometry.buffers.length; j++)
            {
                sizes[j] = sizes[j] || 0;
                sizes[j] += geometry.buffers[j].data.length;
                offsets[j] = 0;
            }
        }

        // build the correct size arrays..
        for (var i$1 = 0; i$1 < geometry.buffers.length; i$1++)
        {
            // TODO types!
            arrays[i$1] = new map$1[getBufferType(geometry.buffers[i$1].data)](sizes[i$1]);
            geometryOut.buffers[i$1] = new Buffer(arrays[i$1]);
        }

        // pass to set data..
        for (var i$2 = 0; i$2 < geometries.length; i$2++)
        {
            geometry = geometries[i$2];

            for (var j$1 = 0; j$1 < geometry.buffers.length; j$1++)
            {
                arrays[j$1].set(geometry.buffers[j$1].data, offsets[j$1]);
                offsets[j$1] += geometry.buffers[j$1].data.length;
            }
        }

        geometryOut.attributes = geometry.attributes;

        if (geometry.indexBuffer)
        {
            geometryOut.indexBuffer = geometryOut.buffers[geometry.buffers.indexOf(geometry.indexBuffer)];
            geometryOut.indexBuffer.index = true;

            var offset = 0;
            var stride = 0;
            var offset2 = 0;
            var bufferIndexToCount = 0;

            // get a buffer
            for (var i$3 = 0; i$3 < geometry.buffers.length; i$3++)
            {
                if (geometry.buffers[i$3] !== geometry.indexBuffer)
                {
                    bufferIndexToCount = i$3;
                    break;
                }
            }

            // figure out the stride of one buffer..
            for (var i$4 in geometry.attributes)
            {
                var attribute = geometry.attributes[i$4];

                if ((attribute.buffer | 0) === bufferIndexToCount)
                {
                    stride += ((attribute.size * byteSizeMap[attribute.type]) / 4);
                }
            }

            // time to off set all indexes..
            for (var i$5 = 0; i$5 < geometries.length; i$5++)
            {
                var indexBufferData = geometries[i$5].indexBuffer.data;

                for (var j$2 = 0; j$2 < indexBufferData.length; j$2++)
                {
                    geometryOut.indexBuffer.data[j$2 + offset2] += offset;
                }

                offset += geometry.buffers[bufferIndexToCount].data.length / (stride);
                offset2 += indexBufferData.length;
            }
        }

        return geometryOut;
    };

    /**
     * Helper class to create a quad
     *
     * @class
     * @memberof PIXI
     */
    var Quad = /*@__PURE__*/(function (Geometry) {
        function Quad()
        {
            Geometry.call(this);

            this.addAttribute('aVertexPosition', [
                0, 0,
                1, 0,
                1, 1,
                0, 1 ])
                .addIndex([0, 1, 3, 2]);
        }

        if ( Geometry ) Quad.__proto__ = Geometry;
        Quad.prototype = Object.create( Geometry && Geometry.prototype );
        Quad.prototype.constructor = Quad;

        return Quad;
    }(Geometry));

    /**
     * Helper class to create a quad with uvs like in v4
     *
     * @class
     * @memberof PIXI
     * @extends PIXI.Geometry
     */
    var QuadUv = /*@__PURE__*/(function (Geometry) {
        function QuadUv()
        {
            Geometry.call(this);

            /**
             * An array of vertices
             *
             * @member {Float32Array}
             */
            this.vertices = new Float32Array([
                -1, -1,
                1, -1,
                1, 1,
                -1, 1 ]);

            /**
             * The Uvs of the quad
             *
             * @member {Float32Array}
             */
            this.uvs = new Float32Array([
                0, 0,
                1, 0,
                1, 1,
                0, 1 ]);

            this.vertexBuffer = new Buffer(this.vertices);
            this.uvBuffer = new Buffer(this.uvs);

            this.addAttribute('aVertexPosition', this.vertexBuffer)
                .addAttribute('aTextureCoord', this.uvBuffer)
                .addIndex([0, 1, 2, 0, 2, 3]);
        }

        if ( Geometry ) QuadUv.__proto__ = Geometry;
        QuadUv.prototype = Object.create( Geometry && Geometry.prototype );
        QuadUv.prototype.constructor = QuadUv;

        /**
         * Maps two Rectangle to the quad.
         *
         * @param {PIXI.Rectangle} targetTextureFrame - the first rectangle
         * @param {PIXI.Rectangle} destinationFrame - the second rectangle
         * @return {PIXI.Quad} Returns itself.
         */
        QuadUv.prototype.map = function map (targetTextureFrame, destinationFrame)
        {
            var x = 0; // destinationFrame.x / targetTextureFrame.width;
            var y = 0; // destinationFrame.y / targetTextureFrame.height;

            this.uvs[0] = x;
            this.uvs[1] = y;

            this.uvs[2] = x + (destinationFrame.width / targetTextureFrame.width);
            this.uvs[3] = y;

            this.uvs[4] = x + (destinationFrame.width / targetTextureFrame.width);
            this.uvs[5] = y + (destinationFrame.height / targetTextureFrame.height);

            this.uvs[6] = x;
            this.uvs[7] = y + (destinationFrame.height / targetTextureFrame.height);

            x = destinationFrame.x;
            y = destinationFrame.y;

            this.vertices[0] = x;
            this.vertices[1] = y;

            this.vertices[2] = x + destinationFrame.width;
            this.vertices[3] = y;

            this.vertices[4] = x + destinationFrame.width;
            this.vertices[5] = y + destinationFrame.height;

            this.vertices[6] = x;
            this.vertices[7] = y + destinationFrame.height;

            this.invalidate();

            return this;
        };

        /**
         * legacy upload method, just marks buffers dirty
         * @returns {PIXI.QuadUv} Returns itself.
         */
        QuadUv.prototype.invalidate = function invalidate ()
        {
            this.vertexBuffer._updateID++;
            this.uvBuffer._updateID++;

            return this;
        };

        return QuadUv;
    }(Geometry));

    var UID$2 = 0;

    /**
     * Uniform group holds uniform map and some ID's for work
     *
     * @class
     * @memberof PIXI
     */
    var UniformGroup = function UniformGroup(uniforms, _static)
    {
        /**
         * uniform values
         * @member {object}
         * @readonly
         */
        this.uniforms = uniforms;

        /**
         * Its a group and not a single uniforms
         * @member {boolean}
         * @readonly
         * @default true
         */
        this.group = true;

        // lets generate this when the shader ?
        this.syncUniforms = {};

        /**
         * dirty version
         * @protected
         * @member {number}
         */
        this.dirtyId = 0;

        /**
         * unique id
         * @protected
         * @member {number}
         */
        this.id = UID$2++;

        /**
         * Uniforms wont be changed after creation
         * @member {boolean}
         */
        this.static = !!_static;
    };

    UniformGroup.prototype.update = function update ()
    {
        this.dirtyId++;
    };

    UniformGroup.prototype.add = function add (name, uniforms, _static)
    {
        this.uniforms[name] = new UniformGroup(uniforms, _static);
    };

    UniformGroup.from = function from (uniforms, _static)
    {
        return new UniformGroup(uniforms, _static);
    };

    /**
     * System plugin to the renderer to manage filter states.
     *
     * @class
     * @private
     */
    var FilterState = function FilterState()
    {
        this.renderTexture = null;

        /**
         * Target of the filters
         * We store for case when custom filter wants to know the element it was applied on
         * @member {PIXI.DisplayObject}
         * @private
         */
        this.target = null;

        /**
         * Compatibility with PixiJS v4 filters
         * @member {boolean}
         * @default false
         * @private
         */
        this.legacy = false;

        /**
         * Resolution of filters
         * @member {number}
         * @default 1
         * @private
         */
        this.resolution = 1;

        // next three fields are created only for root
        // re-assigned for everything else

        /**
         * Source frame
         * @member {PIXI.Rectangle}
         * @private
         */
        this.sourceFrame = new math.Rectangle();

        /**
         * Destination frame
         * @member {PIXI.Rectangle}
         * @private
         */
        this.destinationFrame = new math.Rectangle();

        /**
         * Collection of filters
         * @member {PIXI.Filter[]}
         * @private
         */
        this.filters = [];
    };

    /**
     * clears the state
     * @private
     */
    FilterState.prototype.clear = function clear ()
    {
        this.target = null;
        this.filters = null;
        this.renderTexture = null;
    };

    /**
     * System plugin to the renderer to manage the filters.
     *
     * @class
     * @memberof PIXI.systems
     * @extends PIXI.System
     */
    var FilterSystem = /*@__PURE__*/(function (System) {
        function FilterSystem(renderer)
        {
            System.call(this, renderer);

            /**
             * List of filters for the FilterSystem
             * @member {Object[]}
             * @readonly
             */
            this.defaultFilterStack = [{}];

            /**
             * stores a bunch of PO2 textures used for filtering
             * @member {Object}
             */
            this.texturePool = new RenderTexturePool();

            this.texturePool.setScreenSize(renderer.view);

            /**
             * a pool for storing filter states, save us creating new ones each tick
             * @member {Object[]}
             */
            this.statePool = [];

            /**
             * A very simple geometry used when drawing a filter effect to the screen
             * @member {PIXI.Quad}
             */
            this.quad = new Quad();

            /**
             * Quad UVs
             * @member {PIXI.QuadUv}
             */
            this.quadUv = new QuadUv();

            /**
             * Temporary rect for maths
             * @type {PIXI.Rectangle}
             */
            this.tempRect = new math.Rectangle();

            /**
             * Active state
             * @member {object}
             */
            this.activeState = {};

            /**
             * This uniform group is attached to filter uniforms when used
             * @member {PIXI.UniformGroup}
             * @property {PIXI.Rectangle} outputFrame
             * @property {Float32Array} inputSize
             * @property {Float32Array} inputPixel
             * @property {Float32Array} inputClamp
             * @property {Number} resolution
             * @property {Float32Array} filterArea
             * @property {Fload32Array} filterClamp
             */
            this.globalUniforms = new UniformGroup({
                outputFrame: this.tempRect,
                inputSize: new Float32Array(4),
                inputPixel: new Float32Array(4),
                inputClamp: new Float32Array(4),
                resolution: 1,

                // legacy variables
                filterArea: new Float32Array(4),
                filterClamp: new Float32Array(4),
            }, true);

            this._pixelsWidth = renderer.view.width;
            this._pixelsHeight = renderer.view.height;
        }

        if ( System ) FilterSystem.__proto__ = System;
        FilterSystem.prototype = Object.create( System && System.prototype );
        FilterSystem.prototype.constructor = FilterSystem;

        /**
         * Adds a new filter to the System.
         *
         * @param {PIXI.DisplayObject} target - The target of the filter to render.
         * @param {PIXI.Filter[]} filters - The filters to apply.
         */
        FilterSystem.prototype.push = function push (target, filters)
        {
            var renderer = this.renderer;
            var filterStack = this.defaultFilterStack;
            var state = this.statePool.pop() || new FilterState();

            var resolution = filters[0].resolution;
            var padding = filters[0].padding;
            var autoFit = filters[0].autoFit;
            var legacy = filters[0].legacy;

            for (var i = 1; i < filters.length; i++)
            {
                var filter =  filters[i];

                // lets use the lowest resolution..
                resolution = Math.min(resolution, filter.resolution);
                // and the largest amount of padding!
                padding = Math.max(padding, filter.padding);
                // only auto fit if all filters are autofit
                autoFit = autoFit || filter.autoFit;

                legacy = legacy || filter.legacy;
            }

            if (filterStack.length === 1)
            {
                this.defaultFilterStack[0].renderTexture = renderer.renderTexture.current;
            }

            filterStack.push(state);

            state.resolution = resolution;

            state.legacy = legacy;

            state.target = target;

            state.sourceFrame.copyFrom(target.filterArea || target.getBounds(true));

            state.sourceFrame.pad(padding);
            if (autoFit)
            {
                state.sourceFrame.fit(this.renderer.renderTexture.sourceFrame);
            }

            // round to whole number based on resolution
            state.sourceFrame.ceil(resolution);

            state.renderTexture = this.getOptimalFilterTexture(state.sourceFrame.width, state.sourceFrame.height, resolution);
            state.filters = filters;

            state.destinationFrame.width = state.renderTexture.width;
            state.destinationFrame.height = state.renderTexture.height;

            state.renderTexture.filterFrame = state.sourceFrame;

            renderer.renderTexture.bind(state.renderTexture, state.sourceFrame);// /, state.destinationFrame);
            renderer.renderTexture.clear();
        };

        /**
         * Pops off the filter and applies it.
         *
         */
        FilterSystem.prototype.pop = function pop ()
        {
            var filterStack = this.defaultFilterStack;
            var state = filterStack.pop();
            var filters = state.filters;

            this.activeState = state;

            var globalUniforms = this.globalUniforms.uniforms;

            globalUniforms.outputFrame = state.sourceFrame;
            globalUniforms.resolution = state.resolution;

            var inputSize = globalUniforms.inputSize;
            var inputPixel = globalUniforms.inputPixel;
            var inputClamp = globalUniforms.inputClamp;

            inputSize[0] = state.destinationFrame.width;
            inputSize[1] = state.destinationFrame.height;
            inputSize[2] = 1.0 / inputSize[0];
            inputSize[3] = 1.0 / inputSize[1];

            inputPixel[0] = inputSize[0] * state.resolution;
            inputPixel[1] = inputSize[1] * state.resolution;
            inputPixel[2] = 1.0 / inputPixel[0];
            inputPixel[3] = 1.0 / inputPixel[1];

            inputClamp[0] = 0.5 * inputPixel[2];
            inputClamp[1] = 0.5 * inputPixel[3];
            inputClamp[2] = (state.sourceFrame.width * inputSize[2]) - (0.5 * inputPixel[2]);
            inputClamp[3] = (state.sourceFrame.height * inputSize[3]) - (0.5 * inputPixel[3]);

            // only update the rect if its legacy..
            if (state.legacy)
            {
                var filterArea = globalUniforms.filterArea;

                filterArea[0] = state.destinationFrame.width;
                filterArea[1] = state.destinationFrame.height;
                filterArea[2] = state.sourceFrame.x;
                filterArea[3] = state.sourceFrame.y;

                globalUniforms.filterClamp = globalUniforms.inputClamp;
            }

            this.globalUniforms.update();

            var lastState = filterStack[filterStack.length - 1];

            if (filters.length === 1)
            {
                filters[0].apply(this, state.renderTexture, lastState.renderTexture, false, state);

                this.returnFilterTexture(state.renderTexture);
            }
            else
            {
                var flip = state.renderTexture;
                var flop = this.getOptimalFilterTexture(
                    flip.width,
                    flip.height,
                    state.resolution
                );

                flop.filterFrame = flip.filterFrame;

                var i = 0;

                for (i = 0; i < filters.length - 1; ++i)
                {
                    filters[i].apply(this, flip, flop, true, state);

                    var t = flip;

                    flip = flop;
                    flop = t;
                }

                filters[i].apply(this, flip, lastState.renderTexture, false, state);

                this.returnFilterTexture(flip);
                this.returnFilterTexture(flop);
            }

            state.clear();
            this.statePool.push(state);
        };

        /**
         * Draws a filter.
         *
         * @param {PIXI.Filter} filter - The filter to draw.
         * @param {PIXI.RenderTexture} input - The input render target.
         * @param {PIXI.RenderTexture} output - The target to output to.
         * @param {boolean} clear - Should the output be cleared before rendering to it
         */
        FilterSystem.prototype.applyFilter = function applyFilter (filter, input, output, clear)
        {
            var renderer = this.renderer;

            renderer.renderTexture.bind(output, output ? output.filterFrame : null);

            if (clear)
            {
                // gl.disable(gl.SCISSOR_TEST);
                renderer.renderTexture.clear();
                // gl.enable(gl.SCISSOR_TEST);
            }

            // set the uniforms..
            filter.uniforms.uSampler = input;
            filter.uniforms.filterGlobals = this.globalUniforms;

            // TODO make it so that the order of this does not matter..
            // because it does at the moment cos of global uniforms.
            // they need to get resynced

            renderer.state.set(filter.state);
            renderer.shader.bind(filter);

            if (filter.legacy)
            {
                this.quadUv.map(input._frame, input.filterFrame);

                renderer.geometry.bind(this.quadUv);
                renderer.geometry.draw(constants.DRAW_MODES.TRIANGLES);
            }
            else
            {
                renderer.geometry.bind(this.quad);
                renderer.geometry.draw(constants.DRAW_MODES.TRIANGLE_STRIP);
            }
        };

        /**
         * Multiply _input normalized coordinates_ to this matrix to get _sprite texture normalized coordinates_.
         *
         * Use `outputMatrix * vTextureCoord` in the shader.
         *
         * @param {PIXI.Matrix} outputMatrix - The matrix to output to.
         * @param {PIXI.Sprite} sprite - The sprite to map to.
         * @return {PIXI.Matrix} The mapped matrix.
         */
        FilterSystem.prototype.calculateSpriteMatrix = function calculateSpriteMatrix (outputMatrix, sprite)
        {
            var ref = this.activeState;
            var sourceFrame = ref.sourceFrame;
            var destinationFrame = ref.destinationFrame;
            var ref$1 = sprite._texture;
            var orig = ref$1.orig;
            var mappedMatrix = outputMatrix.set(destinationFrame.width, 0, 0,
                destinationFrame.height, sourceFrame.x, sourceFrame.y);
            var worldTransform = sprite.worldTransform.copyTo(math.Matrix.TEMP_MATRIX);

            worldTransform.invert();
            mappedMatrix.prepend(worldTransform);
            mappedMatrix.scale(1.0 / orig.width, 1.0 / orig.height);
            mappedMatrix.translate(sprite.anchor.x, sprite.anchor.y);

            return mappedMatrix;
        };

        /**
         * Destroys this Filter System.
         */
        FilterSystem.prototype.destroy = function destroy ()
        {
            // Those textures has to be destroyed by RenderTextureSystem or FramebufferSystem
            this.texturePool.clear(false);
        };

        /**
         * Gets a Power-of-Two render texture or fullScreen texture
         *
         * @protected
         * @param {number} minWidth - The minimum width of the render texture in real pixels.
         * @param {number} minHeight - The minimum height of the render texture in real pixels.
         * @param {number} [resolution=1] - The resolution of the render texture.
         * @return {PIXI.RenderTexture} The new render texture.
         */
        FilterSystem.prototype.getOptimalFilterTexture = function getOptimalFilterTexture (minWidth, minHeight, resolution)
        {
            if ( resolution === void 0 ) resolution = 1;

            return this.texturePool.getOptimalTexture(minWidth, minHeight, resolution);
        };

        /**
         * Gets extra render texture to use inside current filter
         * To be compliant with older filters, you can use params in any order
         *
         * @param {PIXI.RenderTexture} [input] renderTexture from which size and resolution will be copied
         * @param {number} [resolution] override resolution of the renderTexture
         * @returns {PIXI.RenderTexture}
         */
        FilterSystem.prototype.getFilterTexture = function getFilterTexture (input, resolution)
        {
            if (typeof input === 'number')
            {
                var swap = input;

                input = resolution;
                resolution = swap;
            }

            input = input || this.activeState.renderTexture;

            var filterTexture = this.texturePool.getOptimalTexture(input.width, input.height, resolution || input.resolution);

            filterTexture.filterFrame = input.filterFrame;

            return filterTexture;
        };

        /**
         * Frees a render texture back into the pool.
         *
         * @param {PIXI.RenderTexture} renderTexture - The renderTarget to free
         */
        FilterSystem.prototype.returnFilterTexture = function returnFilterTexture (renderTexture)
        {
            this.texturePool.returnTexture(renderTexture);
        };

        /**
         * Empties the texture pool.
         */
        FilterSystem.prototype.emptyPool = function emptyPool ()
        {
            this.texturePool.clear(true);
        };

        /**
         * calls `texturePool.resize()`, affects fullScreen renderTextures
         */
        FilterSystem.prototype.resize = function resize ()
        {
            this.texturePool.setScreenSize(this.renderer.view);
        };

        return FilterSystem;
    }(System));

    /**
     * Base for a common object renderer that can be used as a
     * system renderer plugin.
     *
     * @class
     * @extends PIXI.System
     * @memberof PIXI
     */
    var ObjectRenderer = function ObjectRenderer(renderer)
    {
        /**
         * The renderer this manager works for.
         *
         * @member {PIXI.Renderer}
         */
        this.renderer = renderer;
    };

    /**
     * Stub method that should be used to empty the current
     * batch by rendering objects now.
     */
    ObjectRenderer.prototype.flush = function flush ()
    {
        // flush!
    };

    /**
     * Generic destruction method that frees all resources. This
     * should be called by subclasses.
     */
    ObjectRenderer.prototype.destroy = function destroy ()
    {
        this.renderer = null;
    };

    /**
     * Stub method that initializes any state required before
     * rendering starts. It is different from the `prerender`
     * signal, which occurs every frame, in that it is called
     * whenever an object requests _this_ renderer specifically.
     */
    ObjectRenderer.prototype.start = function start ()
    {
        // set the shader..
    };

    /**
     * Stops the renderer. It should free up any state and
     * become dormant.
     */
    ObjectRenderer.prototype.stop = function stop ()
    {
        this.flush();
    };

    /**
     * Keeps the object to render. It doesn't have to be
     * rendered immediately.
     *
     * @param {PIXI.DisplayObject} object - The object to render.
     */
    ObjectRenderer.prototype.render = function render (object) // eslint-disable-line no-unused-vars
    {
        // render the object
    };

    /**
     * System plugin to the renderer to manage batching.
     *
     * @class
     * @extends PIXI.System
     * @memberof PIXI.systems
     */
    var BatchSystem = /*@__PURE__*/(function (System) {
        function BatchSystem(renderer)
        {
            System.call(this, renderer);

            /**
             * An empty renderer.
             *
             * @member {PIXI.ObjectRenderer}
             */
            this.emptyRenderer = new ObjectRenderer(renderer);

            /**
             * The currently active ObjectRenderer.
             *
             * @member {PIXI.ObjectRenderer}
             */
            this.currentRenderer = this.emptyRenderer;
        }

        if ( System ) BatchSystem.__proto__ = System;
        BatchSystem.prototype = Object.create( System && System.prototype );
        BatchSystem.prototype.constructor = BatchSystem;

        /**
         * Changes the current renderer to the one given in parameter
         *
         * @param {PIXI.ObjectRenderer} objectRenderer - The object renderer to use.
         */
        BatchSystem.prototype.setObjectRenderer = function setObjectRenderer (objectRenderer)
        {
            if (this.currentRenderer === objectRenderer)
            {
                return;
            }

            this.currentRenderer.stop();
            this.currentRenderer = objectRenderer;

            this.currentRenderer.start();
        };

        /**
         * This should be called if you wish to do some custom rendering
         * It will basically render anything that may be batched up such as sprites
         */
        BatchSystem.prototype.flush = function flush ()
        {
            this.setObjectRenderer(this.emptyRenderer);
        };

        /**
         * Reset the system to an empty renderer
         */
        BatchSystem.prototype.reset = function reset ()
        {
            this.setObjectRenderer(this.emptyRenderer);
        };

        /**
         * Handy function for batch renderers: copies bound textures in first maxTextures locations to array
         * sets actual _batchLocation for them
         *
         * @param arr
         * @param maxTextures
         */
        BatchSystem.prototype.copyBoundTextures = function copyBoundTextures (arr, maxTextures)
        {
            var ref = this.renderer.texture;
            var boundTextures = ref.boundTextures;

            for (var i = maxTextures - 1; i >= 0; --i)
            {
                arr[i] = boundTextures[i] || null;
                if (arr[i])
                {
                    arr[i]._batchLocation = i;
                }
            }
        };

        /**
         * Assigns batch locations to textures in array based on boundTextures state.
         * All textures in texArray should have `_batchEnabled = _batchId`,
         * and their count should be less than `maxTextures`.
         *
         * @param {PIXI.BatchTextureArray} texArray textures to bound
         * @param {PIXI.BaseTexture[]} boundTextures current state of bound textures
         * @param {number} batchId marker for _batchEnabled param of textures in texArray
         * @param {number} maxTextures number of texture locations to manipulate
         */
        BatchSystem.prototype.boundArray = function boundArray (texArray, boundTextures, batchId, maxTextures)
        {
            var elements = texArray.elements;
            var ids = texArray.ids;
            var count = texArray.count;
            var j = 0;

            for (var i = 0; i < count; i++)
            {
                var tex = elements[i];
                var loc = tex._batchLocation;

                if (loc >= 0 && loc < maxTextures
                    && boundTextures[loc] === tex)
                {
                    ids[i] = loc;
                    continue;
                }

                while (j < maxTextures)
                {
                    var bound = boundTextures[j];

                    if (bound && bound._batchEnabled === batchId
                        && bound._batchLocation === j)
                    {
                        j++;
                        continue;
                    }

                    ids[i] = j;
                    tex._batchLocation = j;
                    boundTextures[j] = tex;
                    break;
                }
            }
        };

        return BatchSystem;
    }(System));

    /**
     * The maximum support for using WebGL. If a device does not
     * support WebGL version, for instance WebGL 2, it will still
     * attempt to fallback support to WebGL 1. If you want to
     * explicitly remove feature support to target a more stable
     * baseline, prefer a lower environment.
     *
     * Due to {@link https://bugs.chromium.org/p/chromium/issues/detail?id=934823|bug in chromium}
     * we disable webgl2 by default for all non-apple mobile devices.
     *
     * @static
     * @name PREFER_ENV
     * @memberof PIXI.settings
     * @type {number}
     * @default PIXI.ENV.WEBGL2
     */
    settings.settings.PREFER_ENV = utils.isMobile.any ? constants.ENV.WEBGL : constants.ENV.WEBGL2;

    /**
     * If set to `true`, Textures and BaseTexture objects stored
     * in the caches ({@link PIXI.utils.TextureCache TextureCache} and
     * {@link PIXI.utils.BaseTextureCache BaseTextureCache}) can *only* be
     * used when calling {@link PIXI.Texture.from Texture.from} or
     * {@link PIXI.BaseTexture.from BaseTexture.from}.
     * Otherwise, these `from` calls throw an exception. Using this property
     * can be useful if you want to enforce preloading all assets with
     * {@link PIXI.Loader Loader}.
     *
     * @static
     * @name STRICT_TEXTURE_CACHE
     * @memberof PIXI.settings
     * @type {boolean}
     * @default false
     */
    settings.settings.STRICT_TEXTURE_CACHE = false;

    var CONTEXT_UID = 0;

    /**
     * System plugin to the renderer to manage the context.
     *
     * @class
     * @extends PIXI.System
     * @memberof PIXI.systems
     */
    var ContextSystem = /*@__PURE__*/(function (System) {
        function ContextSystem(renderer)
        {
            System.call(this, renderer);

            /**
             * Either 1 or 2 to reflect the WebGL version being used
             * @member {number}
             * @readonly
             */
            this.webGLVersion = 1;

            /**
             * Extensions being used
             * @member {object}
             * @readonly
             * @property {WEBGL_draw_buffers} drawBuffers - WebGL v1 extension
             * @property {WEBGL_depth_texture} depthTexture - WebGL v1 extension
             * @property {OES_texture_float} floatTexture - WebGL v1 extension
             * @property {WEBGL_lose_context} loseContext - WebGL v1 extension
             * @property {OES_vertex_array_object} vertexArrayObject - WebGL v1 extension
             * @property {EXT_texture_filter_anisotropic} anisotropicFiltering - WebGL v1 and v2 extension
             */
            this.extensions = {};

            // Bind functions
            this.handleContextLost = this.handleContextLost.bind(this);
            this.handleContextRestored = this.handleContextRestored.bind(this);

            renderer.view.addEventListener('webglcontextlost', this.handleContextLost, false);
            renderer.view.addEventListener('webglcontextrestored', this.handleContextRestored, false);
        }

        if ( System ) ContextSystem.__proto__ = System;
        ContextSystem.prototype = Object.create( System && System.prototype );
        ContextSystem.prototype.constructor = ContextSystem;

        var prototypeAccessors = { isLost: { configurable: true } };

        /**
         * `true` if the context is lost
         * @member {boolean}
         * @readonly
         */
        prototypeAccessors.isLost.get = function ()
        {
            return (!this.gl || this.gl.isContextLost());
        };

        /**
         * Handle the context change event
         * @param {WebGLRenderingContext} gl new webgl context
         */
        ContextSystem.prototype.contextChange = function contextChange (gl)
        {
            this.gl = gl;
            this.renderer.gl = gl;
            this.renderer.CONTEXT_UID = CONTEXT_UID++;

            // restore a context if it was previously lost
            if (gl.isContextLost() && gl.getExtension('WEBGL_lose_context'))
            {
                gl.getExtension('WEBGL_lose_context').restoreContext();
            }
        };

        /**
         * Initialize the context
         *
         * @protected
         * @param {WebGLRenderingContext} gl - WebGL context
         */
        ContextSystem.prototype.initFromContext = function initFromContext (gl)
        {
            this.gl = gl;
            this.validateContext(gl);
            this.renderer.gl = gl;
            this.renderer.CONTEXT_UID = CONTEXT_UID++;
            this.renderer.runners.contextChange.run(gl);
        };

        /**
         * Initialize from context options
         *
         * @protected
         * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
         * @param {object} options - context attributes
         */
        ContextSystem.prototype.initFromOptions = function initFromOptions (options)
        {
            var gl = this.createContext(this.renderer.view, options);

            this.initFromContext(gl);
        };

        /**
         * Helper class to create a WebGL Context
         *
         * @param canvas {HTMLCanvasElement} the canvas element that we will get the context from
         * @param options {object} An options object that gets passed in to the canvas element containing the context attributes
         * @see https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement/getContext
         * @return {WebGLRenderingContext} the WebGL context
         */
        ContextSystem.prototype.createContext = function createContext (canvas, options)
        {
            var gl;

            if (settings.settings.PREFER_ENV >= constants.ENV.WEBGL2)
            {
                gl = canvas.getContext('webgl2', options);
            }

            if (gl)
            {
                this.webGLVersion = 2;
            }
            else
            {
                this.webGLVersion = 1;

                gl = canvas.getContext('webgl', options)
                || canvas.getContext('experimental-webgl', options);

                if (!gl)
                {
                    // fail, not able to get a context
                    throw new Error('This browser does not support WebGL. Try using the canvas renderer');
                }
            }

            this.gl = gl;

            this.getExtensions();

            return gl;
        };

        /**
         * Auto-populate the extensions
         *
         * @protected
         */
        ContextSystem.prototype.getExtensions = function getExtensions ()
        {
            // time to set up default extensions that Pixi uses.
            var ref = this;
            var gl = ref.gl;

            if (this.webGLVersion === 1)
            {
                Object.assign(this.extensions, {
                    drawBuffers: gl.getExtension('WEBGL_draw_buffers'),
                    depthTexture: gl.getExtension('WEBKIT_WEBGL_depth_texture'),
                    loseContext: gl.getExtension('WEBGL_lose_context'),
                    vertexArrayObject: gl.getExtension('OES_vertex_array_object')
                        || gl.getExtension('MOZ_OES_vertex_array_object')
                        || gl.getExtension('WEBKIT_OES_vertex_array_object'),
                    anisotropicFiltering: gl.getExtension('EXT_texture_filter_anisotropic'),
                    uint32ElementIndex: gl.getExtension('OES_element_index_uint'),
                    // Floats and half-floats
                    floatTexture: gl.getExtension('OES_texture_float'),
                    floatTextureLinear: gl.getExtension('OES_texture_float_linear'),
                    textureHalfFloat: gl.getExtension('OES_texture_half_float'),
                    textureHalfFloatLinear: gl.getExtension('OES_texture_half_float_linear'),
                });
            }
            else if (this.webGLVersion === 2)
            {
                Object.assign(this.extensions, {
                    anisotropicFiltering: gl.getExtension('EXT_texture_filter_anisotropic'),
                    // Floats and half-floats
                    colorBufferFloat: gl.getExtension('EXT_color_buffer_float'),
                    floatTextureLinear: gl.getExtension('OES_texture_float_linear'),
                });
            }
        };

        /**
         * Handles a lost webgl context
         *
         * @protected
         * @param {WebGLContextEvent} event - The context lost event.
         */
        ContextSystem.prototype.handleContextLost = function handleContextLost (event)
        {
            event.preventDefault();
        };

        /**
         * Handles a restored webgl context
         *
         * @protected
         */
        ContextSystem.prototype.handleContextRestored = function handleContextRestored ()
        {
            this.renderer.runners.contextChange.run(this.gl);
        };

        ContextSystem.prototype.destroy = function destroy ()
        {
            var view = this.renderer.view;

            // remove listeners
            view.removeEventListener('webglcontextlost', this.handleContextLost);
            view.removeEventListener('webglcontextrestored', this.handleContextRestored);

            this.gl.useProgram(null);

            if (this.extensions.loseContext)
            {
                this.extensions.loseContext.loseContext();
            }
        };

        /**
         * Handle the post-render runner event
         *
         * @protected
         */
        ContextSystem.prototype.postrender = function postrender ()
        {
            if (this.renderer.renderingToScreen)
            {
                this.gl.flush();
            }
        };

        /**
         * Validate context
         *
         * @protected
         * @param {WebGLRenderingContext} gl - Render context
         */
        ContextSystem.prototype.validateContext = function validateContext (gl)
        {
            var attributes = gl.getContextAttributes();

            // this is going to be fairly simple for now.. but at least we have room to grow!
            if (!attributes.stencil)
            {
                /* eslint-disable max-len */

                /* eslint-disable no-console */
                console.warn('Provided WebGL context does not have a stencil buffer, masks may not render correctly');
                /* eslint-enable no-console */

                /* eslint-enable max-len */
            }
        };

        Object.defineProperties( ContextSystem.prototype, prototypeAccessors );

        return ContextSystem;
    }(System));

    /**
     * System plugin to the renderer to manage framebuffers.
     *
     * @class
     * @extends PIXI.System
     * @memberof PIXI.systems
     */
    var FramebufferSystem = /*@__PURE__*/(function (System) {
        function FramebufferSystem(renderer)
        {
            System.call(this, renderer);

            /**
             * A list of managed framebuffers
             * @member {PIXI.Framebuffer[]}
             * @readonly
             */
            this.managedFramebuffers = [];

            /**
             * Framebuffer value that shows that we don't know what is bound
             * @member {Framebuffer}
             * @readonly
             */
            this.unknownFramebuffer = new Framebuffer(10, 10);
        }

        if ( System ) FramebufferSystem.__proto__ = System;
        FramebufferSystem.prototype = Object.create( System && System.prototype );
        FramebufferSystem.prototype.constructor = FramebufferSystem;

        var prototypeAccessors = { size: { configurable: true } };

        /**
         * Sets up the renderer context and necessary buffers.
         */
        FramebufferSystem.prototype.contextChange = function contextChange ()
        {
            var gl = this.gl = this.renderer.gl;

            this.CONTEXT_UID = this.renderer.CONTEXT_UID;
            this.current = this.unknownFramebuffer;
            this.viewport = new math.Rectangle();
            this.hasMRT = true;
            this.writeDepthTexture = true;

            this.disposeAll(true);

            // webgl2
            if (this.renderer.context.webGLVersion === 1)
            {
                // webgl 1!
                var nativeDrawBuffersExtension = this.renderer.context.extensions.drawBuffers;
                var nativeDepthTextureExtension = this.renderer.context.extensions.depthTexture;

                if (settings.settings.PREFER_ENV === constants.ENV.WEBGL_LEGACY)
                {
                    nativeDrawBuffersExtension = null;
                    nativeDepthTextureExtension = null;
                }

                if (nativeDrawBuffersExtension)
                {
                    gl.drawBuffers = function (activeTextures) { return nativeDrawBuffersExtension.drawBuffersWEBGL(activeTextures); };
                }
                else
                {
                    this.hasMRT = false;
                    gl.drawBuffers = function () {
                        // empty
                    };
                }

                if (!nativeDepthTextureExtension)
                {
                    this.writeDepthTexture = false;
                }
            }
        };

        /**
         * Bind a framebuffer
         *
         * @param {PIXI.Framebuffer} framebuffer
         * @param {PIXI.Rectangle} [frame] frame, default is framebuffer size
         */
        FramebufferSystem.prototype.bind = function bind (framebuffer, frame)
        {
            var ref = this;
            var gl = ref.gl;

            if (framebuffer)
            {
                // TODO caching layer!

                var fbo = framebuffer.glFramebuffers[this.CONTEXT_UID] || this.initFramebuffer(framebuffer);

                if (this.current !== framebuffer)
                {
                    this.current = framebuffer;
                    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.framebuffer);
                }
                // make sure all textures are unbound..

                // now check for updates...
                if (fbo.dirtyId !== framebuffer.dirtyId)
                {
                    fbo.dirtyId = framebuffer.dirtyId;

                    if (fbo.dirtyFormat !== framebuffer.dirtyFormat)
                    {
                        fbo.dirtyFormat = framebuffer.dirtyFormat;
                        this.updateFramebuffer(framebuffer);
                    }
                    else if (fbo.dirtySize !== framebuffer.dirtySize)
                    {
                        fbo.dirtySize = framebuffer.dirtySize;
                        this.resizeFramebuffer(framebuffer);
                    }
                }

                for (var i = 0; i < framebuffer.colorTextures.length; i++)
                {
                    if (framebuffer.colorTextures[i].texturePart)
                    {
                        this.renderer.texture.unbind(framebuffer.colorTextures[i].texture);
                    }
                    else
                    {
                        this.renderer.texture.unbind(framebuffer.colorTextures[i]);
                    }
                }

                if (framebuffer.depthTexture)
                {
                    this.renderer.texture.unbind(framebuffer.depthTexture);
                }

                if (frame)
                {
                    this.setViewport(frame.x, frame.y, frame.width, frame.height);
                }
                else
                {
                    this.setViewport(0, 0, framebuffer.width, framebuffer.height);
                }
            }
            else
            {
                if (this.current)
                {
                    this.current = null;
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                }

                if (frame)
                {
                    this.setViewport(frame.x, frame.y, frame.width, frame.height);
                }
                else
                {
                    this.setViewport(0, 0, this.renderer.width, this.renderer.height);
                }
            }
        };

        /**
         * Set the WebGLRenderingContext's viewport.
         *
         * @param {Number} x - X position of viewport
         * @param {Number} y - Y position of viewport
         * @param {Number} width - Width of viewport
         * @param {Number} height - Height of viewport
         */
        FramebufferSystem.prototype.setViewport = function setViewport (x, y, width, height)
        {
            var v = this.viewport;

            if (v.width !== width || v.height !== height || v.x !== x || v.y !== y)
            {
                v.x = x;
                v.y = y;
                v.width = width;
                v.height = height;

                this.gl.viewport(x, y, width, height);
            }
        };

        /**
         * Get the size of the current width and height. Returns object with `width` and `height` values.
         *
         * @member {object}
         * @readonly
         */
        prototypeAccessors.size.get = function ()
        {
            if (this.current)
            {
                // TODO store temp
                return { x: 0, y: 0, width: this.current.width, height: this.current.height };
            }

            return { x: 0, y: 0, width: this.renderer.width, height: this.renderer.height };
        };

        /**
         * Clear the color of the context
         *
         * @param {Number} r - Red value from 0 to 1
         * @param {Number} g - Green value from 0 to 1
         * @param {Number} b - Blue value from 0 to 1
         * @param {Number} a - Alpha value from 0 to 1
         */
        FramebufferSystem.prototype.clear = function clear (r, g, b, a)
        {
            var ref = this;
            var gl = ref.gl;

            // TODO clear color can be set only one right?
            gl.clearColor(r, g, b, a);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        };

        /**
         * Initialize framebuffer
         *
         * @protected
         * @param {PIXI.Framebuffer} framebuffer
         */
        FramebufferSystem.prototype.initFramebuffer = function initFramebuffer (framebuffer)
        {
            var ref = this;
            var gl = ref.gl;

            // TODO - make this a class?
            var fbo = {
                framebuffer: gl.createFramebuffer(),
                stencil: null,
                dirtyId: 0,
                dirtyFormat: 0,
                dirtySize: 0,
            };

            framebuffer.glFramebuffers[this.CONTEXT_UID] = fbo;

            this.managedFramebuffers.push(framebuffer);
            framebuffer.disposeRunner.add(this);

            return fbo;
        };

        /**
         * Resize the framebuffer
         *
         * @protected
         * @param {PIXI.Framebuffer} framebuffer
         */
        FramebufferSystem.prototype.resizeFramebuffer = function resizeFramebuffer (framebuffer)
        {
            var ref = this;
            var gl = ref.gl;

            var fbo = framebuffer.glFramebuffers[this.CONTEXT_UID];

            if (fbo.stencil)
            {
                gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.stencil);
                gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, framebuffer.width, framebuffer.height);
            }

            var colorTextures = framebuffer.colorTextures;

            for (var i = 0; i < colorTextures.length; i++)
            {
                this.renderer.texture.bind(colorTextures[i], 0);
            }

            if (framebuffer.depthTexture)
            {
                this.renderer.texture.bind(framebuffer.depthTexture, 0);
            }
        };

        /**
         * Update the framebuffer
         *
         * @protected
         * @param {PIXI.Framebuffer} framebuffer
         */
        FramebufferSystem.prototype.updateFramebuffer = function updateFramebuffer (framebuffer)
        {
            var ref = this;
            var gl = ref.gl;

            var fbo = framebuffer.glFramebuffers[this.CONTEXT_UID];

            // bind the color texture
            var colorTextures = framebuffer.colorTextures;

            var count = colorTextures.length;

            if (!gl.drawBuffers)
            {
                count = Math.min(count, 1);
            }

            var activeTextures = [];

            for (var i = 0; i < count; i++)
            {
                var texture = framebuffer.colorTextures[i];

                if (texture.texturePart)
                {
                    this.renderer.texture.bind(texture.texture, 0);

                    gl.framebufferTexture2D(gl.FRAMEBUFFER,
                        gl.COLOR_ATTACHMENT0 + i,
                        gl.TEXTURE_CUBE_MAP_NEGATIVE_X + texture.side,
                        texture.texture._glTextures[this.CONTEXT_UID].texture,
                        0);
                }
                else
                {
                    this.renderer.texture.bind(texture, 0);

                    gl.framebufferTexture2D(gl.FRAMEBUFFER,
                        gl.COLOR_ATTACHMENT0 + i,
                        gl.TEXTURE_2D,
                        texture._glTextures[this.CONTEXT_UID].texture,
                        0);
                }

                activeTextures.push(gl.COLOR_ATTACHMENT0 + i);
            }

            if (activeTextures.length > 1)
            {
                gl.drawBuffers(activeTextures);
            }

            if (framebuffer.depthTexture)
            {
                var writeDepthTexture = this.writeDepthTexture;

                if (writeDepthTexture)
                {
                    var depthTexture = framebuffer.depthTexture;

                    this.renderer.texture.bind(depthTexture, 0);

                    gl.framebufferTexture2D(gl.FRAMEBUFFER,
                        gl.DEPTH_ATTACHMENT,
                        gl.TEXTURE_2D,
                        depthTexture._glTextures[this.CONTEXT_UID].texture,
                        0);
                }
            }

            if (!fbo.stencil && (framebuffer.stencil || framebuffer.depth))
            {
                fbo.stencil = gl.createRenderbuffer();

                gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.stencil);

                gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, framebuffer.width, framebuffer.height);
                // TODO.. this is depth AND stencil?
                if (!framebuffer.depthTexture)
                { // you can't have both, so one should take priority if enabled
                    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, fbo.stencil);
                }
            }
        };

        /**
         * Disposes framebuffer
         * @param {PIXI.Framebuffer} framebuffer framebuffer that has to be disposed of
         * @param {boolean} [contextLost=false] If context was lost, we suppress all delete function calls
         */
        FramebufferSystem.prototype.disposeFramebuffer = function disposeFramebuffer (framebuffer, contextLost)
        {
            var fbo = framebuffer.glFramebuffers[this.CONTEXT_UID];
            var gl = this.gl;

            if (!fbo)
            {
                return;
            }

            delete framebuffer.glFramebuffers[this.CONTEXT_UID];

            var index = this.managedFramebuffers.indexOf(framebuffer);

            if (index >= 0)
            {
                this.managedFramebuffers.splice(index, 1);
            }

            framebuffer.disposeRunner.remove(this);

            if (!contextLost)
            {
                gl.deleteFramebuffer(fbo.framebuffer);
                if (fbo.stencil)
                {
                    gl.deleteRenderbuffer(fbo.stencil);
                }
            }
        };

        /**
         * Disposes all framebuffers, but not textures bound to them
         * @param {boolean} [contextLost=false] If context was lost, we suppress all delete function calls
         */
        FramebufferSystem.prototype.disposeAll = function disposeAll (contextLost)
        {
            var list = this.managedFramebuffers;

            this.managedFramebuffers = [];

            for (var i = 0; i < list.length; i++)
            {
                this.disposeFramebuffer(list[i], contextLost);
            }
        };

        /**
         * Forcing creation of stencil buffer for current framebuffer, if it wasn't done before.
         * Used by MaskSystem, when its time to use stencil mask for Graphics element.
         *
         * Its an alternative for public lazy `framebuffer.enableStencil`, in case we need stencil without rebind.
         *
         * @private
         */
        FramebufferSystem.prototype.forceStencil = function forceStencil ()
        {
            var framebuffer = this.current;

            if (!framebuffer)
            {
                return;
            }

            var fbo = framebuffer.glFramebuffers[this.CONTEXT_UID];

            if (!fbo || fbo.stencil)
            {
                return;
            }
            framebuffer.enableStencil();

            var w = framebuffer.width;
            var h = framebuffer.height;
            var gl = this.gl;
            var stencil = gl.createRenderbuffer();

            gl.bindRenderbuffer(gl.RENDERBUFFER, stencil);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, w, h);

            fbo.stencil = stencil;
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, stencil);
        };

        /**
         * resets framebuffer stored state, binds screen framebuffer
         *
         * should be called before renderTexture reset()
         */
        FramebufferSystem.prototype.reset = function reset ()
        {
            this.current = this.unknownFramebuffer;
            this.viewport = new math.Rectangle();
        };

        Object.defineProperties( FramebufferSystem.prototype, prototypeAccessors );

        return FramebufferSystem;
    }(System));

    var GLBuffer = function GLBuffer(buffer)
    {
        this.buffer = buffer;
        this.updateID = -1;
        this.byteLength = -1;
        this.refCount = 0;
    };

    var byteSizeMap$1 = { 5126: 4, 5123: 2, 5121: 1 };

    /**
     * System plugin to the renderer to manage geometry.
     *
     * @class
     * @extends PIXI.System
     * @memberof PIXI.systems
     */
    var GeometrySystem = /*@__PURE__*/(function (System) {
        function GeometrySystem(renderer)
        {
            System.call(this, renderer);

            this._activeGeometry = null;
            this._activeVao = null;

            /**
             * `true` if we has `*_vertex_array_object` extension
             * @member {boolean}
             * @readonly
             */
            this.hasVao = true;

            /**
             * `true` if has `ANGLE_instanced_arrays` extension
             * @member {boolean}
             * @readonly
             */
            this.hasInstance = true;

            /**
             * `true` if support `gl.UNSIGNED_INT` in `gl.drawElements` or `gl.drawElementsInstanced`
             * @member {boolean}
             * @readonly
             */
            this.canUseUInt32ElementIndex = false;

            /**
             * A cache of currently bound buffer,
             * contains only two members with keys ARRAY_BUFFER and ELEMENT_ARRAY_BUFFER
             * @member {Object.<number, PIXI.Buffer>}
             * @readonly
             */
            this.boundBuffers = {};

            /**
             * Cache for all geometries by id, used in case renderer gets destroyed or for profiling
             * @member {object}
             * @readonly
             */
            this.managedGeometries = {};

            /**
             * Cache for all buffers by id, used in case renderer gets destroyed or for profiling
             * @member {object}
             * @readonly
             */
            this.managedBuffers = {};
        }

        if ( System ) GeometrySystem.__proto__ = System;
        GeometrySystem.prototype = Object.create( System && System.prototype );
        GeometrySystem.prototype.constructor = GeometrySystem;

        /**
         * Sets up the renderer context and necessary buffers.
         */
        GeometrySystem.prototype.contextChange = function contextChange ()
        {
            this.disposeAll(true);

            var gl = this.gl = this.renderer.gl;
            var context = this.renderer.context;

            this.CONTEXT_UID = this.renderer.CONTEXT_UID;

            // webgl2
            if (!gl.createVertexArray)
            {
                // webgl 1!
                var nativeVaoExtension = this.renderer.context.extensions.vertexArrayObject;

                if (settings.settings.PREFER_ENV === constants.ENV.WEBGL_LEGACY)
                {
                    nativeVaoExtension = null;
                }

                if (nativeVaoExtension)
                {
                    gl.createVertexArray = function () { return nativeVaoExtension.createVertexArrayOES(); };

                    gl.bindVertexArray = function (vao) { return nativeVaoExtension.bindVertexArrayOES(vao); };

                    gl.deleteVertexArray = function (vao) { return nativeVaoExtension.deleteVertexArrayOES(vao); };
                }
                else
                {
                    this.hasVao = false;
                    gl.createVertexArray = function () {
                        // empty
                    };

                    gl.bindVertexArray = function () {
                        // empty
                    };

                    gl.deleteVertexArray = function () {
                        // empty
                    };
                }
            }

            if (!gl.vertexAttribDivisor)
            {
                var instanceExt = gl.getExtension('ANGLE_instanced_arrays');

                if (instanceExt)
                {
                    gl.vertexAttribDivisor = function (a, b) { return instanceExt.vertexAttribDivisorANGLE(a, b); };

                    gl.drawElementsInstanced = function (a, b, c, d, e) { return instanceExt.drawElementsInstancedANGLE(a, b, c, d, e); };

                    gl.drawArraysInstanced = function (a, b, c, d) { return instanceExt.drawArraysInstancedANGLE(a, b, c, d); };
                }
                else
                {
                    this.hasInstance = false;
                }
            }

            this.canUseUInt32ElementIndex = context.webGLVersion === 2 || !!context.extensions.uint32ElementIndex;
        };

        /**
         * Binds geometry so that is can be drawn. Creating a Vao if required
         *
         * @param {PIXI.Geometry} geometry instance of geometry to bind
         * @param {PIXI.Shader} [shader] instance of shader to use vao for
         */
        GeometrySystem.prototype.bind = function bind (geometry, shader)
        {
            shader = shader || this.renderer.shader.shader;

            var ref = this;
            var gl = ref.gl;

            // not sure the best way to address this..
            // currently different shaders require different VAOs for the same geometry
            // Still mulling over the best way to solve this one..
            // will likely need to modify the shader attribute locations at run time!
            var vaos = geometry.glVertexArrayObjects[this.CONTEXT_UID];

            if (!vaos)
            {
                this.managedGeometries[geometry.id] = geometry;
                geometry.disposeRunner.add(this);
                geometry.glVertexArrayObjects[this.CONTEXT_UID] = vaos = {};
            }

            var vao = vaos[shader.program.id] || this.initGeometryVao(geometry, shader.program);

            this._activeGeometry = geometry;

            if (this._activeVao !== vao)
            {
                this._activeVao = vao;

                if (this.hasVao)
                {
                    gl.bindVertexArray(vao);
                }
                else
                {
                    this.activateVao(geometry, shader.program);
                }
            }

            // TODO - optimise later!
            // don't need to loop through if nothing changed!
            // maybe look to add an 'autoupdate' to geometry?
            this.updateBuffers();
        };

        /**
         * Reset and unbind any active VAO and geometry
         */
        GeometrySystem.prototype.reset = function reset ()
        {
            this.unbind();
        };

        /**
         * Update buffers
         * @protected
         */
        GeometrySystem.prototype.updateBuffers = function updateBuffers ()
        {
            var geometry = this._activeGeometry;
            var ref = this;
            var gl = ref.gl;

            for (var i = 0; i < geometry.buffers.length; i++)
            {
                var buffer = geometry.buffers[i];

                var glBuffer = buffer._glBuffers[this.CONTEXT_UID];

                if (buffer._updateID !== glBuffer.updateID)
                {
                    glBuffer.updateID = buffer._updateID;

                    // TODO can cache this on buffer! maybe added a getter / setter?
                    var type = buffer.index ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;

                    // TODO this could change if the VAO changes...
                    // need to come up with a better way to cache..
                    // if (this.boundBuffers[type] !== glBuffer)
                    // {
                    // this.boundBuffers[type] = glBuffer;
                    gl.bindBuffer(type, glBuffer.buffer);
                    // }

                    this._boundBuffer = glBuffer;

                    if (glBuffer.byteLength >= buffer.data.byteLength)
                    {
                        // offset is always zero for now!
                        gl.bufferSubData(type, 0, buffer.data);
                    }
                    else
                    {
                        var drawType = buffer.static ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW;

                        glBuffer.byteLength = buffer.data.byteLength;
                        gl.bufferData(type, buffer.data, drawType);
                    }
                }
            }
        };

        /**
         * Check compability between a geometry and a program
         * @protected
         * @param {PIXI.Geometry} geometry - Geometry instance
         * @param {PIXI.Program} program - Program instance
         */
        GeometrySystem.prototype.checkCompatibility = function checkCompatibility (geometry, program)
        {
            // geometry must have at least all the attributes that the shader requires.
            var geometryAttributes = geometry.attributes;
            var shaderAttributes = program.attributeData;

            for (var j in shaderAttributes)
            {
                if (!geometryAttributes[j])
                {
                    throw new Error(("shader and geometry incompatible, geometry missing the \"" + j + "\" attribute"));
                }
            }
        };

        /**
         * Takes a geometry and program and generates a unique signature for them.
         *
         * @param {PIXI.Geometry} geometry to get signature from
         * @param {PIXI.Program} program to test geometry against
         * @returns {String} Unique signature of the geometry and program
         * @protected
         */
        GeometrySystem.prototype.getSignature = function getSignature (geometry, program)
        {
            var attribs = geometry.attributes;
            var shaderAttributes = program.attributeData;

            var strings = ['g', geometry.id];

            for (var i in attribs)
            {
                if (shaderAttributes[i])
                {
                    strings.push(i);
                }
            }

            return strings.join('-');
        };

        /**
         * Creates or gets Vao with the same structure as the geometry and stores it on the geometry.
         * If vao is created, it is bound automatically.
         *
         * @protected
         * @param {PIXI.Geometry} geometry - Instance of geometry to to generate Vao for
         * @param {PIXI.Program} program - Instance of program
         */
        GeometrySystem.prototype.initGeometryVao = function initGeometryVao (geometry, program)
        {
            this.checkCompatibility(geometry, program);

            var gl = this.gl;
            var CONTEXT_UID = this.CONTEXT_UID;

            var signature = this.getSignature(geometry, program);

            var vaoObjectHash = geometry.glVertexArrayObjects[this.CONTEXT_UID];

            var vao = vaoObjectHash[signature];

            if (vao)
            {
                // this will give us easy access to the vao
                vaoObjectHash[program.id] = vao;

                return vao;
            }

            var buffers = geometry.buffers;
            var attributes = geometry.attributes;
            var tempStride = {};
            var tempStart = {};

            for (var j in buffers)
            {
                tempStride[j] = 0;
                tempStart[j] = 0;
            }

            for (var j$1 in attributes)
            {
                if (!attributes[j$1].size && program.attributeData[j$1])
                {
                    attributes[j$1].size = program.attributeData[j$1].size;
                }
                else if (!attributes[j$1].size)
                {
                    console.warn(("PIXI Geometry attribute '" + j$1 + "' size cannot be determined (likely the bound shader does not have the attribute)"));  // eslint-disable-line
                }

                tempStride[attributes[j$1].buffer] += attributes[j$1].size * byteSizeMap$1[attributes[j$1].type];
            }

            for (var j$2 in attributes)
            {
                var attribute = attributes[j$2];
                var attribSize = attribute.size;

                if (attribute.stride === undefined)
                {
                    if (tempStride[attribute.buffer] === attribSize * byteSizeMap$1[attribute.type])
                    {
                        attribute.stride = 0;
                    }
                    else
                    {
                        attribute.stride = tempStride[attribute.buffer];
                    }
                }

                if (attribute.start === undefined)
                {
                    attribute.start = tempStart[attribute.buffer];

                    tempStart[attribute.buffer] += attribSize * byteSizeMap$1[attribute.type];
                }
            }

            vao = gl.createVertexArray();

            gl.bindVertexArray(vao);

            // first update - and create the buffers!
            // only create a gl buffer if it actually gets
            for (var i = 0; i < buffers.length; i++)
            {
                var buffer = buffers[i];

                if (!buffer._glBuffers[CONTEXT_UID])
                {
                    buffer._glBuffers[CONTEXT_UID] = new GLBuffer(gl.createBuffer());
                    this.managedBuffers[buffer.id] = buffer;
                    buffer.disposeRunner.add(this);
                }

                buffer._glBuffers[CONTEXT_UID].refCount++;
            }

            // TODO - maybe make this a data object?
            // lets wait to see if we need to first!

            this.activateVao(geometry, program);

            this._activeVao = vao;

            // add it to the cache!
            vaoObjectHash[program.id] = vao;
            vaoObjectHash[signature] = vao;

            return vao;
        };

        /**
         * Disposes buffer
         * @param {PIXI.Buffer} buffer buffer with data
         * @param {boolean} [contextLost=false] If context was lost, we suppress deleteVertexArray
         */
        GeometrySystem.prototype.disposeBuffer = function disposeBuffer (buffer, contextLost)
        {
            if (!this.managedBuffers[buffer.id])
            {
                return;
            }

            delete this.managedBuffers[buffer.id];

            var glBuffer = buffer._glBuffers[this.CONTEXT_UID];
            var gl = this.gl;

            buffer.disposeRunner.remove(this);

            if (!glBuffer)
            {
                return;
            }

            if (!contextLost)
            {
                gl.deleteBuffer(glBuffer.buffer);
            }

            delete buffer._glBuffers[this.CONTEXT_UID];
        };

        /**
         * Disposes geometry
         * @param {PIXI.Geometry} geometry Geometry with buffers. Only VAO will be disposed
         * @param {boolean} [contextLost=false] If context was lost, we suppress deleteVertexArray
         */
        GeometrySystem.prototype.disposeGeometry = function disposeGeometry (geometry, contextLost)
        {
            if (!this.managedGeometries[geometry.id])
            {
                return;
            }

            delete this.managedGeometries[geometry.id];

            var vaos = geometry.glVertexArrayObjects[this.CONTEXT_UID];
            var gl = this.gl;
            var buffers = geometry.buffers;

            geometry.disposeRunner.remove(this);

            if (!vaos)
            {
                return;
            }

            for (var i = 0; i < buffers.length; i++)
            {
                var buf = buffers[i]._glBuffers[this.CONTEXT_UID];

                buf.refCount--;
                if (buf.refCount === 0 && !contextLost)
                {
                    this.disposeBuffer(buffers[i], contextLost);
                }
            }

            if (!contextLost)
            {
                for (var vaoId in vaos)
                {
                    // delete only signatures, everything else are copies
                    if (vaoId[0] === 'g')
                    {
                        var vao = vaos[vaoId];

                        if (this._activeVao === vao)
                        {
                            this.unbind();
                        }
                        gl.deleteVertexArray(vao);
                    }
                }
            }

            delete geometry.glVertexArrayObjects[this.CONTEXT_UID];
        };

        /**
         * dispose all WebGL resources of all managed geometries and buffers
         * @param {boolean} [contextLost=false] If context was lost, we suppress `gl.delete` calls
         */
        GeometrySystem.prototype.disposeAll = function disposeAll (contextLost)
        {
            var all = Object.keys(this.managedGeometries);

            for (var i = 0; i < all.length; i++)
            {
                this.disposeGeometry(this.managedGeometries[all[i]], contextLost);
            }
            all = Object.keys(this.managedBuffers);
            for (var i$1 = 0; i$1 < all.length; i$1++)
            {
                this.disposeBuffer(this.managedBuffers[all[i$1]], contextLost);
            }
        };

        /**
         * Activate vertex array object
         *
         * @protected
         * @param {PIXI.Geometry} geometry - Geometry instance
         * @param {PIXI.Program} program - Shader program instance
         */
        GeometrySystem.prototype.activateVao = function activateVao (geometry, program)
        {
            var gl = this.gl;
            var CONTEXT_UID = this.CONTEXT_UID;
            var buffers = geometry.buffers;
            var attributes = geometry.attributes;

            if (geometry.indexBuffer)
            {
                // first update the index buffer if we have one..
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.indexBuffer._glBuffers[CONTEXT_UID].buffer);
            }

            var lastBuffer = null;

            // add a new one!
            for (var j in attributes)
            {
                var attribute = attributes[j];
                var buffer = buffers[attribute.buffer];
                var glBuffer = buffer._glBuffers[CONTEXT_UID];

                if (program.attributeData[j])
                {
                    if (lastBuffer !== glBuffer)
                    {
                        gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer.buffer);

                        lastBuffer = glBuffer;
                    }

                    var location = program.attributeData[j].location;

                    // TODO introduce state again
                    // we can optimise this for older devices that have no VAOs
                    gl.enableVertexAttribArray(location);

                    gl.vertexAttribPointer(location,
                        attribute.size,
                        attribute.type || gl.FLOAT,
                        attribute.normalized,
                        attribute.stride,
                        attribute.start);

                    if (attribute.instance)
                    {
                        // TODO calculate instance count based of this...
                        if (this.hasInstance)
                        {
                            gl.vertexAttribDivisor(location, 1);
                        }
                        else
                        {
                            throw new Error('geometry error, GPU Instancing is not supported on this device');
                        }
                    }
                }
            }
        };

        /**
         * Draw the geometry
         *
         * @param {Number} type - the type primitive to render
         * @param {Number} [size] - the number of elements to be rendered
         * @param {Number} [start] - Starting index
         * @param {Number} [instanceCount] - the number of instances of the set of elements to execute
         */
        GeometrySystem.prototype.draw = function draw (type, size, start, instanceCount)
        {
            var ref = this;
            var gl = ref.gl;
            var geometry = this._activeGeometry;

            // TODO.. this should not change so maybe cache the function?

            if (geometry.indexBuffer)
            {
                var byteSize = geometry.indexBuffer.data.BYTES_PER_ELEMENT;
                var glType = byteSize === 2 ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;

                if (byteSize === 2 || (byteSize === 4 && this.canUseUInt32ElementIndex))
                {
                    if (geometry.instanced)
                    {
                        /* eslint-disable max-len */
                        gl.drawElementsInstanced(type, size || geometry.indexBuffer.data.length, glType, (start || 0) * byteSize, instanceCount || 1);
                        /* eslint-enable max-len */
                    }
                    else
                    {
                        /* eslint-disable max-len */
                        gl.drawElements(type, size || geometry.indexBuffer.data.length, glType, (start || 0) * byteSize);
                        /* eslint-enable max-len */
                    }
                }
                else
                {
                    console.warn('unsupported index buffer type: uint32');
                }
            }
            else if (geometry.instanced)
            {
                // TODO need a better way to calculate size..
                gl.drawArraysInstanced(type, start, size || geometry.getSize(), instanceCount || 1);
            }
            else
            {
                gl.drawArrays(type, start, size || geometry.getSize());
            }

            return this;
        };

        /**
         * Unbind/reset everything
         * @protected
         */
        GeometrySystem.prototype.unbind = function unbind ()
        {
            this.gl.bindVertexArray(null);
            this._activeVao = null;
            this._activeGeometry = null;
        };

        return GeometrySystem;
    }(System));

    /**
     * Component for masked elements
     *
     * Holds mask mode and temporary data about current mask
     *
     * @class
     * @memberof PIXI
     */
    var MaskData = function MaskData(maskObject)
    {
        /**
         * Mask type
         * @member {PIXI.MASK_TYPES}
         */
        this.type = constants.MASK_TYPES.NONE;

        /**
         * Whether we know the mask type beforehand
         * @member {boolean}
         * @default true
         */
        this.autoDetect = true;

        /**
         * Which element we use to mask
         * @member {PIXI.DisplayObject}
         */
        this.maskObject = maskObject || null;

        /**
         * Whether it belongs to MaskSystem pool
         * @member {boolean}
         */
        this.pooled = false;

        /**
         * Indicator of the type
         * @member {boolean}
         */
        this.isMaskData = true;

        /**
         * Stencil counter above the mask in stack
         * @member {number}
         * @private
         */
        this._stencilCounter = 0;
        /**
         * Scissor counter above the mask in stack
         * @member {number}
         * @private
         */
        this._scissorCounter = 0;

        /**
         * Scissor operation above the mask in stack.
         * Null if _scissorCounter is zero, rectangle instance if positive.
         * @member {PIXI.Rectangle}
         */
        this._scissorRect = null;

        /**
         * Targeted element. Temporary variable set by MaskSystem
         * @member {PIXI.DisplayObject}
         * @private
         */
        this._target = null;
    };

    /**
     * resets the mask data after popMask()
     */
    MaskData.prototype.reset = function reset ()
    {
        if (this.pooled)
        {
            this.maskObject = null;

            this.type = constants.MASK_TYPES.NONE;

            this.autoDetect = true;
        }

        this._target = null;
    };

    /**
     * copies counters from maskData above, called from pushMask()
     * @param {PIXI.MaskData|null} maskAbove
     */
    MaskData.prototype.copyCountersOrReset = function copyCountersOrReset (maskAbove)
    {
        if (maskAbove)
        {
            this._stencilCounter = maskAbove._stencilCounter;
            this._scissorCounter = maskAbove._scissorCounter;
            this._scissorRect = maskAbove._scissorRect;
        }
        else
        {
            this._stencilCounter = 0;
            this._scissorCounter = 0;
            this._scissorRect = null;
        }
    };

    /**
     * @method compileProgram
     * @private
     * @memberof PIXI.glCore.shader
     * @param gl {WebGLRenderingContext} The current WebGL context {WebGLProgram}
     * @param vertexSrc {string|string[]} The vertex shader source as an array of strings.
     * @param fragmentSrc {string|string[]} The fragment shader source as an array of strings.
     * @param attributeLocations {Object} An attribute location map that lets you manually set the attribute locations
     * @return {WebGLProgram} the shader program
     */
    function compileProgram(gl, vertexSrc, fragmentSrc, attributeLocations)
    {
        var glVertShader = compileShader(gl, gl.VERTEX_SHADER, vertexSrc);
        var glFragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);

        var program = gl.createProgram();

        gl.attachShader(program, glVertShader);
        gl.attachShader(program, glFragShader);

        // optionally, set the attributes manually for the program rather than letting WebGL decide..
        if (attributeLocations)
        {
            for (var i in attributeLocations)
            {
                gl.bindAttribLocation(program, attributeLocations[i], i);
            }
        }

        gl.linkProgram(program);

        // if linking fails, then log and cleanup
        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        {
            if (!gl.getShaderParameter(glVertShader, gl.COMPILE_STATUS))
            {
                console.warn(vertexSrc);
                console.error(gl.getShaderInfoLog(glVertShader));
            }

            if (!gl.getShaderParameter(glFragShader, gl.COMPILE_STATUS))
            {
                console.warn(fragmentSrc);
                console.error(gl.getShaderInfoLog(glFragShader));
            }

            console.error('Pixi.js Error: Could not initialize shader.');
            console.error('gl.VALIDATE_STATUS', gl.getProgramParameter(program, gl.VALIDATE_STATUS));
            console.error('gl.getError()', gl.getError());

            // if there is a program info log, log it
            if (gl.getProgramInfoLog(program) !== '')
            {
                console.warn('Pixi.js Warning: gl.getProgramInfoLog()', gl.getProgramInfoLog(program));
            }

            gl.deleteProgram(program);
            program = null;
        }

        // clean up some shaders
        gl.deleteShader(glVertShader);
        gl.deleteShader(glFragShader);

        return program;
    }

    /**
     * @private
     * @param gl {WebGLRenderingContext} The current WebGL context {WebGLProgram}
     * @param type {Number} the type, can be either VERTEX_SHADER or FRAGMENT_SHADER
     * @param vertexSrc {string|string[]} The vertex shader source as an array of strings.
     * @return {WebGLShader} the shader
     */
    function compileShader(gl, type, src)
    {
        var shader = gl.createShader(type);

        gl.shaderSource(shader, src);
        gl.compileShader(shader);

        return shader;
    }

    /**
     * @method defaultValue
     * @memberof PIXI.glCore.shader
     * @param type {String} Type of value
     * @param size {Number}
     * @private
     */
    function defaultValue(type, size)
    {
        switch (type)
        {
            case 'float':
                return 0;

            case 'vec2':
                return new Float32Array(2 * size);

            case 'vec3':
                return new Float32Array(3 * size);

            case 'vec4':
                return new Float32Array(4 * size);

            case 'int':
            case 'sampler2D':
            case 'sampler2DArray':
                return 0;

            case 'ivec2':
                return new Int32Array(2 * size);

            case 'ivec3':
                return new Int32Array(3 * size);

            case 'ivec4':
                return new Int32Array(4 * size);

            case 'bool':
                return false;

            case 'bvec2':

                return booleanArray(2 * size);

            case 'bvec3':
                return booleanArray(3 * size);

            case 'bvec4':
                return booleanArray(4 * size);

            case 'mat2':
                return new Float32Array([1, 0,
                    0, 1]);

            case 'mat3':
                return new Float32Array([1, 0, 0,
                    0, 1, 0,
                    0, 0, 1]);

            case 'mat4':
                return new Float32Array([1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1]);
        }

        return null;
    }

    function booleanArray(size)
    {
        var array = new Array(size);

        for (var i = 0; i < array.length; i++)
        {
            array[i] = false;
        }

        return array;
    }

    var unknownContext = {};
    var context = unknownContext;

    /**
     * returns a little WebGL context to use for program inspection.
     *
     * @static
     * @private
     * @returns {WebGLRenderingContext} a gl context to test with
     */
    function getTestContext()
    {
        if (context === unknownContext || (context && context.isContextLost()))
        {
            var canvas = document.createElement('canvas');

            var gl;

            if (settings.settings.PREFER_ENV >= constants.ENV.WEBGL2)
            {
                gl = canvas.getContext('webgl2', {});
            }

            if (!gl)
            {
                gl = canvas.getContext('webgl', {})
                || canvas.getContext('experimental-webgl', {});

                if (!gl)
                {
                    // fail, not able to get a context
                    gl = null;
                }
                else
                {
                    // for shader testing..
                    gl.getExtension('WEBGL_draw_buffers');
                }
            }

            context = gl;
        }

        return context;
    }

    var maxFragmentPrecision;

    function getMaxFragmentPrecision()
    {
        if (!maxFragmentPrecision)
        {
            maxFragmentPrecision = constants.PRECISION.MEDIUM;
            var gl = getTestContext();

            if (gl)
            {
                if (gl.getShaderPrecisionFormat)
                {
                    var shaderFragment = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);

                    maxFragmentPrecision = shaderFragment.precision ? constants.PRECISION.HIGH : constants.PRECISION.MEDIUM;
                }
            }
        }

        return maxFragmentPrecision;
    }

    /**
     * Sets the float precision on the shader, ensuring the device supports the request precision.
     * If the precision is already present, it just ensures that the device is able to handle it.
     *
     * @private
     * @param {string} src - The shader source
     * @param {string} requestedPrecision - The request float precision of the shader. Options are 'lowp', 'mediump' or 'highp'.
     * @param {string} maxSupportedPrecision - The maximum precision the shader supports.
     *
     * @return {string} modified shader source
     */
    function setPrecision(src, requestedPrecision, maxSupportedPrecision)
    {
        if (src.substring(0, 9) !== 'precision')
        {
            // no precision supplied, so PixiJS will add the requested level.
            var precision = requestedPrecision;

            // If highp is requested but not supported, downgrade precision to a level all devices support.
            if (requestedPrecision === constants.PRECISION.HIGH && maxSupportedPrecision !== constants.PRECISION.HIGH)
            {
                precision = constants.PRECISION.MEDIUM;
            }

            return ("precision " + precision + " float;\n" + src);
        }
        else if (maxSupportedPrecision !== constants.PRECISION.HIGH && src.substring(0, 15) === 'precision highp')
        {
            // precision was supplied, but at a level this device does not support, so downgrading to mediump.
            return src.replace('precision highp', 'precision mediump');
        }

        return src;
    }

    var GLSL_TO_SIZE = {
        float:    1,
        vec2:     2,
        vec3:     3,
        vec4:     4,

        int:      1,
        ivec2:    2,
        ivec3:    3,
        ivec4:    4,

        bool:     1,
        bvec2:    2,
        bvec3:    3,
        bvec4:    4,

        mat2:     4,
        mat3:     9,
        mat4:     16,

        sampler2D:  1,
    };

    /**
     * @private
     * @method mapSize
     * @memberof PIXI.glCore.shader
     * @param type {String}
     * @return {Number}
     */
    function mapSize(type)
    {
        return GLSL_TO_SIZE[type];
    }

    var GL_TABLE = null;

    var GL_TO_GLSL_TYPES = {
        FLOAT:       'float',
        FLOAT_VEC2:  'vec2',
        FLOAT_VEC3:  'vec3',
        FLOAT_VEC4:  'vec4',

        INT:         'int',
        INT_VEC2:    'ivec2',
        INT_VEC3:    'ivec3',
        INT_VEC4:    'ivec4',

        BOOL:        'bool',
        BOOL_VEC2:   'bvec2',
        BOOL_VEC3:   'bvec3',
        BOOL_VEC4:   'bvec4',

        FLOAT_MAT2:  'mat2',
        FLOAT_MAT3:  'mat3',
        FLOAT_MAT4:  'mat4',

        SAMPLER_2D:  'sampler2D',
        SAMPLER_CUBE:  'samplerCube',
        SAMPLER_2D_ARRAY:  'sampler2DArray',
    };

    function mapType(gl, type)
    {
        if (!GL_TABLE)
        {
            var typeNames = Object.keys(GL_TO_GLSL_TYPES);

            GL_TABLE = {};

            for (var i = 0; i < typeNames.length; ++i)
            {
                var tn = typeNames[i];

                GL_TABLE[gl[tn]] = GL_TO_GLSL_TYPES[tn];
            }
        }

        return GL_TABLE[type];
    }

    // cv = CachedValue
    // v = value
    // ud = uniformData
    // uv = uniformValue
    // l = location
    var GLSL_TO_SINGLE_SETTERS_CACHED = {

        float: "\n    if(cv !== v)\n    {\n        cv.v = v;\n        gl.uniform1f(location, v)\n    }",

        vec2: "\n    if(cv[0] !== v[0] || cv[1] !== v[1])\n    {\n        cv[0] = v[0];\n        cv[1] = v[1];\n        gl.uniform2f(location, v[0], v[1])\n    }",

        vec3: "\n    if(cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])\n    {\n        cv[0] = v[0];\n        cv[1] = v[1];\n        cv[2] = v[2];\n\n        gl.uniform3f(location, v[0], v[1], v[2])\n    }",

        vec4:     'gl.uniform4f(location, v[0], v[1], v[2], v[3])',

        int:      'gl.uniform1i(location, v)',
        ivec2:    'gl.uniform2i(location, v[0], v[1])',
        ivec3:    'gl.uniform3i(location, v[0], v[1], v[2])',
        ivec4:    'gl.uniform4i(location, v[0], v[1], v[2], v[3])',

        bool:     'gl.uniform1i(location, v)',
        bvec2:    'gl.uniform2i(location, v[0], v[1])',
        bvec3:    'gl.uniform3i(location, v[0], v[1], v[2])',
        bvec4:    'gl.uniform4i(location, v[0], v[1], v[2], v[3])',

        mat2:     'gl.uniformMatrix2fv(location, false, v)',
        mat3:     'gl.uniformMatrix3fv(location, false, v)',
        mat4:     'gl.uniformMatrix4fv(location, false, v)',

        sampler2D:      'gl.uniform1i(location, v)',
        samplerCube:    'gl.uniform1i(location, v)',
        sampler2DArray: 'gl.uniform1i(location, v)',
    };

    var GLSL_TO_ARRAY_SETTERS = {

        float:    "gl.uniform1fv(location, v)",

        vec2:     "gl.uniform2fv(location, v)",
        vec3:     "gl.uniform3fv(location, v)",
        vec4:     'gl.uniform4fv(location, v)',

        mat4:     'gl.uniformMatrix4fv(location, false, v)',
        mat3:     'gl.uniformMatrix3fv(location, false, v)',
        mat2:     'gl.uniformMatrix2fv(location, false, v)',

        int:      'gl.uniform1iv(location, v)',
        ivec2:    'gl.uniform2iv(location, v)',
        ivec3:    'gl.uniform3iv(location, v)',
        ivec4:    'gl.uniform4iv(location, v)',

        bool:     'gl.uniform1iv(location, v)',
        bvec2:    'gl.uniform2iv(location, v)',
        bvec3:    'gl.uniform3iv(location, v)',
        bvec4:    'gl.uniform4iv(location, v)',

        sampler2D:      'gl.uniform1iv(location, v)',
        samplerCube:    'gl.uniform1iv(location, v)',
        sampler2DArray: 'gl.uniform1iv(location, v)',
    };

    function generateUniformsSync(group, uniformData)
    {
        var func = "var v = null;\n    var cv = null\n    var t = 0;\n    var gl = renderer.gl\n    ";

        for (var i in group.uniforms)
        {
            var data = uniformData[i];

            if (!data)
            {
                if (group.uniforms[i].group)
                {
                    func += "\n                    renderer.shader.syncUniformGroup(uv." + i + ", syncData);\n                ";
                }

                continue;
            }

            // TODO && uniformData[i].value !== 0 <-- do we still need this?
            if (data.type === 'float' && data.size === 1)
            {
                func += "\n            if(uv." + i + " !== ud." + i + ".value)\n            {\n                ud." + i + ".value = uv." + i + "\n                gl.uniform1f(ud." + i + ".location, uv." + i + ")\n            }\n";
            }
            /* eslint-disable max-len */
            else if ((data.type === 'sampler2D' || data.type === 'samplerCube' || data.type === 'sampler2DArray') && data.size === 1 && !data.isArray)
            /* eslint-disable max-len */
            {
                func += "\n\n            t = syncData.textureCount++;\n\n            renderer.texture.bind(uv." + i + ", t);\n            \n            if(ud." + i + ".value !== t)\n            {\n                ud." + i + ".value = t;\n                gl.uniform1i(ud." + i + ".location, t);\n; // eslint-disable-line max-len\n            }\n";
            }
            else if (data.type === 'mat3' && data.size === 1)
            {
                if (group.uniforms[i].a !== undefined)
                {
                    // TODO and some smart caching dirty ids here!
                    func += "\n                gl.uniformMatrix3fv(ud." + i + ".location, false, uv." + i + ".toArray(true));\n                \n";
                }
                else
                {
                    func += "\n                gl.uniformMatrix3fv(ud." + i + ".location, false, uv." + i + ");\n                \n";
                }
            }
            else if (data.type === 'vec2' && data.size === 1)
            {
                // TODO - do we need both here?
                // maybe we can get away with only using points?
                if (group.uniforms[i].x !== undefined)
                {
                    func += "\n                cv = ud." + i + ".value;\n                v = uv." + i + ";\n\n                if(cv[0] !== v.x || cv[1] !== v.y)\n                {\n                    cv[0] = v.x;\n                    cv[1] = v.y;\n                    gl.uniform2f(ud." + i + ".location, v.x, v.y);\n                }\n";
                }
                else
                {
                    func += "\n                cv = ud." + i + ".value;\n                v = uv." + i + ";\n\n                if(cv[0] !== v[0] || cv[1] !== v[1])\n                {\n                    cv[0] = v[0];\n                    cv[1] = v[1];\n                    gl.uniform2f(ud." + i + ".location, v[0], v[1]);\n                }\n                \n";
                }
            }
            else if (data.type === 'vec4' && data.size === 1)
            {
                // TODO - do we need both here?
                // maybe we can get away with only using points?
                if (group.uniforms[i].width !== undefined)
                {
                    func += "\n                cv = ud." + i + ".value;\n                v = uv." + i + ";\n\n                if(cv[0] !== v.x || cv[1] !== v.y || cv[2] !== v.width || cv[3] !== v.height)\n                {\n                    cv[0] = v.x;\n                    cv[1] = v.y;\n                    cv[2] = v.width;\n                    cv[3] = v.height;\n                    gl.uniform4f(ud." + i + ".location, v.x, v.y, v.width, v.height)\n                }\n";
                }
                else
                {
                    func += "\n                cv = ud." + i + ".value;\n                v = uv." + i + ";\n\n                if(cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])\n                {\n                    cv[0] = v[0];\n                    cv[1] = v[1];\n                    cv[2] = v[2];\n                    cv[3] = v[3];\n\n                    gl.uniform4f(ud." + i + ".location, v[0], v[1], v[2], v[3])\n                }\n                \n";
                }
            }
            else
            {
                var templateType = (data.size === 1) ? GLSL_TO_SINGLE_SETTERS_CACHED : GLSL_TO_ARRAY_SETTERS;

                var template =  templateType[data.type].replace('location', ("ud." + i + ".location"));

                func += "\n            cv = ud." + i + ".value;\n            v = uv." + i + ";\n            " + template + ";\n";
            }
        }

        /**
         * the introduction of syncData is to solve an issue where textures in uniform groups are not set correctly
         * the texture count was always starting from 0 in each group. This needs to increment each time a texture is used
         * no matter which group is being used
         *
         */
        return new Function('ud', 'uv', 'renderer', 'syncData', func); // eslint-disable-line no-new-func
    }

    var fragTemplate = [
        'precision mediump float;',
        'void main(void){',
        'float test = 0.1;',
        '%forloop%',
        'gl_FragColor = vec4(0.0);',
        '}' ].join('\n');

    function checkMaxIfStatementsInShader(maxIfs, gl)
    {
        if (maxIfs === 0)
        {
            throw new Error('Invalid value of `0` passed to `checkMaxIfStatementsInShader`');
        }

        var shader = gl.createShader(gl.FRAGMENT_SHADER);

        while (true) // eslint-disable-line no-constant-condition
        {
            var fragmentSrc = fragTemplate.replace(/%forloop%/gi, generateIfTestSrc(maxIfs));

            gl.shaderSource(shader, fragmentSrc);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            {
                maxIfs = (maxIfs / 2) | 0;
            }
            else
            {
                // valid!
                break;
            }
        }

        return maxIfs;
    }

    function generateIfTestSrc(maxIfs)
    {
        var src = '';

        for (var i = 0; i < maxIfs; ++i)
        {
            if (i > 0)
            {
                src += '\nelse ';
            }

            if (i < maxIfs - 1)
            {
                src += "if(test == " + i + ".0){}";
            }
        }

        return src;
    }

    // Cache the result to prevent running this over and over
    var unsafeEval;

    /**
     * Not all platforms allow to generate function code (e.g., `new Function`).
     * this provides the platform-level detection.
     *
     * @private
     * @returns {boolean}
     */
    function unsafeEvalSupported()
    {
        if (typeof unsafeEval === 'boolean')
        {
            return unsafeEval;
        }

        try
        {
            /* eslint-disable no-new-func */
            var func = new Function('param1', 'param2', 'param3', 'return param1[param2] === param3;');
            /* eslint-enable no-new-func */

            unsafeEval = func({ a: 'b' }, 'a', 'b') === true;
        }
        catch (e)
        {
            unsafeEval = false;
        }

        return unsafeEval;
    }

    var defaultFragment = "varying vec2 vTextureCoord;\r\n\r\nuniform sampler2D uSampler;\r\n\r\nvoid main(void){\r\n   gl_FragColor *= texture2D(uSampler, vTextureCoord);\r\n}";

    var defaultVertex = "attribute vec2 aVertexPosition;\r\nattribute vec2 aTextureCoord;\r\n\r\nuniform mat3 projectionMatrix;\r\n\r\nvarying vec2 vTextureCoord;\r\n\r\nvoid main(void){\r\n   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\r\n   vTextureCoord = aTextureCoord;\r\n}\r\n";

    // import * as from '../systems/shader/shader';

    var UID$3 = 0;

    var nameCache = {};

    /**
     * Helper class to create a shader program.
     *
     * @class
     * @memberof PIXI
     */
    var Program = function Program(vertexSrc, fragmentSrc, name)
    {
        if ( name === void 0 ) name = 'pixi-shader';

        this.id = UID$3++;

        /**
         * The vertex shader.
         *
         * @member {string}
         */
        this.vertexSrc = vertexSrc || Program.defaultVertexSrc;

        /**
         * The fragment shader.
         *
         * @member {string}
         */
        this.fragmentSrc = fragmentSrc || Program.defaultFragmentSrc;

        this.vertexSrc = this.vertexSrc.trim();
        this.fragmentSrc = this.fragmentSrc.trim();

        if (this.vertexSrc.substring(0, 8) !== '#version')
        {
            name = name.replace(/\s+/g, '-');

            if (nameCache[name])
            {
                nameCache[name]++;
                name += "-" + (nameCache[name]);
            }
            else
            {
                nameCache[name] = 1;
            }

            this.vertexSrc = "#define SHADER_NAME " + name + "\n" + (this.vertexSrc);
            this.fragmentSrc = "#define SHADER_NAME " + name + "\n" + (this.fragmentSrc);

            this.vertexSrc = setPrecision(this.vertexSrc, settings.settings.PRECISION_VERTEX, constants.PRECISION.HIGH);
            this.fragmentSrc = setPrecision(this.fragmentSrc, settings.settings.PRECISION_FRAGMENT, getMaxFragmentPrecision());
        }

        // currently this does not extract structs only default types
        this.extractData(this.vertexSrc, this.fragmentSrc);

        // this is where we store shader references..
        this.glPrograms = {};

        this.syncUniforms = null;
    };

    var staticAccessors = { defaultVertexSrc: { configurable: true },defaultFragmentSrc: { configurable: true } };

    /**
     * Extracts the data for a buy creating a small test program
     * or reading the src directly.
     * @protected
     *
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
     */
    Program.prototype.extractData = function extractData (vertexSrc, fragmentSrc)
    {
        var gl = getTestContext();

        if (gl)
        {
            var program = compileProgram(gl, vertexSrc, fragmentSrc);

            this.attributeData = this.getAttributeData(program, gl);
            this.uniformData = this.getUniformData(program, gl);

            gl.deleteProgram(program);
        }
        else
        {
            this.uniformData = {};
            this.attributeData = {};
        }
    };

    /**
     * returns the attribute data from the program
     * @private
     *
     * @param {WebGLProgram} [program] - the WebGL program
     * @param {WebGLRenderingContext} [gl] - the WebGL context
     *
     * @returns {object} the attribute data for this program
     */
    Program.prototype.getAttributeData = function getAttributeData (program, gl)
    {
        var attributes = {};
        var attributesArray = [];

        var totalAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

        for (var i = 0; i < totalAttributes; i++)
        {
            var attribData = gl.getActiveAttrib(program, i);
            var type = mapType(gl, attribData.type);

            /*eslint-disable */
            var data = {
                type: type,
                name: attribData.name,
                size: mapSize(type),
                location: 0,
            };
            /* eslint-enable */

            attributes[attribData.name] = data;
            attributesArray.push(data);
        }

        attributesArray.sort(function (a, b) { return (a.name > b.name) ? 1 : -1; }); // eslint-disable-line no-confusing-arrow

        for (var i$1 = 0; i$1 < attributesArray.length; i$1++)
        {
            attributesArray[i$1].location = i$1;
        }

        return attributes;
    };

    /**
     * returns the uniform data from the program
     * @private
     *
     * @param {webGL-program} [program] - the webgl program
     * @param {context} [gl] - the WebGL context
     *
     * @returns {object} the uniform data for this program
     */
    Program.prototype.getUniformData = function getUniformData (program, gl)
    {
        var uniforms = {};

        var totalUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

        // TODO expose this as a prop?
        // const maskRegex = new RegExp('^(projectionMatrix|uSampler|translationMatrix)$');
        // const maskRegex = new RegExp('^(projectionMatrix|uSampler|translationMatrix)$');

        for (var i = 0; i < totalUniforms; i++)
        {
            var uniformData = gl.getActiveUniform(program, i);
            var name = uniformData.name.replace(/\[.*?\]/, '');

            var isArray = uniformData.name.match(/\[.*?\]/, '');
            var type = mapType(gl, uniformData.type);

            /*eslint-disable */
            uniforms[name] = {
                type: type,
                size: uniformData.size,
                isArray:isArray,
                value: defaultValue(type, uniformData.size),
            };
            /* eslint-enable */
        }

        return uniforms;
    };

    /**
     * The default vertex shader source
     *
     * @static
     * @constant
     * @member {string}
     */
    staticAccessors.defaultVertexSrc.get = function ()
    {
        return defaultVertex;
    };

    /**
     * The default fragment shader source
     *
     * @static
     * @constant
     * @member {string}
     */
    staticAccessors.defaultFragmentSrc.get = function ()
    {
        return defaultFragment;
    };

    /**
     * A short hand function to create a program based of a vertex and fragment shader
     * this method will also check to see if there is a cached program.
     *
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
     * @param {string} [name=pixi-shader] - Name for shader
     *
     * @returns {PIXI.Program} an shiny new Pixi shader!
     */
    Program.from = function from (vertexSrc, fragmentSrc, name)
    {
        var key = vertexSrc + fragmentSrc;

        var program = utils.ProgramCache[key];

        if (!program)
        {
            utils.ProgramCache[key] = program = new Program(vertexSrc, fragmentSrc, name);
        }

        return program;
    };

    Object.defineProperties( Program, staticAccessors );

    /**
     * A helper class for shaders
     *
     * @class
     * @memberof PIXI
     */
    var Shader = function Shader(program, uniforms)
    {
        /**
         * Program that the shader uses
         *
         * @member {PIXI.Program}
         */
        this.program = program;

        // lets see whats been passed in
        // uniforms should be converted to a uniform group
        if (uniforms)
        {
            if (uniforms instanceof UniformGroup)
            {
                this.uniformGroup = uniforms;
            }
            else
            {
                this.uniformGroup = new UniformGroup(uniforms);
            }
        }
        else
        {
            this.uniformGroup = new UniformGroup({});
        }

        // time to build some getters and setters!
        // I guess down the line this could sort of generate an instruction list rather than use dirty ids?
        // does the trick for now though!
        for (var i in program.uniformData)
        {
            if (this.uniformGroup.uniforms[i] instanceof Array)
            {
                this.uniformGroup.uniforms[i] = new Float32Array(this.uniformGroup.uniforms[i]);
            }
        }
    };

    var prototypeAccessors$2 = { uniforms: { configurable: true } };

    // TODO move to shader system..
    Shader.prototype.checkUniformExists = function checkUniformExists (name, group)
    {
        if (group.uniforms[name])
        {
            return true;
        }

        for (var i in group.uniforms)
        {
            var uniform = group.uniforms[i];

            if (uniform.group)
            {
                if (this.checkUniformExists(name, uniform))
                {
                    return true;
                }
            }
        }

        return false;
    };

    Shader.prototype.destroy = function destroy ()
    {
        // usage count on programs?
        // remove if not used!
        this.uniformGroup = null;
    };

    /**
     * Shader uniform values, shortcut for `uniformGroup.uniforms`
     * @readonly
     * @member {object}
     */
    prototypeAccessors$2.uniforms.get = function ()
    {
        return this.uniformGroup.uniforms;
    };

    /**
     * A short hand function to create a shader based of a vertex and fragment shader
     *
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
     * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
     *
     * @returns {PIXI.Shader} an shiny new Pixi shader!
     */
    Shader.from = function from (vertexSrc, fragmentSrc, uniforms)
    {
        var program = Program.from(vertexSrc, fragmentSrc);

        return new Shader(program, uniforms);
    };

    Object.defineProperties( Shader.prototype, prototypeAccessors$2 );

    /* eslint-disable max-len */

    var BLEND = 0;
    var OFFSET = 1;
    var CULLING = 2;
    var DEPTH_TEST = 3;
    var WINDING = 4;

    /**
     * This is a WebGL state, and is is passed The WebGL StateManager.
     *
     * Each mesh rendered may require WebGL to be in a different state.
     * For example you may want different blend mode or to enable polygon offsets
     *
     * @class
     * @memberof PIXI
     */
    var State = function State()
    {
        this.data = 0;

        this.blendMode = constants.BLEND_MODES.NORMAL;
        this.polygonOffset = 0;

        this.blend = true;
        //  this.depthTest = true;
    };

    var prototypeAccessors$3 = { blend: { configurable: true },offsets: { configurable: true },culling: { configurable: true },depthTest: { configurable: true },clockwiseFrontFace: { configurable: true },blendMode: { configurable: true },polygonOffset: { configurable: true } };

    /**
     * Activates blending of the computed fragment color values
     *
     * @member {boolean}
     */
    prototypeAccessors$3.blend.get = function ()
    {
        return !!(this.data & (1 << BLEND));
    };

    prototypeAccessors$3.blend.set = function (value) // eslint-disable-line require-jsdoc
    {
        if (!!(this.data & (1 << BLEND)) !== value)
        {
            this.data ^= (1 << BLEND);
        }
    };

    /**
     * Activates adding an offset to depth values of polygon's fragments
     *
     * @member {boolean}
     * @default false
     */
    prototypeAccessors$3.offsets.get = function ()
    {
        return !!(this.data & (1 << OFFSET));
    };

    prototypeAccessors$3.offsets.set = function (value) // eslint-disable-line require-jsdoc
    {
        if (!!(this.data & (1 << OFFSET)) !== value)
        {
            this.data ^= (1 << OFFSET);
        }
    };

    /**
     * Activates culling of polygons.
     *
     * @member {boolean}
     * @default false
     */
    prototypeAccessors$3.culling.get = function ()
    {
        return !!(this.data & (1 << CULLING));
    };

    prototypeAccessors$3.culling.set = function (value) // eslint-disable-line require-jsdoc
    {
        if (!!(this.data & (1 << CULLING)) !== value)
        {
            this.data ^= (1 << CULLING);
        }
    };

    /**
     * Activates depth comparisons and updates to the depth buffer.
     *
     * @member {boolean}
     * @default false
     */
    prototypeAccessors$3.depthTest.get = function ()
    {
        return !!(this.data & (1 << DEPTH_TEST));
    };

    prototypeAccessors$3.depthTest.set = function (value) // eslint-disable-line require-jsdoc
    {
        if (!!(this.data & (1 << DEPTH_TEST)) !== value)
        {
            this.data ^= (1 << DEPTH_TEST);
        }
    };

    /**
     * Specifies whether or not front or back-facing polygons can be culled.
     * @member {boolean}
     * @default false
     */
    prototypeAccessors$3.clockwiseFrontFace.get = function ()
    {
        return !!(this.data & (1 << WINDING));
    };

    prototypeAccessors$3.clockwiseFrontFace.set = function (value) // eslint-disable-line require-jsdoc
    {
        if (!!(this.data & (1 << WINDING)) !== value)
        {
            this.data ^= (1 << WINDING);
        }
    };

    /**
     * The blend mode to be applied when this state is set. Apply a value of `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
     * Setting this mode to anything other than NO_BLEND will automatically switch blending on.
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL
     * @see PIXI.BLEND_MODES
     */
    prototypeAccessors$3.blendMode.get = function ()
    {
        return this._blendMode;
    };

    prototypeAccessors$3.blendMode.set = function (value) // eslint-disable-line require-jsdoc
    {
        this.blend = (value !== constants.BLEND_MODES.NONE);
        this._blendMode = value;
    };

    /**
     * The polygon offset. Setting this property to anything other than 0 will automatically enable polygon offset fill.
     *
     * @member {number}
     * @default 0
     */
    prototypeAccessors$3.polygonOffset.get = function ()
    {
        return this._polygonOffset;
    };

    prototypeAccessors$3.polygonOffset.set = function (value) // eslint-disable-line require-jsdoc
    {
        this.offsets = !!value;
        this._polygonOffset = value;
    };

    State.for2d = function for2d ()
    {
        var state = new State();

        state.depthTest = false;
        state.blend = true;

        return state;
    };

    Object.defineProperties( State.prototype, prototypeAccessors$3 );

    var defaultVertex$1 = "attribute vec2 aVertexPosition;\r\n\r\nuniform mat3 projectionMatrix;\r\n\r\nvarying vec2 vTextureCoord;\r\n\r\nuniform vec4 inputSize;\r\nuniform vec4 outputFrame;\r\n\r\nvec4 filterVertexPosition( void )\r\n{\r\n    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;\r\n\r\n    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);\r\n}\r\n\r\nvec2 filterTextureCoord( void )\r\n{\r\n    return aVertexPosition * (outputFrame.zw * inputSize.zw);\r\n}\r\n\r\nvoid main(void)\r\n{\r\n    gl_Position = filterVertexPosition();\r\n    vTextureCoord = filterTextureCoord();\r\n}\r\n";

    var defaultFragment$1 = "varying vec2 vTextureCoord;\r\n\r\nuniform sampler2D uSampler;\r\n\r\nvoid main(void){\r\n   gl_FragColor = texture2D(uSampler, vTextureCoord);\r\n}\r\n";

    /**
     * Filter is a special type of WebGL shader that is applied to the screen.
     *
     * {@link http://pixijs.io/examples/#/filters/blur-filter.js Example} of the
     * {@link PIXI.filters.BlurFilter BlurFilter}.
     *
     * ### Usage
     * Filters can be applied to any DisplayObject or Container.
     * PixiJS' `FilterSystem` renders the container into temporary Framebuffer,
     * then filter renders it to the screen.
     * Multiple filters can be added to the `filters` array property and stacked on each other.
     *
     * ```
     * const filter = new PIXI.Filter(myShaderVert, myShaderFrag, { myUniform: 0.5 });
     * const container = new PIXI.Container();
     * container.filters = [filter];
     * ```
     *
     * ### Previous Version Differences
     *
     * In PixiJS **v3**, a filter was always applied to _whole screen_.
     *
     * In PixiJS **v4**, a filter can be applied _only part of the screen_.
     * Developers had to create a set of uniforms to deal with coordinates.
     *
     * In PixiJS **v5** combines _both approaches_.
     * Developers can use normal coordinates of v3 and then allow filter to use partial Framebuffers,
     * bringing those extra uniforms into account.
     *
     * Also be aware that we have changed default vertex shader, please consult
     * {@link https://github.com/pixijs/pixi.js/wiki/v5-Creating-filters Wiki}.
     *
     * ### Built-in Uniforms
     *
     * PixiJS viewport uses screen (CSS) coordinates, `(0, 0, renderer.screen.width, renderer.screen.height)`,
     * and `projectionMatrix` uniform maps it to the gl viewport.
     *
     * **uSampler**
     *
     * The most important uniform is the input texture that container was rendered into.
     * _Important note: as with all Framebuffers in PixiJS, both input and output are
     * premultiplied by alpha._
     *
     * By default, input normalized coordinates are passed to fragment shader with `vTextureCoord`.
     * Use it to sample the input.
     *
     * ```
     * const fragment = `
     * varying vec2 vTextureCoord;
     * uniform sampler2D uSampler;
     * void main(void)
     * {
     *    gl_FragColor = texture2D(uSampler, vTextureCoord);
     * }
     * `;
     *
     * const myFilter = new PIXI.Filter(null, fragment);
     * ```
     *
     * This filter is just one uniform less than {@link PIXI.filters.AlphaFilter AlphaFilter}.
     *
     * **outputFrame**
     *
     * The `outputFrame` holds the rectangle where filter is applied in screen (CSS) coordinates.
     * It's the same as `renderer.screen` for a fullscreen filter.
     * Only a part of  `outputFrame.zw` size of temporary Framebuffer is used,
     * `(0, 0, outputFrame.width, outputFrame.height)`,
     *
     * Filters uses this quad to normalized (0-1) space, its passed into `aVertexPosition` attribute.
     * To calculate vertex position in screen space using normalized (0-1) space:
     *
     * ```
     * vec4 filterVertexPosition( void )
     * {
     *     vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;
     *     return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
     * }
     * ```
     *
     * **inputSize**
     *
     * Temporary framebuffer is different, it can be either the size of screen, either power-of-two.
     * The `inputSize.xy` are size of temporary framebuffer that holds input.
     * The `inputSize.zw` is inverted, it's a shortcut to evade division inside the shader.
     *
     * Set `inputSize.xy = outputFrame.zw` for a fullscreen filter.
     *
     * To calculate input normalized coordinate, you have to map it to filter normalized space.
     * Multiply by `outputFrame.zw` to get input coordinate.
     * Divide by `inputSize.xy` to get input normalized coordinate.
     *
     * ```
     * vec2 filterTextureCoord( void )
     * {
     *     return aVertexPosition * (outputFrame.zw * inputSize.zw); // same as /inputSize.xy
     * }
     * ```
     * **resolution**
     *
     * The `resolution` is the ratio of screen (CSS) pixels to real pixels.
     *
     * **inputPixel**
     *
     * `inputPixel.xy` is the size of framebuffer in real pixels, same as `inputSize.xy * resolution`
     * `inputPixel.zw` is inverted `inputPixel.xy`.
     *
     * It's handy for filters that use neighbour pixels, like {@link PIXI.filters.FXAAFilter FXAAFilter}.
     *
     * **inputClamp**
     *
     * If you try to get info from outside of used part of Framebuffer - you'll get undefined behaviour.
     * For displacements, coordinates has to be clamped.
     *
     * The `inputClamp.xy` is left-top pixel center, you may ignore it, because we use left-top part of Framebuffer
     * `inputClamp.zw` is bottom-right pixel center.
     *
     * ```
     * vec4 color = texture2D(uSampler, clamp(modifigedTextureCoord, inputClamp.xy, inputClamp.zw))
     * ```
     * OR
     * ```
     * vec4 color = texture2D(uSampler, min(modifigedTextureCoord, inputClamp.zw))
     * ```
     *
     * ### Additional Information
     *
     * Complete documentation on Filter usage is located in the
     * {@link https://github.com/pixijs/pixi.js/wiki/v5-Creating-filters Wiki}.
     *
     * Since PixiJS only had a handful of built-in filters, additional filters can be downloaded
     * {@link https://github.com/pixijs/pixi-filters here} from the PixiJS Filters repository.
     *
     * @class
     * @memberof PIXI
     * @extends PIXI.Shader
     */
    var Filter = /*@__PURE__*/(function (Shader) {
        function Filter(vertexSrc, fragmentSrc, uniforms)
        {
            var program = Program.from(vertexSrc || Filter.defaultVertexSrc,
                fragmentSrc || Filter.defaultFragmentSrc);

            Shader.call(this, program, uniforms);

            /**
             * The padding of the filter. Some filters require extra space to breath such as a blur.
             * Increasing this will add extra width and height to the bounds of the object that the
             * filter is applied to.
             *
             * @member {number}
             */
            this.padding = 0;

            /**
             * The resolution of the filter. Setting this to be lower will lower the quality but
             * increase the performance of the filter.
             *
             * @member {number}
             */
            this.resolution = settings.settings.FILTER_RESOLUTION;

            /**
             * If enabled is true the filter is applied, if false it will not.
             *
             * @member {boolean}
             */
            this.enabled = true;

            /**
             * If enabled, PixiJS will fit the filter area into boundaries for better performance.
             * Switch it off if it does not work for specific shader.
             *
             * @member {boolean}
             */
            this.autoFit = true;

            /**
             * Legacy filters use position and uvs from attributes
             * @member {boolean}
             * @readonly
             */
            this.legacy = !!this.program.attributeData.aTextureCoord;

            /**
             * The WebGL state the filter requires to render
             * @member {PIXI.State}
             */
            this.state = new State();
        }

        if ( Shader ) Filter.__proto__ = Shader;
        Filter.prototype = Object.create( Shader && Shader.prototype );
        Filter.prototype.constructor = Filter;

        var prototypeAccessors = { blendMode: { configurable: true } };
        var staticAccessors = { defaultVertexSrc: { configurable: true },defaultFragmentSrc: { configurable: true } };

        /**
         * Applies the filter
         *
         * @param {PIXI.systems.FilterSystem} filterManager - The renderer to retrieve the filter from
         * @param {PIXI.RenderTexture} input - The input render target.
         * @param {PIXI.RenderTexture} output - The target to output to.
         * @param {boolean} clear - Should the output be cleared before rendering to it
         * @param {object} [currentState] - It's current state of filter.
         *        There are some useful properties in the currentState :
         *        target, filters, sourceFrame, destinationFrame, renderTarget, resolution
         */
        Filter.prototype.apply = function apply (filterManager, input, output, clear, currentState)
        {
            // do as you please!

            filterManager.applyFilter(this, input, output, clear, currentState);

            // or just do a regular render..
        };

        /**
         * Sets the blendmode of the filter
         *
         * @member {number}
         * @default PIXI.BLEND_MODES.NORMAL
         */
        prototypeAccessors.blendMode.get = function ()
        {
            return this.state.blendMode;
        };

        prototypeAccessors.blendMode.set = function (value) // eslint-disable-line require-jsdoc
        {
            this.state.blendMode = value;
        };

        /**
         * The default vertex shader source
         *
         * @static
         * @type {string}
         * @constant
         */
        staticAccessors.defaultVertexSrc.get = function ()
        {
            return defaultVertex$1;
        };

        /**
         * The default fragment shader source
         *
         * @static
         * @type {string}
         * @constant
         */
        staticAccessors.defaultFragmentSrc.get = function ()
        {
            return defaultFragment$1;
        };

        Object.defineProperties( Filter.prototype, prototypeAccessors );
        Object.defineProperties( Filter, staticAccessors );

        return Filter;
    }(Shader));

    /**
     * Used for caching shader IDs
     *
     * @static
     * @type {object}
     * @protected
     */
    Filter.SOURCE_KEY_MAP = {};

    var vertex = "attribute vec2 aVertexPosition;\r\nattribute vec2 aTextureCoord;\r\n\r\nuniform mat3 projectionMatrix;\r\nuniform mat3 otherMatrix;\r\n\r\nvarying vec2 vMaskCoord;\r\nvarying vec2 vTextureCoord;\r\n\r\nvoid main(void)\r\n{\r\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\r\n\r\n    vTextureCoord = aTextureCoord;\r\n    vMaskCoord = ( otherMatrix * vec3( aTextureCoord, 1.0)  ).xy;\r\n}\r\n";

    var fragment = "varying vec2 vMaskCoord;\r\nvarying vec2 vTextureCoord;\r\n\r\nuniform sampler2D uSampler;\r\nuniform sampler2D mask;\r\nuniform float alpha;\r\nuniform float npmAlpha;\r\nuniform vec4 maskClamp;\r\n\r\nvoid main(void)\r\n{\r\n    float clip = step(3.5,\r\n        step(maskClamp.x, vMaskCoord.x) +\r\n        step(maskClamp.y, vMaskCoord.y) +\r\n        step(vMaskCoord.x, maskClamp.z) +\r\n        step(vMaskCoord.y, maskClamp.w));\r\n\r\n    vec4 original = texture2D(uSampler, vTextureCoord);\r\n    vec4 masky = texture2D(mask, vMaskCoord);\r\n    float alphaMul = 1.0 - npmAlpha * (1.0 - masky.a);\r\n\r\n    original *= (alphaMul * masky.r * alpha * clip);\r\n\r\n    gl_FragColor = original;\r\n}\r\n";

    var tempMat = new math.Matrix();

    /**
     * Class controls uv mapping from Texture normal space to BaseTexture normal space.
     *
     * Takes `trim` and `rotate` into account. May contain clamp settings for Meshes and TilingSprite.
     *
     * Can be used in Texture `uvMatrix` field, or separately, you can use different clamp settings on the same texture.
     * If you want to add support for texture region of certain feature or filter, that's what you're looking for.
     *
     * Takes track of Texture changes through `_lastTextureID` private field.
     * Use `update()` method call to track it from outside.
     *
     * @see PIXI.Texture
     * @see PIXI.Mesh
     * @see PIXI.TilingSprite
     * @class
     * @memberof PIXI
     */
    var TextureMatrix = function TextureMatrix(texture, clampMargin)
    {
        this._texture = texture;

        /**
         * Matrix operation that converts texture region coords to texture coords
         * @member {PIXI.Matrix}
         * @readonly
         */
        this.mapCoord = new math.Matrix();

        /**
         * Clamp region for normalized coords, left-top pixel center in xy , bottom-right in zw.
         * Calculated based on clampOffset.
         * @member {Float32Array}
         * @readonly
         */
        this.uClampFrame = new Float32Array(4);

        /**
         * Normalized clamp offset.
         * Calculated based on clampOffset.
         * @member {Float32Array}
         * @readonly
         */
        this.uClampOffset = new Float32Array(2);

        /**
         * Tracks Texture frame changes
         * @member {number}
         * @protected
         */
        this._updateID = -1;

        /**
         * Changes frame clamping
         * Works with TilingSprite and Mesh
         * Change to 1.5 if you texture has repeated right and bottom lines, that leads to smoother borders
         *
         * @default 0
         * @member {number}
         */
        this.clampOffset = 0;

        /**
         * Changes frame clamping
         * Works with TilingSprite and Mesh
         * Change to -0.5 to add a pixel to the edge, recommended for transparent trimmed textures in atlas
         *
         * @default 0.5
         * @member {number}
         */
        this.clampMargin = (typeof clampMargin === 'undefined') ? 0.5 : clampMargin;

        /**
         * If texture size is the same as baseTexture
         * @member {boolean}
         * @default false
         * @readonly
         */
        this.isSimple = false;
    };

    var prototypeAccessors$4 = { texture: { configurable: true } };

    /**
     * texture property
     * @member {PIXI.Texture}
     */
    prototypeAccessors$4.texture.get = function ()
    {
        return this._texture;
    };

    prototypeAccessors$4.texture.set = function (value) // eslint-disable-line require-jsdoc
    {
        this._texture = value;
        this._updateID = -1;
    };

    /**
     * Multiplies uvs array to transform
     * @param {Float32Array} uvs mesh uvs
     * @param {Float32Array} [out=uvs] output
     * @returns {Float32Array} output
     */
    TextureMatrix.prototype.multiplyUvs = function multiplyUvs (uvs, out)
    {
        if (out === undefined)
        {
            out = uvs;
        }

        var mat = this.mapCoord;

        for (var i = 0; i < uvs.length; i += 2)
        {
            var x = uvs[i];
            var y = uvs[i + 1];

            out[i] = (x * mat.a) + (y * mat.c) + mat.tx;
            out[i + 1] = (x * mat.b) + (y * mat.d) + mat.ty;
        }

        return out;
    };

    /**
     * updates matrices if texture was changed
     * @param {boolean} [forceUpdate=false] if true, matrices will be updated any case
     * @returns {boolean} whether or not it was updated
     */
    TextureMatrix.prototype.update = function update (forceUpdate)
    {
        var tex = this._texture;

        if (!tex || !tex.valid)
        {
            return false;
        }

        if (!forceUpdate
            && this._updateID === tex._updateID)
        {
            return false;
        }

        this._updateID = tex._updateID;

        var uvs = tex._uvs;

        this.mapCoord.set(uvs.x1 - uvs.x0, uvs.y1 - uvs.y0, uvs.x3 - uvs.x0, uvs.y3 - uvs.y0, uvs.x0, uvs.y0);

        var orig = tex.orig;
        var trim = tex.trim;

        if (trim)
        {
            tempMat.set(orig.width / trim.width, 0, 0, orig.height / trim.height,
                -trim.x / trim.width, -trim.y / trim.height);
            this.mapCoord.append(tempMat);
        }

        var texBase = tex.baseTexture;
        var frame = this.uClampFrame;
        var margin = this.clampMargin / texBase.resolution;
        var offset = this.clampOffset;

        frame[0] = (tex._frame.x + margin + offset) / texBase.width;
        frame[1] = (tex._frame.y + margin + offset) / texBase.height;
        frame[2] = (tex._frame.x + tex._frame.width - margin + offset) / texBase.width;
        frame[3] = (tex._frame.y + tex._frame.height - margin + offset) / texBase.height;
        this.uClampOffset[0] = offset / texBase.realWidth;
        this.uClampOffset[1] = offset / texBase.realHeight;

        this.isSimple = tex._frame.width === texBase.width
            && tex._frame.height === texBase.height
            && tex.rotate === 0;

        return true;
    };

    Object.defineProperties( TextureMatrix.prototype, prototypeAccessors$4 );

    /**
     * This handles a Sprite acting as a mask, as opposed to a Graphic.
     *
     * WebGL only.
     *
     * @class
     * @extends PIXI.Filter
     * @memberof PIXI
     */
    var SpriteMaskFilter = /*@__PURE__*/(function (Filter) {
        function SpriteMaskFilter(sprite)
        {
            var maskMatrix = new math.Matrix();

            Filter.call(this, vertex, fragment);

            sprite.renderable = false;

            /**
             * Sprite mask
             * @member {PIXI.Sprite}
             */
            this.maskSprite = sprite;

            /**
             * Mask matrix
             * @member {PIXI.Matrix}
             */
            this.maskMatrix = maskMatrix;
        }

        if ( Filter ) SpriteMaskFilter.__proto__ = Filter;
        SpriteMaskFilter.prototype = Object.create( Filter && Filter.prototype );
        SpriteMaskFilter.prototype.constructor = SpriteMaskFilter;

        /**
         * Applies the filter
         *
         * @param {PIXI.systems.FilterSystem} filterManager - The renderer to retrieve the filter from
         * @param {PIXI.RenderTexture} input - The input render target.
         * @param {PIXI.RenderTexture} output - The target to output to.
         * @param {boolean} clear - Should the output be cleared before rendering to it.
         */
        SpriteMaskFilter.prototype.apply = function apply (filterManager, input, output, clear)
        {
            var maskSprite = this.maskSprite;
            var tex = this.maskSprite.texture;

            if (!tex.valid)
            {
                return;
            }
            if (!tex.transform)
            {
                // margin = 0.0, let it bleed a bit, shader code becomes easier
                // assuming that atlas textures were made with 1-pixel padding
                tex.transform = new TextureMatrix(tex, 0.0);
            }
            tex.transform.update();

            this.uniforms.npmAlpha = tex.baseTexture.alphaMode ? 0.0 : 1.0;
            this.uniforms.mask = tex;
            // get _normalized sprite texture coords_ and convert them to _normalized atlas texture coords_ with `prepend`
            this.uniforms.otherMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, maskSprite)
                .prepend(tex.transform.mapCoord);
            this.uniforms.alpha = maskSprite.worldAlpha;
            this.uniforms.maskClamp = tex.transform.uClampFrame;

            filterManager.applyFilter(this, input, output, clear);
        };

        return SpriteMaskFilter;
    }(Filter));

    /**
     * System plugin to the renderer to manage masks.
     *
     * @class
     * @extends PIXI.System
     * @memberof PIXI.systems
     */
    var MaskSystem = /*@__PURE__*/(function (System) {
        function MaskSystem(renderer)
        {
            System.call(this, renderer);

            /**
             * Target to mask
             * @member {PIXI.DisplayObject}
             * @readonly
             */
            this.scissorRenderTarget = null;

            /**
             * Enable scissor
             * @member {boolean}
             * @readonly
             */
            this.enableScissor = false;

            /**
             * Pool of used sprite mask filters
             * @member {PIXI.SpriteMaskFilter[]}
             * @readonly
             */
            this.alphaMaskPool = [];

            /**
             * Pool of mask data
             * @member {PIXI.MaskData[]}
             * @readonly
             */
            this.maskDataPool = [];

            this.maskStack = [];

            /**
             * Current index of alpha mask pool
             * @member {number}
             * @default 0
             * @readonly
             */
            this.alphaMaskIndex = 0;
        }

        if ( System ) MaskSystem.__proto__ = System;
        MaskSystem.prototype = Object.create( System && System.prototype );
        MaskSystem.prototype.constructor = MaskSystem;

        /**
         * Changes the mask stack that is used by this System.
         *
         * @param {PIXI.MaskData[]} maskStack - The mask stack
         */
        MaskSystem.prototype.setMaskStack = function setMaskStack (maskStack)
        {
            this.maskStack = maskStack;
            this.renderer.scissor.setMaskStack(maskStack);
            this.renderer.stencil.setMaskStack(maskStack);
        };

        /**
         * Applies the Mask and adds it to the current filter stack.
         * Renderer batch must be flushed beforehand.
         *
         * @param {PIXI.DisplayObject} target - Display Object to push the mask to
         * @param {PIXI.MaskData|PIXI.Sprite|PIXI.Graphics|PIXI.DisplayObject} maskData - The masking data.
         */
        MaskSystem.prototype.push = function push (target, maskData)
        {
            if (!maskData.isMaskData)
            {
                var d = this.maskDataPool.pop() || new MaskData();

                d.pooled = true;
                d.maskObject = maskData;
                maskData = d;
            }

            if (maskData.autoDetect)
            {
                this.detect(maskData);
            }

            maskData.copyCountersOrReset(this.maskStack[this.maskStack.length - 1]);
            maskData._target = target;

            switch (maskData.type)
            {
                case constants.MASK_TYPES.SCISSOR:
                    this.maskStack.push(maskData);
                    this.renderer.scissor.push(maskData);
                    break;
                case constants.MASK_TYPES.STENCIL:
                    this.maskStack.push(maskData);
                    this.renderer.stencil.push(maskData);
                    break;
                case constants.MASK_TYPES.SPRITE:
                    maskData.copyCountersOrReset(null);
                    this.pushSpriteMask(maskData);
                    this.maskStack.push(maskData);
                    break;
                default:
                    break;
            }
        };

        /**
         * Removes the last mask from the mask stack and doesn't return it.
         * Renderer batch must be flushed beforehand.
         *
         * @param {PIXI.DisplayObject} target - Display Object to pop the mask from
         */
        MaskSystem.prototype.pop = function pop (target)
        {
            var maskData = this.maskStack.pop();

            if (!maskData || maskData._target !== target)
            {
                // TODO: add an assert when we have it

                return;
            }

            switch (maskData.type)
            {
                case constants.MASK_TYPES.SCISSOR:
                    this.renderer.scissor.pop();
                    break;
                case constants.MASK_TYPES.STENCIL:
                    this.renderer.stencil.pop(maskData.maskObject);
                    break;
                case constants.MASK_TYPES.SPRITE:
                    this.popSpriteMask();
                    break;
                default:
                    break;
            }

            maskData.reset();

            if (maskData.pooled)
            {
                this.maskDataPool.push(maskData);
            }
        };

        /**
         * Sets type of MaskData based on its maskObject
         * @param {PIXI.MaskData} maskData
         */
        MaskSystem.prototype.detect = function detect (maskData)
        {
            var maskObject = maskData.maskObject;

            if (maskObject.isSprite)
            {
                maskData.type = constants.MASK_TYPES.SPRITE;

                return;
            }
            maskData.type = constants.MASK_TYPES.STENCIL;
            // detect scissor in graphics
            if (this.enableScissor
                && maskObject.isFastRect
                && maskObject.isFastRect())
            {
                var matrix = maskObject.worldTransform;

                // TODO: move the check to the matrix itself
                // we are checking that its orthogonal and x rotation is 0 90 180 or 270

                var rotX = Math.atan2(matrix.b, matrix.a);
                var rotXY = Math.atan2(matrix.d, matrix.c);

                // use the nearest degree to 0.01
                rotX = Math.round(rotX * (180 / Math.PI) * 100);
                rotXY = Math.round(rotXY * (180 / Math.PI) * 100) - rotX;

                rotX = ((rotX % 9000) + 9000) % 9000;
                rotXY = ((rotXY % 18000) + 18000) % 18000;

                if (rotX === 0 && rotXY === 9000)
                {
                    maskData.type = constants.MASK_TYPES.SCISSOR;
                }
            }
        };

        /**
         * Applies the Mask and adds it to the current filter stack.
         *
         * @param {PIXI.MaskData} maskData - Sprite to be used as the mask
         */
        MaskSystem.prototype.pushSpriteMask = function pushSpriteMask (maskData)
        {
            var maskObject = maskData.maskObject;
            var target = maskData._target;
            var alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex];

            if (!alphaMaskFilter)
            {
                alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex] = [new SpriteMaskFilter(maskObject)];
            }

            alphaMaskFilter[0].resolution = this.renderer.resolution;
            alphaMaskFilter[0].maskSprite = maskObject;

            var stashFilterArea = target.filterArea;

            target.filterArea = maskObject.getBounds(true);
            this.renderer.filter.push(target, alphaMaskFilter);
            target.filterArea = stashFilterArea;

            this.alphaMaskIndex++;
        };

        /**
         * Removes the last filter from the filter stack and doesn't return it.
         */
        MaskSystem.prototype.popSpriteMask = function popSpriteMask ()
        {
            this.renderer.filter.pop();
            this.alphaMaskIndex--;
        };

        return MaskSystem;
    }(System));

    /**
     * System plugin to the renderer to manage masks of certain type
     *
     * @class
     * @extends PIXI.System
     * @memberof PIXI.systems
     */
    var AbstractMaskSystem = /*@__PURE__*/(function (System) {
        function AbstractMaskSystem(renderer)
        {
            System.call(this, renderer);

            /**
             * The mask stack
             * @member {PIXI.MaskData[]}
             */
            this.maskStack = [];

            /**
             * Constant for gl.enable
             * @member {number}
             * @private
             */
            this.glConst = 0;
        }

        if ( System ) AbstractMaskSystem.__proto__ = System;
        AbstractMaskSystem.prototype = Object.create( System && System.prototype );
        AbstractMaskSystem.prototype.constructor = AbstractMaskSystem;

        /**
         * gets count of masks of certain type
         * @returns {number}
         */
        AbstractMaskSystem.prototype.getStackLength = function getStackLength ()
        {
            return this.maskStack.length;
        };

        /**
         * Changes the mask stack that is used by this System.
         *
         * @param {PIXI.MaskData[]} maskStack - The mask stack
         */
        AbstractMaskSystem.prototype.setMaskStack = function setMaskStack (maskStack)
        {
            var ref = this.renderer;
            var gl = ref.gl;
            var curStackLen = this.getStackLength();

            this.maskStack = maskStack;

            var newStackLen = this.getStackLength();

            if (newStackLen !== curStackLen)
            {
                if (newStackLen === 0)
                {
                    gl.disable(this.glConst);
                }
                else
                {
                    gl.enable(this.glConst);
                    this._useCurrent();
                }
            }
        };

        /**
         * Setup renderer to use the current mask data.
         * @private
         */
        AbstractMaskSystem.prototype._useCurrent = function _useCurrent ()
        {
            // OVERWRITE;
        };

        /**
         * Destroys the mask stack.
         *
         */
        AbstractMaskSystem.prototype.destroy = function destroy ()
        {
            System.prototype.destroy.call(this, this);

            this.maskStack = null;
        };

        return AbstractMaskSystem;
    }(System));

    /**
     * System plugin to the renderer to manage scissor rects (used for masks).
     *
     * @class
     * @extends PIXI.System
     * @memberof PIXI.systems
     */
    var ScissorSystem = /*@__PURE__*/(function (AbstractMaskSystem) {
        function ScissorSystem(renderer)
        {
            AbstractMaskSystem.call(this, renderer);

            this.glConst = WebGLRenderingContext.SCISSOR_TEST;
        }

        if ( AbstractMaskSystem ) ScissorSystem.__proto__ = AbstractMaskSystem;
        ScissorSystem.prototype = Object.create( AbstractMaskSystem && AbstractMaskSystem.prototype );
        ScissorSystem.prototype.constructor = ScissorSystem;

        ScissorSystem.prototype.getStackLength = function getStackLength ()
        {
            var maskData = this.maskStack[this.maskStack.length - 1];

            if (maskData)
            {
                return maskData._scissorCounter;
            }

            return 0;
        };

        /**
         * Applies the Mask and adds it to the current stencil stack. @alvin
         *
         * @param {PIXI.MaskData} maskData - The mask data
         */
        ScissorSystem.prototype.push = function push (maskData)
        {
            var maskObject = maskData.maskObject;

            maskObject.renderable = true;

            var prevData = maskData._scissorRect;
            var bounds = maskObject.getBounds(true);
            var ref = this.renderer;
            var gl = ref.gl;

            maskObject.renderable = false;

            if (prevData)
            {
                bounds.fit(prevData);
            }
            else
            {
                gl.enable(gl.SCISSOR_TEST);
            }

            maskData._scissorCounter++;
            maskData._scissorRect = bounds;
            this._useCurrent();
        };

        /**
         * Pops scissor mask. MaskData is already removed from stack
         */
        ScissorSystem.prototype.pop = function pop ()
        {
            var ref = this.renderer;
            var gl = ref.gl;

            if (this.getStackLength() > 0)
            {
                this._useCurrent();
            }
            else
            {
                gl.disable(gl.SCISSOR_TEST);
            }
        };

        /**
         * Setup renderer to use the current scissor data.
         * @private
         */
        ScissorSystem.prototype._useCurrent = function _useCurrent ()
        {
            var rect = this.maskStack[this.maskStack.length - 1]._scissorRect;
            var rt = this.renderer.renderTexture.current;
            var ref = this.renderer.projection;
            var transform = ref.transform;
            var sourceFrame = ref.sourceFrame;
            var destinationFrame = ref.destinationFrame;
            var resolution = rt ? rt.resolution : this.renderer.resolution;
            var x = ((rect.x - sourceFrame.x) * resolution) + destinationFrame.x;
            var y = ((rect.y - sourceFrame.y) * resolution) + destinationFrame.y;
            var width = rect.width * resolution;
            var height = rect.height * resolution;

            if (transform)
            {
                x += transform.tx * resolution;
                y += transform.ty * resolution;
            }
            if (!rt)
            {
                // flipY. In future we'll have it over renderTextures as an option
                y = this.renderer.height - height - y;
            }

            this.renderer.gl.scissor(x, y, width, height);
        };

        return ScissorSystem;
    }(AbstractMaskSystem));

    /**
     * System plugin to the renderer to manage stencils (used for masks).
     *
     * @class
     * @extends PIXI.System
     * @memberof PIXI.systems
     */
    var StencilSystem = /*@__PURE__*/(function (AbstractMaskSystem) {
        function StencilSystem(renderer)
        {
            AbstractMaskSystem.call(this, renderer);

            this.glConst = WebGLRenderingContext.STENCIL_TEST;
        }

        if ( AbstractMaskSystem ) StencilSystem.__proto__ = AbstractMaskSystem;
        StencilSystem.prototype = Object.create( AbstractMaskSystem && AbstractMaskSystem.prototype );
        StencilSystem.prototype.constructor = StencilSystem;

        StencilSystem.prototype.getStackLength = function getStackLength ()
        {
            var maskData = this.maskStack[this.maskStack.length - 1];

            if (maskData)
            {
                return maskData._stencilCounter;
            }

            return 0;
        };

        /**
         * Applies the Mask and adds it to the current stencil stack.
         *
         * @param {PIXI.MaskData} maskData - The mask data
         */
        StencilSystem.prototype.push = function push (maskData)
        {
            var maskObject = maskData.maskObject;
            var ref = this.renderer;
            var gl = ref.gl;
            var prevMaskCount = maskData._stencilCounter;

            if (prevMaskCount === 0)
            {
                // force use stencil texture in current framebuffer
                this.renderer.framebuffer.forceStencil();
                gl.enable(gl.STENCIL_TEST);
            }

            maskData._stencilCounter++;

            // Increment the reference stencil value where the new mask overlaps with the old ones.
            gl.colorMask(false, false, false, false);
            gl.stencilFunc(gl.EQUAL, prevMaskCount, this._getBitwiseMask());
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);

            maskObject.renderable = true;
            maskObject.render(this.renderer);
            this.renderer.batch.flush();
            maskObject.renderable = false;

            this._useCurrent();
        };

        /**
         * Pops stencil mask. MaskData is already removed from stack
         *
         * @param {PIXI.DisplayObject} maskObject - object of popped mask data
         */
        StencilSystem.prototype.pop = function pop (maskObject)
        {
            var gl = this.renderer.gl;

            if (this.getStackLength() === 0)
            {
                // the stack is empty!
                gl.disable(gl.STENCIL_TEST);
                gl.clear(gl.STENCIL_BUFFER_BIT);
                gl.clearStencil(0);
            }
            else
            {
                // Decrement the reference stencil value where the popped mask overlaps with the other ones
                gl.colorMask(false, false, false, false);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);

                maskObject.renderable = true;
                maskObject.render(this.renderer);
                this.renderer.batch.flush();
                maskObject.renderable = false;

                this._useCurrent();
            }
        };

        /**
         * Setup renderer to use the current stencil data.
         * @private
         */
        StencilSystem.prototype._useCurrent = function _useCurrent ()
        {
            var gl = this.renderer.gl;

            gl.colorMask(true, true, true, true);
            gl.stencilFunc(gl.EQUAL, this.getStackLength(), this._getBitwiseMask());
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
        };

        /**
         * Fill 1s equal to the number of acitve stencil masks.
         * @private
         * @return {number} The bitwise mask.
         */
        StencilSystem.prototype._getBitwiseMask = function _getBitwiseMask ()
        {
            return (1 << this.getStackLength()) - 1;
        };

        return StencilSystem;
    }(AbstractMaskSystem));

    /**
     * System plugin to the renderer to manage the projection matrix.
     *
     * @class
     * @extends PIXI.System
     * @memberof PIXI.systems
     */

    var ProjectionSystem = /*@__PURE__*/(function (System) {
        function ProjectionSystem(renderer)
        {
            System.call(this, renderer);

            /**
             * Destination frame
             * @member {PIXI.Rectangle}
             * @readonly
             */
            this.destinationFrame = null;

            /**
             * Source frame
             * @member {PIXI.Rectangle}
             * @readonly
             */
            this.sourceFrame = null;

            /**
             * Default destination frame
             * @member {PIXI.Rectangle}
             * @readonly
             */
            this.defaultFrame = null;

            /**
             * Project matrix
             * @member {PIXI.Matrix}
             * @readonly
             */
            this.projectionMatrix = new math.Matrix();

            /**
             * A transform that will be appended to the projection matrix
             * if null, nothing will be applied
             * @member {PIXI.Matrix}
             */
            this.transform = null;
        }

        if ( System ) ProjectionSystem.__proto__ = System;
        ProjectionSystem.prototype = Object.create( System && System.prototype );
        ProjectionSystem.prototype.constructor = ProjectionSystem;

        /**
         * Updates the projection matrix based on a projection frame (which is a rectangle)
         *
         * @param {PIXI.Rectangle} destinationFrame - The destination frame.
         * @param {PIXI.Rectangle} sourceFrame - The source frame.
         * @param {Number} resolution - Resolution
         * @param {boolean} root - If is root
         */
        ProjectionSystem.prototype.update = function update (destinationFrame, sourceFrame, resolution, root)
        {
            this.destinationFrame = destinationFrame || this.destinationFrame || this.defaultFrame;
            this.sourceFrame = sourceFrame || this.sourceFrame || destinationFrame;

            this.calculateProjection(this.destinationFrame, this.sourceFrame, resolution, root);

            if (this.transform)
            {
                this.projectionMatrix.append(this.transform);
            }

            var renderer =  this.renderer;

            renderer.globalUniforms.uniforms.projectionMatrix = this.projectionMatrix;
            renderer.globalUniforms.update();

            // this will work for now
            // but would be sweet to stick and even on the global uniforms..
            if (renderer.shader.shader)
            {
                renderer.shader.syncUniformGroup(renderer.shader.shader.uniforms.globals);
            }
        };

        /**
         * Updates the projection matrix based on a projection frame (which is a rectangle)
         *
         * @param {PIXI.Rectangle} destinationFrame - The destination frame.
         * @param {PIXI.Rectangle} sourceFrame - The source frame.
         * @param {Number} resolution - Resolution
         * @param {boolean} root - If is root
         */
        ProjectionSystem.prototype.calculateProjection = function calculateProjection (destinationFrame, sourceFrame, resolution, root)
        {
            var pm = this.projectionMatrix;

            // I don't think we will need this line..
            // pm.identity();

            if (!root)
            {
                pm.a = (1 / destinationFrame.width * 2) * resolution;
                pm.d = (1 / destinationFrame.height * 2) * resolution;

                pm.tx = -1 - (sourceFrame.x * pm.a);
                pm.ty = -1 - (sourceFrame.y * pm.d);
            }
            else
            {
                pm.a = (1 / destinationFrame.width * 2) * resolution;
                pm.d = (-1 / destinationFrame.height * 2) * resolution;

                pm.tx = -1 - (sourceFrame.x * pm.a);
                pm.ty = 1 - (sourceFrame.y * pm.d);
            }
        };

        /**
         * Sets the transform of the active render target to the given matrix
         *
         * @param {PIXI.Matrix} matrix - The transformation matrix
         */
        ProjectionSystem.prototype.setTransform = function setTransform ()// matrix)
        {
            // this._activeRenderTarget.transform = matrix;
        };

        return ProjectionSystem;
    }(System));

    var tempRect = new math.Rectangle();

    /**
     * System plugin to the renderer to manage render textures.
     *
     * Should be added after FramebufferSystem
     *
     * @class
     * @extends PIXI.System
     * @memberof PIXI.systems
     */

    var RenderTextureSystem = /*@__PURE__*/(function (System) {
        function RenderTextureSystem(renderer)
        {
            System.call(this, renderer);

            /**
             * The clear background color as rgba
             * @member {number[]}
             */
            this.clearColor = renderer._backgroundColorRgba;

            // TODO move this property somewhere else!
            /**
             * List of masks for the StencilSystem
             * @member {PIXI.Graphics[]}
             * @readonly
             */
            this.defaultMaskStack = [];

            // empty render texture?
            /**
             * Render texture
             * @member {PIXI.RenderTexture}
             * @readonly
             */
            this.current = null;

            /**
             * Source frame
             * @member {PIXI.Rectangle}
             * @readonly
             */
            this.sourceFrame = new math.Rectangle();

            /**
             * Destination frame
             * @member {PIXI.Rectangle}
             * @readonly
             */
            this.destinationFrame = new math.Rectangle();
        }

        if ( System ) RenderTextureSystem.__proto__ = System;
        RenderTextureSystem.prototype = Object.create( System && System.prototype );
        RenderTextureSystem.prototype.constructor = RenderTextureSystem;

        /**
         * Bind the current render texture
         * @param {PIXI.RenderTexture} [renderTexture] - RenderTexture to bind, by default its `null`, the screen
         * @param {PIXI.Rectangle} [sourceFrame] - part of screen that is mapped to the renderTexture
         * @param {PIXI.Rectangle} [destinationFrame] - part of renderTexture, by default it has the same size as sourceFrame
         */
        RenderTextureSystem.prototype.bind = function bind (renderTexture, sourceFrame, destinationFrame)
        {
            if ( renderTexture === void 0 ) renderTexture = null;

            this.current = renderTexture;

            var renderer = this.renderer;

            var resolution;

            if (renderTexture)
            {
                var baseTexture = renderTexture.baseTexture;

                resolution = baseTexture.resolution;

                if (!destinationFrame)
                {
                    tempRect.width = baseTexture.realWidth;
                    tempRect.height = baseTexture.realHeight;

                    destinationFrame = tempRect;
                }

                if (!sourceFrame)
                {
                    sourceFrame = destinationFrame;
                }

                this.renderer.framebuffer.bind(baseTexture.framebuffer, destinationFrame);

                this.renderer.projection.update(destinationFrame, sourceFrame, resolution, false);
                this.renderer.mask.setMaskStack(baseTexture.maskStack);
            }
            else
            {
                resolution = this.renderer.resolution;

                // TODO these validation checks happen deeper down..
                // thing they can be avoided..
                if (!destinationFrame)
                {
                    tempRect.width = renderer.width;
                    tempRect.height = renderer.height;

                    destinationFrame = tempRect;
                }

                if (!sourceFrame)
                {
                    sourceFrame = destinationFrame;
                }

                renderer.framebuffer.bind(null, destinationFrame);

                // TODO store this..
                this.renderer.projection.update(destinationFrame, sourceFrame, resolution, true);
                this.renderer.mask.setMaskStack(this.defaultMaskStack);
            }

            this.sourceFrame.copyFrom(sourceFrame);

            this.destinationFrame.x = destinationFrame.x / resolution;
            this.destinationFrame.y = destinationFrame.y / resolution;

            this.destinationFrame.width = destinationFrame.width / resolution;
            this.destinationFrame.height = destinationFrame.height / resolution;

            if (sourceFrame === destinationFrame)
            {
                this.sourceFrame.copyFrom(this.destinationFrame);
            }
        };

        /**
         * Erases the render texture and fills the drawing area with a colour
         *
         * @param {number[]} [clearColor] - The color as rgba, default to use the renderer backgroundColor
         * @return {PIXI.Renderer} Returns itself.
         */
        RenderTextureSystem.prototype.clear = function clear (clearColor)
        {
            if (this.current)
            {
                clearColor = clearColor || this.current.baseTexture.clearColor;
            }
            else
            {
                clearColor = clearColor || this.clearColor;
            }

            this.renderer.framebuffer.clear(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
        };

        RenderTextureSystem.prototype.resize = function resize ()// screenWidth, screenHeight)
        {
            // resize the root only!
            this.bind(null);
        };

        /**
         * Resets renderTexture state
         */
        RenderTextureSystem.prototype.reset = function reset ()
        {
            this.bind(null);
        };

        return RenderTextureSystem;
    }(System));

    /**
     * Helper class to create a WebGL Program
     *
     * @class
     * @memberof PIXI
     */
    var GLProgram = function GLProgram(program, uniformData)
    {
        /**
         * The shader program
         *
         * @member {WebGLProgram}
         */
        this.program = program;

        /**
         * holds the uniform data which contains uniform locations
         * and current uniform values used for caching and preventing unneeded GPU commands
         * @member {Object}
         */
        this.uniformData = uniformData;

        /**
         * uniformGroups holds the various upload functions for the shader. Each uniform group
         * and program have a unique upload function generated.
         * @member {Object}
         */
        this.uniformGroups = {};
    };

    /**
     * Destroys this program
     */
    GLProgram.prototype.destroy = function destroy ()
    {
        this.uniformData = null;
        this.uniformGroups = null;
        this.program = null;
    };

    var UID$4 = 0;
    // defualt sync data so we don't create a new one each time!
    var defaultSyncData = { textureCount: 0 };

    /**
     * System plugin to the renderer to manage shaders.
     *
     * @class
     * @memberof PIXI.systems
     * @extends PIXI.System
     */
    var ShaderSystem = /*@__PURE__*/(function (System) {
        function ShaderSystem(renderer)
        {
            System.call(this, renderer);

            // Validation check that this environment support `new Function`
            this.systemCheck();

            /**
             * The current WebGL rendering context
             *
             * @member {WebGLRenderingContext}
             */
            this.gl = null;

            this.shader = null;
            this.program = null;

            /**
             * Cache to holds the generated functions. Stored against UniformObjects unique signature
             * @type {Object}
             * @private
             */
            this.cache = {};

            this.id = UID$4++;
        }

        if ( System ) ShaderSystem.__proto__ = System;
        ShaderSystem.prototype = Object.create( System && System.prototype );
        ShaderSystem.prototype.constructor = ShaderSystem;

        /**
         * Overrideable function by `@pixi/unsafe-eval` to silence
         * throwing an error if platform doesn't support unsafe-evals.
         *
         * @private
         */
        ShaderSystem.prototype.systemCheck = function systemCheck ()
        {
            if (!unsafeEvalSupported())
            {
                throw new Error('Current environment does not allow unsafe-eval, '
                    + 'please use @pixi/unsafe-eval module to enable support.');
            }
        };

        ShaderSystem.prototype.contextChange = function contextChange (gl)
        {
            this.gl = gl;
            this.reset();
        };

        /**
         * Changes the current shader to the one given in parameter
         *
         * @param {PIXI.Shader} shader - the new shader
         * @param {boolean} dontSync - false if the shader should automatically sync its uniforms.
         * @returns {PIXI.GLProgram} the glProgram that belongs to the shader.
         */
        ShaderSystem.prototype.bind = function bind (shader, dontSync)
        {
            shader.uniforms.globals = this.renderer.globalUniforms;

            var program = shader.program;
            var glProgram = program.glPrograms[this.renderer.CONTEXT_UID] || this.generateShader(shader);

            this.shader = shader;

            // TODO - some current Pixi plugins bypass this.. so it not safe to use yet..
            if (this.program !== program)
            {
                this.program = program;
                this.gl.useProgram(glProgram.program);
            }

            if (!dontSync)
            {
                defaultSyncData.textureCount = 0;

                this.syncUniformGroup(shader.uniformGroup, defaultSyncData);
            }

            return glProgram;
        };

        /**
         * Uploads the uniforms values to the currently bound shader.
         *
         * @param {object} uniforms - the uniforms values that be applied to the current shader
         */
        ShaderSystem.prototype.setUniforms = function setUniforms (uniforms)
        {
            var shader = this.shader.program;
            var glProgram = shader.glPrograms[this.renderer.CONTEXT_UID];

            shader.syncUniforms(glProgram.uniformData, uniforms, this.renderer);
        };

        /**
         *
         * syncs uniforms on the group
         * @param {*} group the uniform group to sync
         * @param {*} syncData this is data that is passed to the sync function and any nested sync functions
         */
        ShaderSystem.prototype.syncUniformGroup = function syncUniformGroup (group, syncData)
        {
            var glProgram = this.getglProgram();

            if (!group.static || group.dirtyId !== glProgram.uniformGroups[group.id])
            {
                glProgram.uniformGroups[group.id] = group.dirtyId;

                this.syncUniforms(group, glProgram, syncData);
            }
        };

        /**
         * Overrideable by the @pixi/unsafe-eval package to use static
         * syncUnforms instead.
         *
         * @private
         */
        ShaderSystem.prototype.syncUniforms = function syncUniforms (group, glProgram, syncData)
        {
            var syncFunc = group.syncUniforms[this.shader.program.id] || this.createSyncGroups(group);

            syncFunc(glProgram.uniformData, group.uniforms, this.renderer, syncData);
        };

        ShaderSystem.prototype.createSyncGroups = function createSyncGroups (group)
        {
            var id = this.getSignature(group, this.shader.program.uniformData);

            if (!this.cache[id])
            {
                this.cache[id] = generateUniformsSync(group, this.shader.program.uniformData);
            }

            group.syncUniforms[this.shader.program.id] = this.cache[id];

            return group.syncUniforms[this.shader.program.id];
        };

        /**
         * Takes a uniform group and data and generates a unique signature for them.
         *
         * @param {PIXI.UniformGroup} group the uniform group to get signature of
         * @param {Object} uniformData uniform information generated by the shader
         * @returns {String} Unique signature of the uniform group
         * @private
         */
        ShaderSystem.prototype.getSignature = function getSignature (group, uniformData)
        {
            var uniforms = group.uniforms;

            var strings = [];

            for (var i in uniforms)
            {
                strings.push(i);

                if (uniformData[i])
                {
                    strings.push(uniformData[i].type);
                }
            }

            return strings.join('-');
        };

        /**
         * Returns the underlying GLShade rof the currently bound shader.
         * This can be handy for when you to have a little more control over the setting of your uniforms.
         *
         * @return {PIXI.GLProgram} the glProgram for the currently bound Shader for this context
         */
        ShaderSystem.prototype.getglProgram = function getglProgram ()
        {
            if (this.shader)
            {
                return this.shader.program.glPrograms[this.renderer.CONTEXT_UID];
            }

            return null;
        };

        /**
         * Generates a glProgram version of the Shader provided.
         *
         * @private
         * @param {PIXI.Shader} shader the shader that the glProgram will be based on.
         * @return {PIXI.GLProgram} A shiny new glProgram!
         */
        ShaderSystem.prototype.generateShader = function generateShader (shader)
        {
            var gl = this.gl;

            var program = shader.program;

            var attribMap = {};

            for (var i in program.attributeData)
            {
                attribMap[i] = program.attributeData[i].location;
            }

            var shaderProgram = compileProgram(gl, program.vertexSrc, program.fragmentSrc, attribMap);
            var uniformData = {};

            for (var i$1 in program.uniformData)
            {
                var data = program.uniformData[i$1];

                uniformData[i$1] = {
                    location: gl.getUniformLocation(shaderProgram, i$1),
                    value: defaultValue(data.type, data.size),
                };
            }

            var glProgram = new GLProgram(shaderProgram, uniformData);

            program.glPrograms[this.renderer.CONTEXT_UID] = glProgram;

            return glProgram;
        };

        /**
         * Resets ShaderSystem state, does not affect WebGL state
         */
        ShaderSystem.prototype.reset = function reset ()
        {
            this.program = null;
            this.shader = null;
        };

        /**
         * Destroys this System and removes all its textures
         */
        ShaderSystem.prototype.destroy = function destroy ()
        {
            // TODO implement destroy method for ShaderSystem
            this.destroyed = true;
        };

        return ShaderSystem;
    }(System));

    /**
     * Maps gl blend combinations to WebGL.
     *
     * @memberof PIXI
     * @function mapWebGLBlendModesToPixi
     * @private
     * @param {WebGLRenderingContext} gl - The rendering context.
     * @param {number[][]} [array=[]] - The array to output into.
     * @return {number[][]} Mapped modes.
     */
    function mapWebGLBlendModesToPixi(gl, array)
    {
        if ( array === void 0 ) array = [];

        // TODO - premultiply alpha would be different.
        // add a boolean for that!
        array[constants.BLEND_MODES.NORMAL] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        array[constants.BLEND_MODES.ADD] = [gl.ONE, gl.ONE];
        array[constants.BLEND_MODES.MULTIPLY] = [gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        array[constants.BLEND_MODES.SCREEN] = [gl.ONE, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        array[constants.BLEND_MODES.OVERLAY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        array[constants.BLEND_MODES.DARKEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        array[constants.BLEND_MODES.LIGHTEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        array[constants.BLEND_MODES.COLOR_DODGE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        array[constants.BLEND_MODES.COLOR_BURN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        array[constants.BLEND_MODES.HARD_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        array[constants.BLEND_MODES.SOFT_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        array[constants.BLEND_MODES.DIFFERENCE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        array[constants.BLEND_MODES.EXCLUSION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        array[constants.BLEND_MODES.HUE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        array[constants.BLEND_MODES.SATURATION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        array[constants.BLEND_MODES.COLOR] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        array[constants.BLEND_MODES.LUMINOSITY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        array[constants.BLEND_MODES.NONE] = [0, 0];

        // not-premultiplied blend modes
        array[constants.BLEND_MODES.NORMAL_NPM] = [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
        array[constants.BLEND_MODES.ADD_NPM] = [gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE];
        array[constants.BLEND_MODES.SCREEN_NPM] = [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];

        // composite operations
        array[constants.BLEND_MODES.SRC_IN] = [gl.DST_ALPHA, gl.ZERO];
        array[constants.BLEND_MODES.SRC_OUT] = [gl.ONE_MINUS_DST_ALPHA, gl.ZERO];
        array[constants.BLEND_MODES.SRC_ATOP] = [gl.DST_ALPHA, gl.ONE_MINUS_SRC_ALPHA];
        array[constants.BLEND_MODES.DST_OVER] = [gl.ONE_MINUS_DST_ALPHA, gl.ONE];
        array[constants.BLEND_MODES.DST_IN] = [gl.ZERO, gl.SRC_ALPHA];
        array[constants.BLEND_MODES.DST_OUT] = [gl.ZERO, gl.ONE_MINUS_SRC_ALPHA];
        array[constants.BLEND_MODES.DST_ATOP] = [gl.ONE_MINUS_DST_ALPHA, gl.SRC_ALPHA];
        array[constants.BLEND_MODES.XOR] = [gl.ONE_MINUS_DST_ALPHA, gl.ONE_MINUS_SRC_ALPHA];

        // SUBTRACT from flash
        array[constants.BLEND_MODES.SUBTRACT] = [gl.ONE, gl.ONE, gl.ONE, gl.ONE, gl.FUNC_REVERSE_SUBTRACT, gl.FUNC_ADD];

        return array;
    }

    var BLEND$1 = 0;
    var OFFSET$1 = 1;
    var CULLING$1 = 2;
    var DEPTH_TEST$1 = 3;
    var WINDING$1 = 4;

    /**
     * System plugin to the renderer to manage WebGL state machines.
     *
     * @class
     * @extends PIXI.System
     * @memberof PIXI.systems
     */
    var StateSystem = /*@__PURE__*/(function (System) {
        function StateSystem(renderer)
        {
            System.call(this, renderer);

            /**
             * GL context
             * @member {WebGLRenderingContext}
             * @readonly
             */
            this.gl = null;

            /**
             * State ID
             * @member {number}
             * @readonly
             */
            this.stateId = 0;

            /**
             * Polygon offset
             * @member {number}
             * @readonly
             */
            this.polygonOffset = 0;

            /**
             * Blend mode
             * @member {number}
             * @default PIXI.BLEND_MODES.NONE
             * @readonly
             */
            this.blendMode = constants.BLEND_MODES.NONE;

            /**
             * Whether current blend equation is different
             * @member {boolean}
             * @protected
             */
            this._blendEq = false;

            /**
             * Collection of calls
             * @member {function[]}
             * @readonly
             */
            this.map = [];

            // map functions for when we set state..
            this.map[BLEND$1] = this.setBlend;
            this.map[OFFSET$1] = this.setOffset;
            this.map[CULLING$1] = this.setCullFace;
            this.map[DEPTH_TEST$1] = this.setDepthTest;
            this.map[WINDING$1] = this.setFrontFace;

            /**
             * Collection of check calls
             * @member {function[]}
             * @readonly
             */
            this.checks = [];

            /**
             * Default WebGL State
             * @member {PIXI.State}
             * @readonly
             */
            this.defaultState = new State();
            this.defaultState.blend = true;
            this.defaultState.depth = true;
        }

        if ( System ) StateSystem.__proto__ = System;
        StateSystem.prototype = Object.create( System && System.prototype );
        StateSystem.prototype.constructor = StateSystem;

        StateSystem.prototype.contextChange = function contextChange (gl)
        {
            this.gl = gl;

            this.blendModes = mapWebGLBlendModesToPixi(gl);

            this.set(this.defaultState);

            this.reset();
        };

        /**
         * Sets the current state
         *
         * @param {*} state - The state to set.
         */
        StateSystem.prototype.set = function set (state)
        {
            state = state || this.defaultState;

            // TODO maybe to an object check? ( this.state === state )?
            if (this.stateId !== state.data)
            {
                var diff = this.stateId ^ state.data;
                var i = 0;

                // order from least to most common
                while (diff)
                {
                    if (diff & 1)
                    {
                        // state change!
                        this.map[i].call(this, !!(state.data & (1 << i)));
                    }

                    diff = diff >> 1;
                    i++;
                }

                this.stateId = state.data;
            }

            // based on the above settings we check for specific modes..
            // for example if blend is active we check and set the blend modes
            // or of polygon offset is active we check the poly depth.
            for (var i$1 = 0; i$1 < this.checks.length; i$1++)
            {
                this.checks[i$1](this, state);
            }
        };

        /**
         * Sets the state, when previous state is unknown
         *
         * @param {*} state - The state to set
         */
        StateSystem.prototype.forceState = function forceState (state)
        {
            state = state || this.defaultState;
            for (var i = 0; i < this.map.length; i++)
            {
                this.map[i].call(this, !!(state.data & (1 << i)));
            }
            for (var i$1 = 0; i$1 < this.checks.length; i$1++)
            {
                this.checks[i$1](this, state);
            }

            this.stateId = state.data;
        };

        /**
         * Enables or disabled blending.
         *
         * @param {boolean} value - Turn on or off webgl blending.
         */
        StateSystem.prototype.setBlend = function setBlend (value)
        {
            this.updateCheck(StateSystem.checkBlendMode, value);

            this.gl[value ? 'enable' : 'disable'](this.gl.BLEND);
        };

        /**
         * Enables or disable polygon offset fill
         *
         * @param {boolean} value - Turn on or off webgl polygon offset testing.
         */
        StateSystem.prototype.setOffset = function setOffset (value)
        {
            this.updateCheck(StateSystem.checkPolygonOffset, value);

            this.gl[value ? 'enable' : 'disable'](this.gl.POLYGON_OFFSET_FILL);
        };

        /**
         * Sets whether to enable or disable depth test.
         *
         * @param {boolean} value - Turn on or off webgl depth testing.
         */
        StateSystem.prototype.setDepthTest = function setDepthTest (value)
        {
            this.gl[value ? 'enable' : 'disable'](this.gl.DEPTH_TEST);
        };

        /**
         * Sets whether to enable or disable cull face.
         *
         * @param {boolean} value - Turn on or off webgl cull face.
         */
        StateSystem.prototype.setCullFace = function setCullFace (value)
        {
            this.gl[value ? 'enable' : 'disable'](this.gl.CULL_FACE);
        };

        /**
         * Sets the gl front face.
         *
         * @param {boolean} value - true is clockwise and false is counter-clockwise
         */
        StateSystem.prototype.setFrontFace = function setFrontFace (value)
        {
            this.gl.frontFace(this.gl[value ? 'CW' : 'CCW']);
        };

        /**
         * Sets the blend mode.
         *
         * @param {number} value - The blend mode to set to.
         */
        StateSystem.prototype.setBlendMode = function setBlendMode (value)
        {
            if (value === this.blendMode)
            {
                return;
            }

            this.blendMode = value;

            var mode = this.blendModes[value];
            var gl = this.gl;

            if (mode.length === 2)
            {
                gl.blendFunc(mode[0], mode[1]);
            }
            else
            {
                gl.blendFuncSeparate(mode[0], mode[1], mode[2], mode[3]);
            }
            if (mode.length === 6)
            {
                this._blendEq = true;
                gl.blendEquationSeparate(mode[4], mode[5]);
            }
            else if (this._blendEq)
            {
                this._blendEq = false;
                gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            }
        };

        /**
         * Sets the polygon offset.
         *
         * @param {number} value - the polygon offset
         * @param {number} scale - the polygon offset scale
         */
        StateSystem.prototype.setPolygonOffset = function setPolygonOffset (value, scale)
        {
            this.gl.polygonOffset(value, scale);
        };

        // used
        /**
         * Resets all the logic and disables the vaos
         */
        StateSystem.prototype.reset = function reset ()
        {
            this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);

            this.forceState(0);

            this._blendEq = true;
            this.blendMode = -1;
            this.setBlendMode(0);
        };

        /**
         * checks to see which updates should be checked based on which settings have been activated.
         * For example, if blend is enabled then we should check the blend modes each time the state is changed
         * or if polygon fill is activated then we need to check if the polygon offset changes.
         * The idea is that we only check what we have too.
         *
         * @param {Function} func  the checking function to add or remove
         * @param {boolean} value  should the check function be added or removed.
         */
        StateSystem.prototype.updateCheck = function updateCheck (func, value)
        {
            var index = this.checks.indexOf(func);

            if (value && index === -1)
            {
                this.checks.push(func);
            }
            else if (!value && index !== -1)
            {
                this.checks.splice(index, 1);
            }
        };

        /**
         * A private little wrapper function that we call to check the blend mode.
         *
         * @static
         * @private
         * @param {PIXI.StateSystem} System  the System to perform the state check on
         * @param {PIXI.State} state  the state that the blendMode will pulled from
         */
        StateSystem.checkBlendMode = function checkBlendMode (system, state)
        {
            system.setBlendMode(state.blendMode);
        };

        /**
         * A private little wrapper function that we call to check the polygon offset.
         *
         * @static
         * @private
         * @param {PIXI.StateSystem} System  the System to perform the state check on
         * @param {PIXI.State} state  the state that the blendMode will pulled from
         */
        StateSystem.checkPolygonOffset = function checkPolygonOffset (system, state)
        {
            system.setPolygonOffset(state.polygonOffset, 0);
        };

        return StateSystem;
    }(System));

    /**
     * System plugin to the renderer to manage texture garbage collection on the GPU,
     * ensuring that it does not get clogged up with textures that are no longer being used.
     *
     * @class
     * @memberof PIXI.systems
     * @extends PIXI.System
     */
    var TextureGCSystem = /*@__PURE__*/(function (System) {
        function TextureGCSystem(renderer)
        {
            System.call(this, renderer);

            /**
             * Count
             * @member {number}
             * @readonly
             */
            this.count = 0;

            /**
             * Check count
             * @member {number}
             * @readonly
             */
            this.checkCount = 0;

            /**
             * Maximum idle time, in seconds
             * @member {number}
             * @see PIXI.settings.GC_MAX_IDLE
             */
            this.maxIdle = settings.settings.GC_MAX_IDLE;

            /**
             * Maximum number of item to check
             * @member {number}
             * @see PIXI.settings.GC_MAX_CHECK_COUNT
             */
            this.checkCountMax = settings.settings.GC_MAX_CHECK_COUNT;

            /**
             * Current garabage collection mode
             * @member {PIXI.GC_MODES}
             * @see PIXI.settings.GC_MODE
             */
            this.mode = settings.settings.GC_MODE;
        }

        if ( System ) TextureGCSystem.__proto__ = System;
        TextureGCSystem.prototype = Object.create( System && System.prototype );
        TextureGCSystem.prototype.constructor = TextureGCSystem;

        /**
         * Checks to see when the last time a texture was used
         * if the texture has not been used for a specified amount of time it will be removed from the GPU
         */
        TextureGCSystem.prototype.postrender = function postrender ()
        {
            if (!this.renderer.renderingToScreen)
            {
                return;
            }

            this.count++;

            if (this.mode === constants.GC_MODES.MANUAL)
            {
                return;
            }

            this.checkCount++;

            if (this.checkCount > this.checkCountMax)
            {
                this.checkCount = 0;

                this.run();
            }
        };

        /**
         * Checks to see when the last time a texture was used
         * if the texture has not been used for a specified amount of time it will be removed from the GPU
         */
        TextureGCSystem.prototype.run = function run ()
        {
            var tm = this.renderer.texture;
            var managedTextures =  tm.managedTextures;
            var wasRemoved = false;

            for (var i = 0; i < managedTextures.length; i++)
            {
                var texture = managedTextures[i];

                // only supports non generated textures at the moment!
                if (!texture.framebuffer && this.count - texture.touched > this.maxIdle)
                {
                    tm.destroyTexture(texture, true);
                    managedTextures[i] = null;
                    wasRemoved = true;
                }
            }

            if (wasRemoved)
            {
                var j = 0;

                for (var i$1 = 0; i$1 < managedTextures.length; i$1++)
                {
                    if (managedTextures[i$1] !== null)
                    {
                        managedTextures[j++] = managedTextures[i$1];
                    }
                }

                managedTextures.length = j;
            }
        };

        /**
         * Removes all the textures within the specified displayObject and its children from the GPU
         *
         * @param {PIXI.DisplayObject} displayObject - the displayObject to remove the textures from.
         */
        TextureGCSystem.prototype.unload = function unload (displayObject)
        {
            var tm = this.renderer.textureSystem;

            // only destroy non generated textures
            if (displayObject._texture && displayObject._texture._glRenderTargets)
            {
                tm.destroyTexture(displayObject._texture);
            }

            for (var i = displayObject.children.length - 1; i >= 0; i--)
            {
                this.unload(displayObject.children[i]);
            }
        };

        return TextureGCSystem;
    }(System));

    /**
     * Internal texture for WebGL context
     * @class
     * @memberof PIXI
     */
    var GLTexture = function GLTexture(texture)
    {
        /**
         * The WebGL texture
         * @member {WebGLTexture}
         */
        this.texture = texture;

        /**
         * Width of texture that was used in texImage2D
         * @member {number}
         */
        this.width = -1;

        /**
         * Height of texture that was used in texImage2D
         * @member {number}
         */
        this.height = -1;

        /**
         * Texture contents dirty flag
         * @member {number}
         */
        this.dirtyId = -1;

        /**
         * Texture style dirty flag
         * @member {number}
         */
        this.dirtyStyleId = -1;

        /**
         * Whether mip levels has to be generated
         * @member {boolean}
         */
        this.mipmap = false;

        /**
         * WrapMode copied from baseTexture
         * @member {number}
         */
        this.wrapMode = 33071;

        /**
         * Type copied from baseTexture
         * @member {number}
         */
        this.type = 6408;

        /**
         * Type copied from baseTexture
         * @member {number}
         */
        this.internalFormat = 5121;
    };

    /**
     * System plugin to the renderer to manage textures.
     *
     * @class
     * @extends PIXI.System
     * @memberof PIXI.systems
     */
    var TextureSystem = /*@__PURE__*/(function (System) {
        function TextureSystem(renderer)
        {
            System.call(this, renderer);

            // TODO set to max textures...
            /**
             * Bound textures
             * @member {PIXI.BaseTexture[]}
             * @readonly
             */
            this.boundTextures = [];
            /**
             * Current location
             * @member {number}
             * @readonly
             */
            this.currentLocation = -1;

            /**
             * List of managed textures
             * @member {PIXI.BaseTexture[]}
             * @readonly
             */
            this.managedTextures = [];

            /**
             * Did someone temper with textures state? We'll overwrite them when we need to unbind something.
             * @member {boolean}
             * @private
             */
            this._unknownBoundTextures = false;

            /**
             * BaseTexture value that shows that we don't know what is bound
             * @member {PIXI.BaseTexture}
             * @readonly
             */
            this.unknownTexture = new BaseTexture();
        }

        if ( System ) TextureSystem.__proto__ = System;
        TextureSystem.prototype = Object.create( System && System.prototype );
        TextureSystem.prototype.constructor = TextureSystem;

        /**
         * Sets up the renderer context and necessary buffers.
         */
        TextureSystem.prototype.contextChange = function contextChange ()
        {
            var gl = this.gl = this.renderer.gl;

            this.CONTEXT_UID = this.renderer.CONTEXT_UID;

            this.webGLVersion = this.renderer.context.webGLVersion;

            var maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

            this.boundTextures.length = maxTextures;

            for (var i = 0; i < maxTextures; i++)
            {
                this.boundTextures[i] = null;
            }

            // TODO move this.. to a nice make empty textures class..
            this.emptyTextures = {};

            var emptyTexture2D = new GLTexture(gl.createTexture());

            gl.bindTexture(gl.TEXTURE_2D, emptyTexture2D.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));

            this.emptyTextures[gl.TEXTURE_2D] = emptyTexture2D;
            this.emptyTextures[gl.TEXTURE_CUBE_MAP] = new GLTexture(gl.createTexture());

            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.emptyTextures[gl.TEXTURE_CUBE_MAP].texture);

            for (var i$1 = 0; i$1 < 6; i$1++)
            {
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i$1, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            }

            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            for (var i$2 = 0; i$2 < this.boundTextures.length; i$2++)
            {
                this.bind(null, i$2);
            }
        };

        /**
         * Bind a texture to a specific location
         *
         * If you want to unbind something, please use `unbind(texture)` instead of `bind(null, textureLocation)`
         *
         * @param {PIXI.Texture|PIXI.BaseTexture} texture - Texture to bind
         * @param {number} [location=0] - Location to bind at
         */
        TextureSystem.prototype.bind = function bind (texture, location)
        {
            if ( location === void 0 ) location = 0;

            var ref = this;
            var gl = ref.gl;

            if (texture)
            {
                texture = texture.baseTexture || texture;

                if (texture.valid)
                {
                    texture.touched = this.renderer.textureGC.count;

                    var glTexture = texture._glTextures[this.CONTEXT_UID] || this.initTexture(texture);

                    if (this.boundTextures[location] !== texture)
                    {
                        if (this.currentLocation !== location)
                        {
                            this.currentLocation = location;
                            gl.activeTexture(gl.TEXTURE0 + location);
                        }
                        gl.bindTexture(texture.target, glTexture.texture);
                    }

                    if (glTexture.dirtyId !== texture.dirtyId)
                    {
                        if (this.currentLocation !== location)
                        {
                            this.currentLocation = location;
                            gl.activeTexture(gl.TEXTURE0 + location);
                        }
                        this.updateTexture(texture);
                    }

                    this.boundTextures[location] = texture;
                }
            }
            else
            {
                if (this.currentLocation !== location)
                {
                    this.currentLocation = location;
                    gl.activeTexture(gl.TEXTURE0 + location);
                }

                gl.bindTexture(gl.TEXTURE_2D, this.emptyTextures[gl.TEXTURE_2D].texture);
                this.boundTextures[location] = null;
            }
        };

        /**
         * Resets texture location and bound textures
         *
         * Actual `bind(null, i)` calls will be performed at next `unbind()` call
         */
        TextureSystem.prototype.reset = function reset ()
        {
            this._unknownBoundTextures = true;
            this.currentLocation = -1;

            for (var i = 0; i < this.boundTextures.length; i++)
            {
                this.boundTextures[i] = this.unknownTexture;
            }
        };

        /**
         * Unbind a texture
         * @param {PIXI.Texture|PIXI.BaseTexture} texture - Texture to bind
         */
        TextureSystem.prototype.unbind = function unbind (texture)
        {
            var ref = this;
            var gl = ref.gl;
            var boundTextures = ref.boundTextures;

            if (this._unknownBoundTextures)
            {
                this._unknownBoundTextures = false;
                // someone changed webGL state,
                // we have to be sure that our texture does not appear in multi-texture renderer samplers
                for (var i = 0; i < boundTextures.length; i++)
                {
                    if (boundTextures[i] === this.unknownTexture)
                    {
                        this.bind(null, i);
                    }
                }
            }

            for (var i$1 = 0; i$1 < boundTextures.length; i$1++)
            {
                if (boundTextures[i$1] === texture)
                {
                    if (this.currentLocation !== i$1)
                    {
                        gl.activeTexture(gl.TEXTURE0 + i$1);
                        this.currentLocation = i$1;
                    }

                    gl.bindTexture(gl.TEXTURE_2D, this.emptyTextures[texture.target].texture);
                    boundTextures[i$1] = null;
                }
            }
        };

        /**
         * Initialize a texture
         *
         * @private
         * @param {PIXI.BaseTexture} texture - Texture to initialize
         */
        TextureSystem.prototype.initTexture = function initTexture (texture)
        {
            var glTexture = new GLTexture(this.gl.createTexture());

            // guarantee an update..
            glTexture.dirtyId = -1;

            texture._glTextures[this.CONTEXT_UID] = glTexture;

            this.managedTextures.push(texture);
            texture.on('dispose', this.destroyTexture, this);

            return glTexture;
        };

        TextureSystem.prototype.initTextureType = function initTextureType (texture, glTexture)
        {
            glTexture.internalFormat = texture.format;
            glTexture.type = texture.type;
            if (this.webGLVersion !== 2)
            {
                return;
            }
            var gl = this.renderer.gl;

            if (texture.type === gl.FLOAT
                && texture.format === gl.RGBA)
            {
                glTexture.internalFormat = gl.RGBA32F;
            }
            // that's WebGL1 HALF_FLOAT_OES
            // we have to convert it to WebGL HALF_FLOAT
            if (texture.type === constants.TYPES.HALF_FLOAT)
            {
                glTexture.type = gl.HALF_FLOAT;
            }
            if (glTexture.type === gl.HALF_FLOAT
                && texture.format === gl.RGBA)
            {
                glTexture.internalFormat = gl.RGBA16F;
            }
        };

        /**
         * Update a texture
         *
         * @private
         * @param {PIXI.BaseTexture} texture - Texture to initialize
         */
        TextureSystem.prototype.updateTexture = function updateTexture (texture)
        {
            var glTexture = texture._glTextures[this.CONTEXT_UID];

            if (!glTexture)
            {
                return;
            }

            var renderer = this.renderer;

            this.initTextureType(texture, glTexture);

            if (texture.resource && texture.resource.upload(renderer, texture, glTexture))
            {
                // texture is uploaded, dont do anything!
            }
            else
            {
                // default, renderTexture-like logic
                var width = texture.realWidth;
                var height = texture.realHeight;
                var gl = renderer.gl;

                if (glTexture.width !== width
                    || glTexture.height !== height
                    || glTexture.dirtyId < 0)
                {
                    glTexture.width = width;
                    glTexture.height = height;

                    gl.texImage2D(texture.target, 0,
                        glTexture.internalFormat,
                        width,
                        height,
                        0,
                        texture.format,
                        glTexture.type,
                        null);
                }
            }

            // lets only update what changes..
            if (texture.dirtyStyleId !== glTexture.dirtyStyleId)
            {
                this.updateTextureStyle(texture);
            }
            glTexture.dirtyId = texture.dirtyId;
        };

        /**
         * Deletes the texture from WebGL
         *
         * @private
         * @param {PIXI.BaseTexture|PIXI.Texture} texture - the texture to destroy
         * @param {boolean} [skipRemove=false] - Whether to skip removing the texture from the TextureManager.
         */
        TextureSystem.prototype.destroyTexture = function destroyTexture (texture, skipRemove)
        {
            var ref = this;
            var gl = ref.gl;

            texture = texture.baseTexture || texture;

            if (texture._glTextures[this.CONTEXT_UID])
            {
                this.unbind(texture);

                gl.deleteTexture(texture._glTextures[this.CONTEXT_UID].texture);
                texture.off('dispose', this.destroyTexture, this);

                delete texture._glTextures[this.CONTEXT_UID];

                if (!skipRemove)
                {
                    var i = this.managedTextures.indexOf(texture);

                    if (i !== -1)
                    {
                        utils.removeItems(this.managedTextures, i, 1);
                    }
                }
            }
        };

        /**
         * Update texture style such as mipmap flag
         *
         * @private
         * @param {PIXI.BaseTexture} texture - Texture to update
         */
        TextureSystem.prototype.updateTextureStyle = function updateTextureStyle (texture)
        {
            var glTexture = texture._glTextures[this.CONTEXT_UID];

            if (!glTexture)
            {
                return;
            }

            if ((texture.mipmap === constants.MIPMAP_MODES.POW2 || this.webGLVersion !== 2) && !texture.isPowerOfTwo)
            {
                glTexture.mipmap = 0;
            }
            else
            {
                glTexture.mipmap = texture.mipmap >= 1;
            }

            if (this.webGLVersion !== 2 && !texture.isPowerOfTwo)
            {
                glTexture.wrapMode = constants.WRAP_MODES.CLAMP;
            }
            else
            {
                glTexture.wrapMode = texture.wrapMode;
            }

            if (texture.resource && texture.resource.style(this.renderer, texture, glTexture))
            {
                // style is set, dont do anything!
            }
            else
            {
                this.setStyle(texture, glTexture);
            }

            glTexture.dirtyStyleId = texture.dirtyStyleId;
        };

        /**
         * Set style for texture
         *
         * @private
         * @param {PIXI.BaseTexture} texture - Texture to update
         * @param {PIXI.GLTexture} glTexture
         */
        TextureSystem.prototype.setStyle = function setStyle (texture, glTexture)
        {
            var gl = this.gl;

            if (glTexture.mipmap)
            {
                gl.generateMipmap(texture.target);
            }

            gl.texParameteri(texture.target, gl.TEXTURE_WRAP_S, glTexture.wrapMode);
            gl.texParameteri(texture.target, gl.TEXTURE_WRAP_T, glTexture.wrapMode);

            if (glTexture.mipmap)
            {
                /* eslint-disable max-len */
                gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, texture.scaleMode ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_NEAREST);
                /* eslint-disable max-len */

                var anisotropicExt = this.renderer.context.extensions.anisotropicFiltering;

                if (anisotropicExt && texture.anisotropicLevel > 0 && texture.scaleMode === constants.SCALE_MODES.LINEAR)
                {
                    var level = Math.min(texture.anisotropicLevel, gl.getParameter(anisotropicExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT));

                    gl.texParameterf(texture.target, anisotropicExt.TEXTURE_MAX_ANISOTROPY_EXT, level);
                }
            }
            else
            {
                gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, texture.scaleMode ? gl.LINEAR : gl.NEAREST);
            }

            gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, texture.scaleMode ? gl.LINEAR : gl.NEAREST);
        };

        return TextureSystem;
    }(System));

    /**
     * Systems are individual components to the Renderer pipeline.
     * @namespace PIXI.systems
     */

    var systems = ({
        FilterSystem: FilterSystem,
        BatchSystem: BatchSystem,
        ContextSystem: ContextSystem,
        FramebufferSystem: FramebufferSystem,
        GeometrySystem: GeometrySystem,
        MaskSystem: MaskSystem,
        ScissorSystem: ScissorSystem,
        StencilSystem: StencilSystem,
        ProjectionSystem: ProjectionSystem,
        RenderTextureSystem: RenderTextureSystem,
        ShaderSystem: ShaderSystem,
        StateSystem: StateSystem,
        TextureGCSystem: TextureGCSystem,
        TextureSystem: TextureSystem
    });

    var tempMatrix = new math.Matrix();

    /**
     * The AbstractRenderer is the base for a PixiJS Renderer. It is extended by the {@link PIXI.CanvasRenderer}
     * and {@link PIXI.Renderer} which can be used for rendering a PixiJS scene.
     *
     * @abstract
     * @class
     * @extends PIXI.utils.EventEmitter
     * @memberof PIXI
     */
    var AbstractRenderer = /*@__PURE__*/(function (EventEmitter) {
        function AbstractRenderer(system, options)
        {
            EventEmitter.call(this);

            // Add the default render options
            options = Object.assign({}, settings.settings.RENDER_OPTIONS, options);

            // Deprecation notice for renderer roundPixels option
            if (options.roundPixels)
            {
                settings.settings.ROUND_PIXELS = options.roundPixels;
                utils.deprecation('5.0.0', 'Renderer roundPixels option is deprecated, please use PIXI.settings.ROUND_PIXELS', 2);
            }

            /**
             * The supplied constructor options.
             *
             * @member {Object}
             * @readOnly
             */
            this.options = options;

            /**
             * The type of the renderer.
             *
             * @member {number}
             * @default PIXI.RENDERER_TYPE.UNKNOWN
             * @see PIXI.RENDERER_TYPE
             */
            this.type = constants.RENDERER_TYPE.UNKNOWN;

            /**
             * Measurements of the screen. (0, 0, screenWidth, screenHeight).
             *
             * Its safe to use as filterArea or hitArea for the whole stage.
             *
             * @member {PIXI.Rectangle}
             */
            this.screen = new math.Rectangle(0, 0, options.width, options.height);

            /**
             * The canvas element that everything is drawn to.
             *
             * @member {HTMLCanvasElement}
             */
            this.view = options.view || document.createElement('canvas');

            /**
             * The resolution / device pixel ratio of the renderer.
             *
             * @member {number}
             * @default 1
             */
            this.resolution = options.resolution || settings.settings.RESOLUTION;

            /**
             * Whether the render view is transparent.
             *
             * @member {boolean}
             */
            this.transparent = options.transparent;

            /**
             * Whether CSS dimensions of canvas view should be resized to screen dimensions automatically.
             *
             * @member {boolean}
             */
            this.autoDensity = options.autoDensity || options.autoResize || false;
            // autoResize is deprecated, provides fallback support

            /**
             * The value of the preserveDrawingBuffer flag affects whether or not the contents of
             * the stencil buffer is retained after rendering.
             *
             * @member {boolean}
             */
            this.preserveDrawingBuffer = options.preserveDrawingBuffer;

            /**
             * This sets if the CanvasRenderer will clear the canvas or not before the new render pass.
             * If the scene is NOT transparent PixiJS will use a canvas sized fillRect operation every
             * frame to set the canvas background color. If the scene is transparent PixiJS will use clearRect
             * to clear the canvas every frame. Disable this by setting this to false. For example, if
             * your game has a canvas filling background image you often don't need this set.
             *
             * @member {boolean}
             * @default
             */
            this.clearBeforeRender = options.clearBeforeRender;

            /**
             * The background color as a number.
             *
             * @member {number}
             * @protected
             */
            this._backgroundColor = 0x000000;

            /**
             * The background color as an [R, G, B] array.
             *
             * @member {number[]}
             * @protected
             */
            this._backgroundColorRgba = [0, 0, 0, 0];

            /**
             * The background color as a string.
             *
             * @member {string}
             * @protected
             */
            this._backgroundColorString = '#000000';

            this.backgroundColor = options.backgroundColor || this._backgroundColor; // run bg color setter

            /**
             * This temporary display object used as the parent of the currently being rendered item.
             *
             * @member {PIXI.DisplayObject}
             * @protected
             */
            this._tempDisplayObjectParent = new display.Container();

            /**
             * The last root object that the renderer tried to render.
             *
             * @member {PIXI.DisplayObject}
             * @protected
             */
            this._lastObjectRendered = this._tempDisplayObjectParent;

            /**
             * Collection of plugins.
             * @readonly
             * @member {object}
             */
            this.plugins = {};
        }

        if ( EventEmitter ) AbstractRenderer.__proto__ = EventEmitter;
        AbstractRenderer.prototype = Object.create( EventEmitter && EventEmitter.prototype );
        AbstractRenderer.prototype.constructor = AbstractRenderer;

        var prototypeAccessors = { width: { configurable: true },height: { configurable: true },backgroundColor: { configurable: true } };

        /**
         * Initialize the plugins.
         *
         * @protected
         * @param {object} staticMap - The dictionary of statically saved plugins.
         */
        AbstractRenderer.prototype.initPlugins = function initPlugins (staticMap)
        {
            for (var o in staticMap)
            {
                this.plugins[o] = new (staticMap[o])(this);
            }
        };

        /**
         * Same as view.width, actual number of pixels in the canvas by horizontal.
         *
         * @member {number}
         * @readonly
         * @default 800
         */
        prototypeAccessors.width.get = function ()
        {
            return this.view.width;
        };

        /**
         * Same as view.height, actual number of pixels in the canvas by vertical.
         *
         * @member {number}
         * @readonly
         * @default 600
         */
        prototypeAccessors.height.get = function ()
        {
            return this.view.height;
        };

        /**
         * Resizes the screen and canvas to the specified width and height.
         * Canvas dimensions are multiplied by resolution.
         *
         * @param {number} screenWidth - The new width of the screen.
         * @param {number} screenHeight - The new height of the screen.
         */
        AbstractRenderer.prototype.resize = function resize (screenWidth, screenHeight)
        {
            this.screen.width = screenWidth;
            this.screen.height = screenHeight;

            this.view.width = screenWidth * this.resolution;
            this.view.height = screenHeight * this.resolution;

            if (this.autoDensity)
            {
                this.view.style.width = screenWidth + "px";
                this.view.style.height = screenHeight + "px";
            }
        };

        /**
         * Useful function that returns a texture of the display object that can then be used to create sprites
         * This can be quite useful if your displayObject is complicated and needs to be reused multiple times.
         *
         * @param {PIXI.DisplayObject} displayObject - The displayObject the object will be generated from.
         * @param {number} scaleMode - Should be one of the scaleMode consts.
         * @param {number} resolution - The resolution / device pixel ratio of the texture being generated.
         * @param {PIXI.Rectangle} [region] - The region of the displayObject, that shall be rendered,
         *        if no region is specified, defaults to the local bounds of the displayObject.
         * @return {PIXI.RenderTexture} A texture of the graphics object.
         */
        AbstractRenderer.prototype.generateTexture = function generateTexture (displayObject, scaleMode, resolution, region)
        {
            region = region || displayObject.getLocalBounds();

            // minimum texture size is 1x1, 0x0 will throw an error
            if (region.width === 0) { region.width = 1; }
            if (region.height === 0) { region.height = 1; }

            var renderTexture = RenderTexture.create(region.width | 0, region.height | 0, scaleMode, resolution);

            tempMatrix.tx = -region.x;
            tempMatrix.ty = -region.y;

            this.render(displayObject, renderTexture, false, tempMatrix, !!displayObject.parent);

            return renderTexture;
        };

        /**
         * Removes everything from the renderer and optionally removes the Canvas DOM element.
         *
         * @param {boolean} [removeView=false] - Removes the Canvas element from the DOM.
         */
        AbstractRenderer.prototype.destroy = function destroy (removeView)
        {
            for (var o in this.plugins)
            {
                this.plugins[o].destroy();
                this.plugins[o] = null;
            }

            if (removeView && this.view.parentNode)
            {
                this.view.parentNode.removeChild(this.view);
            }

            this.plugins = null;

            this.type = constants.RENDERER_TYPE.UNKNOWN;

            this.view = null;

            this.screen = null;

            this.resolution = 0;

            this.transparent = false;

            this.autoDensity = false;

            this.blendModes = null;

            this.options = null;

            this.preserveDrawingBuffer = false;
            this.clearBeforeRender = false;

            this._backgroundColor = 0;
            this._backgroundColorRgba = null;
            this._backgroundColorString = null;

            this._tempDisplayObjectParent = null;
            this._lastObjectRendered = null;
        };

        /**
         * The background color to fill if not transparent
         *
         * @member {number}
         */
        prototypeAccessors.backgroundColor.get = function ()
        {
            return this._backgroundColor;
        };

        prototypeAccessors.backgroundColor.set = function (value) // eslint-disable-line require-jsdoc
        {
            this._backgroundColor = value;
            this._backgroundColorString = utils.hex2string(value);
            utils.hex2rgb(value, this._backgroundColorRgba);
        };

        Object.defineProperties( AbstractRenderer.prototype, prototypeAccessors );

        return AbstractRenderer;
    }(utils.EventEmitter));

    /**
     * The Renderer draws the scene and all its content onto a WebGL enabled canvas.
     *
     * This renderer should be used for browsers that support WebGL.
     *
     * This renderer works by automatically managing WebGLBatchesm, so no need for Sprite Batches or Sprite Clouds.
     * Don't forget to add the view to your DOM or you will not see anything!
     *
     * @class
     * @memberof PIXI
     * @extends PIXI.AbstractRenderer
     */
    var Renderer = /*@__PURE__*/(function (AbstractRenderer) {
        function Renderer(options)
        {
            if ( options === void 0 ) options = {};

            AbstractRenderer.call(this, 'WebGL', options);

            // the options will have been modified here in the super constructor with pixi's default settings..
            options = this.options;

            /**
             * The type of this renderer as a standardized const
             *
             * @member {number}
             * @see PIXI.RENDERER_TYPE
             */
            this.type = constants.RENDERER_TYPE.WEBGL;

            /**
             * WebGL context, set by the contextSystem (this.context)
             *
             * @readonly
             * @member {WebGLRenderingContext}
             */
            this.gl = null;

            this.CONTEXT_UID = 0;

            // TODO legacy!

            /**
             * Internal signal instances of **runner**, these
             * are assigned to each system created.
             * @see PIXI.Runner
             * @name PIXI.Renderer#runners
             * @private
             * @type {object}
             * @readonly
             * @property {PIXI.Runner} destroy - Destroy runner
             * @property {PIXI.Runner} contextChange - Context change runner
             * @property {PIXI.Runner} reset - Reset runner
             * @property {PIXI.Runner} update - Update runner
             * @property {PIXI.Runner} postrender - Post-render runner
             * @property {PIXI.Runner} prerender - Pre-render runner
             * @property {PIXI.Runner} resize - Resize runner
             */
            this.runners = {
                destroy: new runner.Runner('destroy'),
                contextChange: new runner.Runner('contextChange', 1),
                reset: new runner.Runner('reset'),
                update: new runner.Runner('update'),
                postrender: new runner.Runner('postrender'),
                prerender: new runner.Runner('prerender'),
                resize: new runner.Runner('resize', 2),
            };

            /**
             * Global uniforms
             * @member {PIXI.UniformGroup}
             */
            this.globalUniforms = new UniformGroup({
                projectionMatrix: new math.Matrix(),
            }, true);

            /**
             * Mask system instance
             * @member {PIXI.systems.MaskSystem} mask
             * @memberof PIXI.Renderer#
             * @readonly
             */
            this.addSystem(MaskSystem, 'mask')
                /**
                 * Context system instance
                 * @member {PIXI.systems.ContextSystem} context
                 * @memberof PIXI.Renderer#
                 * @readonly
                 */
                .addSystem(ContextSystem, 'context')
                /**
                 * State system instance
                 * @member {PIXI.systems.StateSystem} state
                 * @memberof PIXI.Renderer#
                 * @readonly
                 */
                .addSystem(StateSystem, 'state')
                /**
                 * Shader system instance
                 * @member {PIXI.systems.ShaderSystem} shader
                 * @memberof PIXI.Renderer#
                 * @readonly
                 */
                .addSystem(ShaderSystem, 'shader')
                /**
                 * Texture system instance
                 * @member {PIXI.systems.TextureSystem} texture
                 * @memberof PIXI.Renderer#
                 * @readonly
                 */
                .addSystem(TextureSystem, 'texture')
                /**
                 * Geometry system instance
                 * @member {PIXI.systems.GeometrySystem} geometry
                 * @memberof PIXI.Renderer#
                 * @readonly
                 */
                .addSystem(GeometrySystem, 'geometry')
                /**
                 * Framebuffer system instance
                 * @member {PIXI.systems.FramebufferSystem} framebuffer
                 * @memberof PIXI.Renderer#
                 * @readonly
                 */
                .addSystem(FramebufferSystem, 'framebuffer')
                /**
                 * Scissor system instance
                 * @member {PIXI.systems.ScissorSystem} scissor
                 * @memberof PIXI.Renderer#
                 * @readonly
                 */
                .addSystem(ScissorSystem, 'scissor')
                /**
                 * Stencil system instance
                 * @member {PIXI.systems.StencilSystem} stencil
                 * @memberof PIXI.Renderer#
                 * @readonly
                 */
                .addSystem(StencilSystem, 'stencil')
                /**
                 * Projection system instance
                 * @member {PIXI.systems.ProjectionSystem} projection
                 * @memberof PIXI.Renderer#
                 * @readonly
                 */
                .addSystem(ProjectionSystem, 'projection')
                /**
                 * Texture garbage collector system instance
                 * @member {PIXI.systems.TextureGCSystem} textureGC
                 * @memberof PIXI.Renderer#
                 * @readonly
                 */
                .addSystem(TextureGCSystem, 'textureGC')
                /**
                 * Filter system instance
                 * @member {PIXI.systems.FilterSystem} filter
                 * @memberof PIXI.Renderer#
                 * @readonly
                 */
                .addSystem(FilterSystem, 'filter')
                /**
                 * RenderTexture system instance
                 * @member {PIXI.systems.RenderTextureSystem} renderTexture
                 * @memberof PIXI.Renderer#
                 * @readonly
                 */
                .addSystem(RenderTextureSystem, 'renderTexture')

                /**
                 * Batch system instance
                 * @member {PIXI.systems.BatchSystem} batch
                 * @memberof PIXI.Renderer#
                 * @readonly
                 */
                .addSystem(BatchSystem, 'batch');

            this.initPlugins(Renderer.__plugins);

            /**
             * The options passed in to create a new WebGL context.
             */
            if (options.context)
            {
                this.context.initFromContext(options.context);
            }
            else
            {
                this.context.initFromOptions({
                    alpha: this.transparent,
                    antialias: options.antialias,
                    premultipliedAlpha: this.transparent && this.transparent !== 'notMultiplied',
                    stencil: true,
                    preserveDrawingBuffer: options.preserveDrawingBuffer,
                    powerPreference: this.options.powerPreference,
                });
            }

            /**
             * Flag if we are rendering to the screen vs renderTexture
             * @member {boolean}
             * @readonly
             * @default true
             */
            this.renderingToScreen = true;

            utils.sayHello(this.context.webGLVersion === 2 ? 'WebGL 2' : 'WebGL 1');

            this.resize(this.options.width, this.options.height);
        }

        if ( AbstractRenderer ) Renderer.__proto__ = AbstractRenderer;
        Renderer.prototype = Object.create( AbstractRenderer && AbstractRenderer.prototype );
        Renderer.prototype.constructor = Renderer;

        /**
         * Add a new system to the renderer.
         * @param {Function} ClassRef - Class reference
         * @param {string} [name] - Property name for system, if not specified
         *        will use a static `name` property on the class itself. This
         *        name will be assigned as s property on the Renderer so make
         *        sure it doesn't collide with properties on Renderer.
         * @return {PIXI.Renderer} Return instance of renderer
         */
        Renderer.create = function create (options)
        {
            if (utils.isWebGLSupported())
            {
                return new Renderer(options);
            }

            throw new Error('WebGL unsupported in this browser, use "pixi.js-legacy" for fallback canvas2d support.');
        };

        Renderer.prototype.addSystem = function addSystem (ClassRef, name)
        {
            if (!name)
            {
                name = ClassRef.name;
            }

            var system = new ClassRef(this);

            if (this[name])
            {
                throw new Error(("Whoops! The name \"" + name + "\" is already in use"));
            }

            this[name] = system;

            for (var i in this.runners)
            {
                this.runners[i].add(system);
            }

            /**
             * Fired after rendering finishes.
             *
             * @event PIXI.Renderer#postrender
             */

            /**
             * Fired before rendering starts.
             *
             * @event PIXI.Renderer#prerender
             */

            /**
             * Fired when the WebGL context is set.
             *
             * @event PIXI.Renderer#context
             * @param {WebGLRenderingContext} gl - WebGL context.
             */

            return this;
        };

        /**
         * Renders the object to its WebGL view
         *
         * @param {PIXI.DisplayObject} displayObject - The object to be rendered.
         * @param {PIXI.RenderTexture} [renderTexture] - The render texture to render to.
         * @param {boolean} [clear=true] - Should the canvas be cleared before the new render.
         * @param {PIXI.Matrix} [transform] - A transform to apply to the render texture before rendering.
         * @param {boolean} [skipUpdateTransform=false] - Should we skip the update transform pass?
         */
        Renderer.prototype.render = function render (displayObject, renderTexture, clear, transform, skipUpdateTransform)
        {
            // can be handy to know!
            this.renderingToScreen = !renderTexture;

            this.runners.prerender.run();
            this.emit('prerender');

            // apply a transform at a GPU level
            this.projection.transform = transform;

            // no point rendering if our context has been blown up!
            if (this.context.isLost)
            {
                return;
            }

            if (!renderTexture)
            {
                this._lastObjectRendered = displayObject;
            }

            if (!skipUpdateTransform)
            {
                // update the scene graph
                var cacheParent = displayObject.parent;

                displayObject.parent = this._tempDisplayObjectParent;
                displayObject.updateTransform();
                displayObject.parent = cacheParent;
                // displayObject.hitArea = //TODO add a temp hit area
            }

            this.renderTexture.bind(renderTexture);
            this.batch.currentRenderer.start();

            if (clear !== undefined ? clear : this.clearBeforeRender)
            {
                this.renderTexture.clear();
            }

            displayObject.render(this);

            // apply transform..
            this.batch.currentRenderer.flush();

            if (renderTexture)
            {
                renderTexture.baseTexture.update();
            }

            this.runners.postrender.run();

            // reset transform after render
            this.projection.transform = null;

            this.emit('postrender');
        };

        /**
         * Resizes the WebGL view to the specified width and height.
         *
         * @param {number} screenWidth - The new width of the screen.
         * @param {number} screenHeight - The new height of the screen.
         */
        Renderer.prototype.resize = function resize (screenWidth, screenHeight)
        {
            AbstractRenderer.prototype.resize.call(this, screenWidth, screenHeight);

            this.runners.resize.run(screenWidth, screenHeight);
        };

        /**
         * Resets the WebGL state so you can render things however you fancy!
         *
         * @return {PIXI.Renderer} Returns itself.
         */
        Renderer.prototype.reset = function reset ()
        {
            this.runners.reset.run();

            return this;
        };

        /**
         * Clear the frame buffer
         */
        Renderer.prototype.clear = function clear ()
        {
            this.framebuffer.bind();
            this.framebuffer.clear();
        };

        /**
         * Removes everything from the renderer (event listeners, spritebatch, etc...)
         *
         * @param {boolean} [removeView=false] - Removes the Canvas element from the DOM.
         *  See: https://github.com/pixijs/pixi.js/issues/2233
         */
        Renderer.prototype.destroy = function destroy (removeView)
        {
            this.runners.destroy.run();

            for (var r in this.runners)
            {
                this.runners[r].destroy();
            }

            // call base destroy
            AbstractRenderer.prototype.destroy.call(this, removeView);

            // TODO nullify all the managers..
            this.gl = null;
        };

        /**
         * Collection of installed plugins. These are included by default in PIXI, but can be excluded
         * by creating a custom build. Consult the README for more information about creating custom
         * builds and excluding plugins.
         * @name PIXI.Renderer#plugins
         * @type {object}
         * @readonly
         * @property {PIXI.accessibility.AccessibilityManager} accessibility Support tabbing interactive elements.
         * @property {PIXI.extract.Extract} extract Extract image data from renderer.
         * @property {PIXI.interaction.InteractionManager} interaction Handles mouse, touch and pointer events.
         * @property {PIXI.prepare.Prepare} prepare Pre-render display objects.
         */

        /**
         * Adds a plugin to the renderer.
         *
         * @method
         * @param {string} pluginName - The name of the plugin.
         * @param {Function} ctor - The constructor function or class for the plugin.
         */
        Renderer.registerPlugin = function registerPlugin (pluginName, ctor)
        {
            Renderer.__plugins = Renderer.__plugins || {};
            Renderer.__plugins[pluginName] = ctor;
        };

        return Renderer;
    }(AbstractRenderer));

    /**
     * This helper function will automatically detect which renderer you should be using.
     * WebGL is the preferred renderer as it is a lot faster. If WebGL is not supported by
     * the browser then this function will return a canvas renderer
     *
     * @memberof PIXI
     * @function autoDetectRenderer
     * @param {object} [options] - The optional renderer parameters
     * @param {number} [options.width=800] - the width of the renderers view
     * @param {number} [options.height=600] - the height of the renderers view
     * @param {HTMLCanvasElement} [options.view] - the canvas to use as a view, optional
     * @param {boolean} [options.transparent=false] - If the render view is transparent, default false
     * @param {boolean} [options.autoDensity=false] - Resizes renderer view in CSS pixels to allow for
     *   resolutions other than 1
     * @param {boolean} [options.antialias=false] - sets antialias
     * @param {boolean} [options.preserveDrawingBuffer=false] - enables drawing buffer preservation, enable this if you
     *  need to call toDataUrl on the webgl context
     * @param {number} [options.backgroundColor=0x000000] - The background color of the rendered area
     *  (shown if not transparent).
     * @param {boolean} [options.clearBeforeRender=true] - This sets if the renderer will clear the canvas or
     *   not before the new render pass.
     * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the renderer, retina would be 2
     * @param {boolean} [options.forceCanvas=false] - prevents selection of WebGL renderer, even if such is present, this
     *   option only is available when using **pixi.js-legacy** or **@pixi/canvas-renderer** modules, otherwise
     *   it is ignored.
     * @param {boolean} [options.forceFXAA=false] - forces FXAA antialiasing to be used over native.
     *  FXAA is faster, but may not always look as great **webgl only**
     * @param {string} [options.powerPreference] - Parameter passed to webgl context, set to "high-performance"
     *  for devices with dual graphics card **webgl only**
     * @return {PIXI.Renderer|PIXI.CanvasRenderer} Returns WebGL renderer if available, otherwise CanvasRenderer
     */
    function autoDetectRenderer(options)
    {
        return Renderer.create(options);
    }

    var _default = "attribute vec2 aVertexPosition;\r\nattribute vec2 aTextureCoord;\r\n\r\nuniform mat3 projectionMatrix;\r\n\r\nvarying vec2 vTextureCoord;\r\n\r\nvoid main(void)\r\n{\r\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\r\n    vTextureCoord = aTextureCoord;\r\n}";

    var defaultFilter = "attribute vec2 aVertexPosition;\r\n\r\nuniform mat3 projectionMatrix;\r\n\r\nvarying vec2 vTextureCoord;\r\n\r\nuniform vec4 inputSize;\r\nuniform vec4 outputFrame;\r\n\r\nvec4 filterVertexPosition( void )\r\n{\r\n    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;\r\n\r\n    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);\r\n}\r\n\r\nvec2 filterTextureCoord( void )\r\n{\r\n    return aVertexPosition * (outputFrame.zw * inputSize.zw);\r\n}\r\n\r\nvoid main(void)\r\n{\r\n    gl_Position = filterVertexPosition();\r\n    vTextureCoord = filterTextureCoord();\r\n}\r\n";

    /**
     * A Texture that depends on six other resources.
     *
     * @class
     * @extends PIXI.BaseTexture
     * @memberof PIXI
     */
    var CubeTexture = /*@__PURE__*/(function (BaseTexture) {
        function CubeTexture () {
            BaseTexture.apply(this, arguments);
        }

        if ( BaseTexture ) CubeTexture.__proto__ = BaseTexture;
        CubeTexture.prototype = Object.create( BaseTexture && BaseTexture.prototype );
        CubeTexture.prototype.constructor = CubeTexture;

        CubeTexture.from = function from (resources, options)
        {
            return new CubeTexture(new CubeResource(resources, options));
        };

        return CubeTexture;
    }(BaseTexture));

    /**
     * Used by the batcher to draw batches.
     * Each one of these contains all information required to draw a bound geometry.
     *
     * @class
     * @memberof PIXI
     */
    var BatchDrawCall = function BatchDrawCall()
    {
        this.texArray = null;
        this.blend = 0;
        this.type = constants.DRAW_MODES.TRIANGLES;

        this.start = 0;
        this.size = 0;

        /**
         * data for uniforms or custom webgl state
         * @member {object}
         */
        this.data = null;
    };

    /**
     * Used by the batcher to build texture batches.
     * Holds list of textures and their respective locations.
     *
     * @class
     * @memberof PIXI
     */
    var BatchTextureArray = function BatchTextureArray()
    {
        /**
         * inside textures array
         * @member {PIXI.BaseTexture[]}
         */
        this.elements = [];
        /**
         * Respective locations for textures
         * @member {number[]}
         */
        this.ids = [];
        /**
         * number of filled elements
         * @member {number}
         */
        this.count = 0;
    };

    BatchTextureArray.prototype.clear = function clear ()
    {
        for (var i = 0; i < this.count; i++)
        {
            this.elements[i] = null;
        }
        this.count = 0;
    };

    /**
     * Flexible wrapper around `ArrayBuffer` that also provides
     * typed array views on demand.
     *
     * @class
     * @memberof PIXI
     */
    var ViewableBuffer = function ViewableBuffer(size)
    {
        /**
         * Underlying `ArrayBuffer` that holds all the data
         * and is of capacity `size`.
         *
         * @member {ArrayBuffer}
         */
        this.rawBinaryData = new ArrayBuffer(size);

        /**
         * View on the raw binary data as a `Uint32Array`.
         *
         * @member {Uint32Array}
         */
        this.uint32View = new Uint32Array(this.rawBinaryData);

        /**
         * View on the raw binary data as a `Float32Array`.
         *
         * @member {Float32Array}
         */
        this.float32View = new Float32Array(this.rawBinaryData);
    };

    var prototypeAccessors$5 = { int8View: { configurable: true },uint8View: { configurable: true },int16View: { configurable: true },uint16View: { configurable: true },int32View: { configurable: true } };

    /**
     * View on the raw binary data as a `Int8Array`.
     *
     * @member {Int8Array}
     */
    prototypeAccessors$5.int8View.get = function ()
    {
        if (!this._int8View)
        {
            this._int8View = new Int8Array(this.rawBinaryData);
        }

        return this._int8View;
    };

    /**
     * View on the raw binary data as a `Uint8Array`.
     *
     * @member {Uint8Array}
     */
    prototypeAccessors$5.uint8View.get = function ()
    {
        if (!this._uint8View)
        {
            this._uint8View = new Uint8Array(this.rawBinaryData);
        }

        return this._uint8View;
    };

    /**
     * View on the raw binary data as a `Int16Array`.
     *
     * @member {Int16Array}
     */
    prototypeAccessors$5.int16View.get = function ()
    {
        if (!this._int16View)
        {
            this._int16View = new Int16Array(this.rawBinaryData);
        }

        return this._int16View;
    };

    /**
     * View on the raw binary data as a `Uint16Array`.
     *
     * @member {Uint16Array}
     */
    prototypeAccessors$5.uint16View.get = function ()
    {
        if (!this._uint16View)
        {
            this._uint16View = new Uint16Array(this.rawBinaryData);
        }

        return this._uint16View;
    };

    /**
     * View on the raw binary data as a `Int32Array`.
     *
     * @member {Int32Array}
     */
    prototypeAccessors$5.int32View.get = function ()
    {
        if (!this._int32View)
        {
            this._int32View = new Int32Array(this.rawBinaryData);
        }

        return this._int32View;
    };

    /**
     * Returns the view of the given type.
     *
     * @param {string} type - One of `int8`, `uint8`, `int16`,
     *`uint16`, `int32`, `uint32`, and `float32`.
     * @return {object} typed array of given type
     */
    ViewableBuffer.prototype.view = function view (type)
    {
        return this[(type + "View")];
    };

    /**
     * Destroys all buffer references. Do not use after calling
     * this.
     */
    ViewableBuffer.prototype.destroy = function destroy ()
    {
        this.rawBinaryData = null;
        this._int8View = null;
        this._uint8View = null;
        this._int16View = null;
        this._uint16View = null;
        this._int32View = null;
        this.uint32View = null;
        this.float32View = null;
    };

    ViewableBuffer.sizeOf = function sizeOf (type)
    {
        switch (type)
        {
            case 'int8':
            case 'uint8':
                return 1;
            case 'int16':
            case 'uint16':
                return 2;
            case 'int32':
            case 'uint32':
            case 'float32':
                return 4;
            default:
                throw new Error((type + " isn't a valid view type"));
        }
    };

    Object.defineProperties( ViewableBuffer.prototype, prototypeAccessors$5 );

    /**
     * Renderer dedicated to drawing and batching sprites.
     *
     * This is the default batch renderer. It buffers objects
     * with texture-based geometries and renders them in
     * batches. It uploads multiple textures to the GPU to
     * reduce to the number of draw calls.
     *
     * @class
     * @protected
     * @memberof PIXI
     * @extends PIXI.ObjectRenderer
     */
    var AbstractBatchRenderer = /*@__PURE__*/(function (ObjectRenderer) {
        function AbstractBatchRenderer(renderer)
        {
            ObjectRenderer.call(this, renderer);

            /**
             * This is used to generate a shader that can
             * color each vertex based on a `aTextureId`
             * attribute that points to an texture in `uSampler`.
             *
             * This enables the objects with different textures
             * to be drawn in the same draw call.
             *
             * You can customize your shader by creating your
             * custom shader generator.
             *
             * @member {PIXI.BatchShaderGenerator}
             * @protected
             */
            this.shaderGenerator = null;

            /**
             * The class that represents the geometry of objects
             * that are going to be batched with this.
             *
             * @member {object}
             * @default PIXI.BatchGeometry
             * @protected
             */
            this.geometryClass = null;

            /**
             * Size of data being buffered per vertex in the
             * attribute buffers (in floats). By default, the
             * batch-renderer plugin uses 6:
             *
             * | aVertexPosition | 2 |
             * |-----------------|---|
             * | aTextureCoords  | 2 |
             * | aColor          | 1 |
             * | aTextureId      | 1 |
             *
             * @member {number}
             * @readonly
             */
            this.vertexSize = null;

            /**
             * The WebGL state in which this renderer will work.
             *
             * @member {PIXI.State}
             * @readonly
             */
            this.state = State.for2d();

            /**
             * The number of bufferable objects before a flush
             * occurs automatically.
             *
             * @member {number}
             * @default settings.SPRITE_BATCH_SIZE * 4
             */
            this.size = settings.settings.SPRITE_BATCH_SIZE * 4;

            /**
             * Total count of all vertices used by the currently
             * buffered objects.
             *
             * @member {number}
             * @private
             */
            this._vertexCount = 0;

            /**
             * Total count of all indices used by the currently
             * buffered objects.
             *
             * @member {number}
             * @private
             */
            this._indexCount = 0;

            /**
             * Buffer of objects that are yet to be rendered.
             *
             * @member {PIXI.DisplayObject[]}
             * @private
             */
            this._bufferedElements = [];

            /**
             * Data for texture batch builder, helps to save a bit of CPU on a pass
             * @type {PIXI.BaseTexture[]}
             * @private
             */
            this._bufferedTextures = [];

            /**
             * Number of elements that are buffered and are
             * waiting to be flushed.
             *
             * @member {number}
             * @private
             */
            this._bufferSize = 0;

            /**
             * This shader is generated by `this.shaderGenerator`.
             *
             * It is generated specifically to handle the required
             * number of textures being batched together.
             *
             * @member {PIXI.Shader}
             * @protected
             */
            this._shader = null;

            /**
             * Pool of `this.geometryClass` geometry objects
             * that store buffers. They are used to pass data
             * to the shader on each draw call.
             *
             * These are never re-allocated again, unless a
             * context change occurs; however, the pool may
             * be expanded if required.
             *
             * @member {PIXI.Geometry[]}
             * @private
             * @see PIXI.AbstractBatchRenderer.contextChange
             */
            this._packedGeometries = [];

            /**
             * Size of `this._packedGeometries`. It can be expanded
             * if more than `this._packedGeometryPoolSize` flushes
             * occur in a single frame.
             *
             * @member {number}
             * @private
             */
            this._packedGeometryPoolSize = 2;

            /**
             * A flush may occur multiple times in a single
             * frame. On iOS devices or when
             * `settings.CAN_UPLOAD_SAME_BUFFER` is false, the
             * batch renderer does not upload data to the same
             * `WebGLBuffer` for performance reasons.
             *
             * This is the index into `packedGeometries` that points to
             * geometry holding the most recent buffers.
             *
             * @member {number}
             * @private
             */
            this._flushId = 0;

            /**
             * Pool of `ViewableBuffer` objects that are sorted in
             * order of increasing size. The flush method uses
             * the buffer with the least size above the amount
             * it requires. These are used for passing attributes.
             *
             * The first buffer has a size of 8; each subsequent
             * buffer has double capacity of its previous.
             *
             * @member {PIXI.ViewableBuffer[]}
             * @private
             * @see PIXI.AbstractBatchRenderer#getAttributeBuffer
             */
            this._aBuffers = {};

            /**
             * Pool of `Uint16Array` objects that are sorted in
             * order of increasing size. The flush method uses
             * the buffer with the least size above the amount
             * it requires. These are used for passing indices.
             *
             * The first buffer has a size of 12; each subsequent
             * buffer has double capacity of its previous.
             *
             * @member {Uint16Array[]}
             * @private
             * @see PIXI.AbstractBatchRenderer#getIndexBuffer
             */
            this._iBuffers = {};

            /**
             * Maximum number of textures that can be uploaded to
             * the GPU under the current context. It is initialized
             * properly in `this.contextChange`.
             *
             * @member {number}
             * @see PIXI.AbstractBatchRenderer#contextChange
             * @readonly
             */
            this.MAX_TEXTURES = 1;

            this.renderer.on('prerender', this.onPrerender, this);
            renderer.runners.contextChange.add(this);

            this._dcIndex = 0;
            this._aIndex = 0;
            this._iIndex = 0;
            this._attributeBuffer = null;
            this._indexBuffer = null;
            this._tempBoundTextures = [];
        }

        if ( ObjectRenderer ) AbstractBatchRenderer.__proto__ = ObjectRenderer;
        AbstractBatchRenderer.prototype = Object.create( ObjectRenderer && ObjectRenderer.prototype );
        AbstractBatchRenderer.prototype.constructor = AbstractBatchRenderer;

        /**
         * Handles the `contextChange` signal.
         *
         * It calculates `this.MAX_TEXTURES` and allocating the
         * packed-geometry object pool.
         */
        AbstractBatchRenderer.prototype.contextChange = function contextChange ()
        {
            var gl = this.renderer.gl;

            if (settings.settings.PREFER_ENV === constants.ENV.WEBGL_LEGACY)
            {
                this.MAX_TEXTURES = 1;
            }
            else
            {
                // step 1: first check max textures the GPU can handle.
                this.MAX_TEXTURES = Math.min(
                    gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
                    settings.settings.SPRITE_MAX_TEXTURES);

                // step 2: check the maximum number of if statements the shader can have too..
                this.MAX_TEXTURES = checkMaxIfStatementsInShader(
                    this.MAX_TEXTURES, gl);
            }

            this._shader = this.shaderGenerator.generateShader(this.MAX_TEXTURES);

            // we use the second shader as the first one depending on your browser
            // may omit aTextureId as it is not used by the shader so is optimized out.
            for (var i = 0; i < this._packedGeometryPoolSize; i++)
            {
                /* eslint-disable max-len */
                this._packedGeometries[i] = new (this.geometryClass)();
            }

            this.initFlushBuffers();
        };

        /**
         * Makes sure that static and dynamic flush pooled objects have correct dimensions
         */
        AbstractBatchRenderer.prototype.initFlushBuffers = function initFlushBuffers ()
        {
            var _drawCallPool = AbstractBatchRenderer._drawCallPool;
            var _textureArrayPool = AbstractBatchRenderer._textureArrayPool;
            // max draw calls
            var MAX_SPRITES = this.size / 4;
            // max texture arrays
            var MAX_TA = Math.floor(MAX_SPRITES / this.MAX_TEXTURES) + 1;

            while (_drawCallPool.length < MAX_SPRITES)
            {
                _drawCallPool.push(new BatchDrawCall());
            }
            while (_textureArrayPool.length < MAX_TA)
            {
                _textureArrayPool.push(new BatchTextureArray());
            }
            for (var i = 0; i < this.MAX_TEXTURES; i++)
            {
                this._tempBoundTextures[i] = null;
            }
        };

        /**
         * Handles the `prerender` signal.
         *
         * It ensures that flushes start from the first geometry
         * object again.
         */
        AbstractBatchRenderer.prototype.onPrerender = function onPrerender ()
        {
            this._flushId = 0;
        };

        /**
         * Buffers the "batchable" object. It need not be rendered
         * immediately.
         *
         * @param {PIXI.DisplayObject} element - the element to render when
         *    using this renderer
         */
        AbstractBatchRenderer.prototype.render = function render (element)
        {
            if (!element._texture.valid)
            {
                return;
            }

            if (this._vertexCount + (element.vertexData.length / 2) > this.size)
            {
                this.flush();
            }

            this._vertexCount += element.vertexData.length / 2;
            this._indexCount += element.indices.length;
            this._bufferedTextures[this._bufferSize] = element._texture.baseTexture;
            this._bufferedElements[this._bufferSize++] = element;
        };

        AbstractBatchRenderer.prototype.buildTexturesAndDrawCalls = function buildTexturesAndDrawCalls ()
        {
            var ref = this;
            var textures = ref._bufferedTextures;
            var MAX_TEXTURES = ref.MAX_TEXTURES;
            var textureArrays = AbstractBatchRenderer._textureArrayPool;
            var batch = this.renderer.batch;
            var boundTextures = this._tempBoundTextures;
            var touch = this.renderer.textureGC.count;

            var TICK = ++BaseTexture._globalBatch;
            var countTexArrays = 0;
            var texArray = textureArrays[0];
            var start = 0;

            batch.copyBoundTextures(boundTextures, MAX_TEXTURES);

            for (var i = 0; i < this._bufferSize; ++i)
            {
                var tex = textures[i];

                textures[i] = null;
                if (tex._batchEnabled === TICK)
                {
                    continue;
                }

                if (texArray.count >= MAX_TEXTURES)
                {
                    batch.boundArray(texArray, boundTextures, TICK, MAX_TEXTURES);
                    this.buildDrawCalls(texArray, start, i);
                    start = i;
                    texArray = textureArrays[++countTexArrays];
                    ++TICK;
                }

                tex._batchEnabled = TICK;
                tex.touched = touch;
                texArray.elements[texArray.count++] = tex;
            }

            if (texArray.count > 0)
            {
                batch.boundArray(texArray, boundTextures, TICK, MAX_TEXTURES);
                this.buildDrawCalls(texArray, start, this._bufferSize);
                ++countTexArrays;
                ++TICK;
            }

            // Clean-up

            for (var i$1 = 0; i$1 < boundTextures.length; i$1++)
            {
                boundTextures[i$1] = null;
            }
            BaseTexture._globalBatch = TICK;
        };

        /**
         * Populating drawcalls for rendering
         *
         * @param {PIXI.BatchTextureArray} texArray
         * @param {number} start
         * @param {number} finish
         */
        AbstractBatchRenderer.prototype.buildDrawCalls = function buildDrawCalls (texArray, start, finish)
        {
            var ref = this;
            var elements = ref._bufferedElements;
            var _attributeBuffer = ref._attributeBuffer;
            var _indexBuffer = ref._indexBuffer;
            var vertexSize = ref.vertexSize;
            var drawCalls = AbstractBatchRenderer._drawCallPool;

            var dcIndex = this._dcIndex;
            var aIndex = this._aIndex;
            var iIndex = this._iIndex;

            var drawCall = drawCalls[dcIndex];

            drawCall.start = this._iIndex;
            drawCall.texArray = texArray;

            for (var i = start; i < finish; ++i)
            {
                var sprite = elements[i];
                var tex = sprite._texture.baseTexture;
                var spriteBlendMode = utils.premultiplyBlendMode[
                    tex.alphaMode ? 1 : 0][sprite.blendMode];

                elements[i] = null;

                if (start < i && drawCall.blend !== spriteBlendMode)
                {
                    drawCall.size = iIndex - drawCall.start;
                    start = i;
                    drawCall = drawCalls[++dcIndex];
                    drawCall.texArray = texArray;
                    drawCall.start = iIndex;
                }

                this.packInterleavedGeometry(sprite, _attributeBuffer, _indexBuffer, aIndex, iIndex);
                aIndex += sprite.vertexData.length / 2 * vertexSize;
                iIndex += sprite.indices.length;

                drawCall.blend = spriteBlendMode;
            }

            if (start < finish)
            {
                drawCall.size = iIndex - drawCall.start;
                ++dcIndex;
            }

            this._dcIndex = dcIndex;
            this._aIndex = aIndex;
            this._iIndex = iIndex;
        };

        /**
         * Bind textures for current rendering
         *
         * @param {PIXI.BatchTextureArray} texArray
         */
        AbstractBatchRenderer.prototype.bindAndClearTexArray = function bindAndClearTexArray (texArray)
        {
            var textureSystem = this.renderer.texture;

            for (var j = 0; j < texArray.count; j++)
            {
                textureSystem.bind(texArray.elements[j], texArray.ids[j]);
                texArray.elements[j] = null;
            }
            texArray.count = 0;
        };

        AbstractBatchRenderer.prototype.updateGeometry = function updateGeometry ()
        {
            var ref = this;
            var packedGeometries = ref._packedGeometries;
            var attributeBuffer = ref._attributeBuffer;
            var indexBuffer = ref._indexBuffer;

            if (!settings.settings.CAN_UPLOAD_SAME_BUFFER)
            { /* Usually on iOS devices, where the browser doesn't
                like uploads to the same buffer in a single frame. */
                if (this._packedGeometryPoolSize <= this._flushId)
                {
                    this._packedGeometryPoolSize++;
                    packedGeometries[this._flushId] = new (this.geometryClass)();
                }

                packedGeometries[this._flushId]._buffer.update(attributeBuffer.rawBinaryData);
                packedGeometries[this._flushId]._indexBuffer.update(indexBuffer);

                this.renderer.geometry.bind(packedGeometries[this._flushId]);
                this.renderer.geometry.updateBuffers();
                this._flushId++;
            }
            else
            {
                // lets use the faster option, always use buffer number 0
                packedGeometries[this._flushId]._buffer.update(attributeBuffer.rawBinaryData);
                packedGeometries[this._flushId]._indexBuffer.update(indexBuffer);

                this.renderer.geometry.updateBuffers();
            }
        };

        AbstractBatchRenderer.prototype.drawBatches = function drawBatches ()
        {
            var dcCount = this._dcIndex;
            var ref = this.renderer;
            var gl = ref.gl;
            var stateSystem = ref.state;
            var drawCalls = AbstractBatchRenderer._drawCallPool;

            var curTexArray = null;

            // Upload textures and do the draw calls
            for (var i = 0; i < dcCount; i++)
            {
                var ref$1 = drawCalls[i];
                var texArray = ref$1.texArray;
                var type = ref$1.type;
                var size = ref$1.size;
                var start = ref$1.start;
                var blend = ref$1.blend;

                if (curTexArray !== texArray)
                {
                    curTexArray = texArray;
                    this.bindAndClearTexArray(texArray);
                }

                this.state.blendMode = blend;
                stateSystem.set(this.state);
                gl.drawElements(type, size, gl.UNSIGNED_SHORT, start * 2);
            }
        };

        /**
         * Renders the content _now_ and empties the current batch.
         */
        AbstractBatchRenderer.prototype.flush = function flush ()
        {
            if (this._vertexCount === 0)
            {
                return;
            }

            this._attributeBuffer = this.getAttributeBuffer(this._vertexCount);
            this._indexBuffer = this.getIndexBuffer(this._indexCount);
            this._aIndex = 0;
            this._iIndex = 0;
            this._dcIndex = 0;

            this.buildTexturesAndDrawCalls();
            this.updateGeometry();
            this.drawBatches();

            // reset elements buffer for the next flush
            this._bufferSize = 0;
            this._vertexCount = 0;
            this._indexCount = 0;
        };

        /**
         * Starts a new sprite batch.
         */
        AbstractBatchRenderer.prototype.start = function start ()
        {
            this.renderer.state.set(this.state);

            this.renderer.shader.bind(this._shader);

            if (settings.settings.CAN_UPLOAD_SAME_BUFFER)
            {
                // bind buffer #0, we don't need others
                this.renderer.geometry.bind(this._packedGeometries[this._flushId]);
            }
        };

        /**
         * Stops and flushes the current batch.
         */
        AbstractBatchRenderer.prototype.stop = function stop ()
        {
            this.flush();
        };

        /**
         * Destroys this `AbstractBatchRenderer`. It cannot be used again.
         */
        AbstractBatchRenderer.prototype.destroy = function destroy ()
        {
            for (var i = 0; i < this._packedGeometryPoolSize; i++)
            {
                if (this._packedGeometries[i])
                {
                    this._packedGeometries[i].destroy();
                }
            }

            this.renderer.off('prerender', this.onPrerender, this);

            this._aBuffers = null;
            this._iBuffers = null;
            this._packedGeometries = null;
            this._attributeBuffer = null;
            this._indexBuffer = null;

            if (this._shader)
            {
                this._shader.destroy();
                this._shader = null;
            }

            ObjectRenderer.prototype.destroy.call(this);
        };

        /**
         * Fetches an attribute buffer from `this._aBuffers` that
         * can hold atleast `size` floats.
         *
         * @param {number} size - minimum capacity required
         * @return {ViewableBuffer} - buffer than can hold atleast `size` floats
         * @private
         */
        AbstractBatchRenderer.prototype.getAttributeBuffer = function getAttributeBuffer (size)
        {
            // 8 vertices is enough for 2 quads
            var roundedP2 = utils.nextPow2(Math.ceil(size / 8));
            var roundedSizeIndex = utils.log2(roundedP2);
            var roundedSize = roundedP2 * 8;

            if (this._aBuffers.length <= roundedSizeIndex)
            {
                this._iBuffers.length = roundedSizeIndex + 1;
            }

            var buffer = this._aBuffers[roundedSize];

            if (!buffer)
            {
                this._aBuffers[roundedSize] = buffer = new ViewableBuffer(roundedSize * this.vertexSize * 4);
            }

            return buffer;
        };

        /**
         * Fetches an index buffer from `this._iBuffers` that can
         * has atleast `size` capacity.
         *
         * @param {number} size - minimum required capacity
         * @return {Uint16Array} - buffer that can fit `size`
         *    indices.
         * @private
         */
        AbstractBatchRenderer.prototype.getIndexBuffer = function getIndexBuffer (size)
        {
            // 12 indices is enough for 2 quads
            var roundedP2 = utils.nextPow2(Math.ceil(size / 12));
            var roundedSizeIndex = utils.log2(roundedP2);
            var roundedSize = roundedP2 * 12;

            if (this._iBuffers.length <= roundedSizeIndex)
            {
                this._iBuffers.length = roundedSizeIndex + 1;
            }

            var buffer = this._iBuffers[roundedSizeIndex];

            if (!buffer)
            {
                this._iBuffers[roundedSizeIndex] = buffer = new Uint16Array(roundedSize);
            }

            return buffer;
        };

        /**
         * Takes the four batching parameters of `element`, interleaves
         * and pushes them into the batching attribute/index buffers given.
         *
         * It uses these properties: `vertexData` `uvs`, `textureId` and
         * `indicies`. It also uses the "tint" of the base-texture, if
         * present.
         *
         * @param {PIXI.Sprite} element - element being rendered
         * @param {PIXI.ViewableBuffer} attributeBuffer - attribute buffer.
         * @param {Uint16Array} indexBuffer - index buffer
         * @param {number} aIndex - number of floats already in the attribute buffer
         * @param {number} iIndex - number of indices already in `indexBuffer`
         */
        AbstractBatchRenderer.prototype.packInterleavedGeometry = function packInterleavedGeometry (element, attributeBuffer, indexBuffer, aIndex, iIndex)
        {
            var uint32View = attributeBuffer.uint32View;
            var float32View = attributeBuffer.float32View;

            var packedVertices = aIndex / this.vertexSize;
            var uvs = element.uvs;
            var indicies = element.indices;
            var vertexData = element.vertexData;
            var textureId = element._texture.baseTexture._batchLocation;

            var alpha = Math.min(element.worldAlpha, 1.0);
            var argb = (alpha < 1.0
                && element._texture.baseTexture.alphaMode)
                ? utils.premultiplyTint(element._tintRGB, alpha)
                : element._tintRGB + (alpha * 255 << 24);

            // lets not worry about tint! for now..
            for (var i = 0; i < vertexData.length; i += 2)
            {
                float32View[aIndex++] = vertexData[i];
                float32View[aIndex++] = vertexData[i + 1];
                float32View[aIndex++] = element.z || 0;
                float32View[aIndex++] = uvs[i];
                float32View[aIndex++] = uvs[i + 1];
                uint32View[aIndex++] = argb;
                float32View[aIndex++] = textureId;
            }

            for (var i$1 = 0; i$1 < indicies.length; i$1++)
            {
                indexBuffer[iIndex++] = packedVertices + indicies[i$1];
            }
        };

        return AbstractBatchRenderer;
    }(ObjectRenderer));

    /**
     * Pool of `BatchDrawCall` objects that `flush` used
     * to create "batches" of the objects being rendered.
     *
     * These are never re-allocated again.
     * Shared between all batch renderers because it can be only one "flush" working at the moment.
     *
     * @static
     * @member {PIXI.BatchDrawCall[]}
     */
    AbstractBatchRenderer._drawCallPool = [];

    /**
     * Pool of `BatchDrawCall` objects that `flush` used
     * to create "batches" of the objects being rendered.
     *
     * These are never re-allocated again.
     * Shared between all batch renderers because it can be only one "flush" working at the moment.
     *
     * @static
     * @member {PIXI.BatchTextureArray[]}
     */
    AbstractBatchRenderer._textureArrayPool = [];

    /**
     * Helper that generates batching multi-texture shader. Use it with your new BatchRenderer
     *
     * @class
     * @memberof PIXI
     */
    var BatchShaderGenerator = function BatchShaderGenerator(vertexSrc, fragTemplate)
    {
        /**
         * Reference to the vertex shader source.
         *
         * @member {string}
         */
        this.vertexSrc = vertexSrc;

        /**
         * Reference to the fragement shader template. Must contain "%count%" and "%forloop%".
         *
         * @member {string}
         */
        this.fragTemplate = fragTemplate;

        this.programCache = {};
        this.defaultGroupCache = {};

        if (fragTemplate.indexOf('%count%') < 0)
        {
            throw new Error('Fragment template must contain "%count%".');
        }

        if (fragTemplate.indexOf('%forloop%') < 0)
        {
            throw new Error('Fragment template must contain "%forloop%".');
        }
    };

    BatchShaderGenerator.prototype.generateShader = function generateShader (maxTextures)
    {
        if (!this.programCache[maxTextures])
        {
            var sampleValues = new Int32Array(maxTextures);

            for (var i = 0; i < maxTextures; i++)
            {
                sampleValues[i] = i;
            }

            this.defaultGroupCache[maxTextures] = UniformGroup.from({ uSamplers: sampleValues }, true);

            var fragmentSrc = this.fragTemplate;

            fragmentSrc = fragmentSrc.replace(/%count%/gi, ("" + maxTextures));
            fragmentSrc = fragmentSrc.replace(/%forloop%/gi, this.generateSampleSrc(maxTextures));

            this.programCache[maxTextures] = new Program(this.vertexSrc, fragmentSrc);
        }

        var uniforms = {
            tint: new Float32Array([1, 1, 1, 1]),
            translationMatrix: new math.Matrix(),
            default: this.defaultGroupCache[maxTextures],
        };

        return new Shader(this.programCache[maxTextures], uniforms);
    };

    BatchShaderGenerator.prototype.generateSampleSrc = function generateSampleSrc (maxTextures)
    {
        var src = '';

        src += '\n';
        src += '\n';

        for (var i = 0; i < maxTextures; i++)
        {
            if (i > 0)
            {
                src += '\nelse ';
            }

            if (i < maxTextures - 1)
            {
                src += "if(vTextureId < " + i + ".5)";
            }

            src += '\n{';
            src += "\n\tcolor = texture2D(uSamplers[" + i + "], vTextureCoord);";
            src += '\n}';
        }

        src += '\n';
        src += '\n';

        return src;
    };

    /**
     * Geometry used to batch standard PIXI content (e.g. Mesh, Sprite, Graphics objects).
     *
     * @class
     * @memberof PIXI
     */
    var BatchGeometry = /*@__PURE__*/(function (Geometry) {
        function BatchGeometry(_static)
        {
            if ( _static === void 0 ) _static = false;

            Geometry.call(this);

            /**
             * Buffer used for position, color, texture IDs
             *
             * @member {PIXI.Buffer}
             * @protected
             */
            this._buffer = new Buffer(null, _static, false);

            /**
             * Index buffer data
             *
             * @member {PIXI.Buffer}
             * @protected
             */
            this._indexBuffer = new Buffer(null, _static, true);

            this.addAttribute('aVertexPosition', this._buffer, 3, false, constants.TYPES.FLOAT)
                .addAttribute('aTextureCoord', this._buffer, 2, false, constants.TYPES.FLOAT)
                .addAttribute('aColor', this._buffer, 4, true, constants.TYPES.UNSIGNED_BYTE)
                .addAttribute('aTextureId', this._buffer, 1, true, constants.TYPES.FLOAT)
                .addIndex(this._indexBuffer);
        }

        if ( Geometry ) BatchGeometry.__proto__ = Geometry;
        BatchGeometry.prototype = Object.create( Geometry && Geometry.prototype );
        BatchGeometry.prototype.constructor = BatchGeometry;

        return BatchGeometry;
    }(Geometry));

    var defaultVertex$2 = "precision highp float;\nattribute vec3 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\nattribute float aTextureId;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\nuniform vec4 tint;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying float vTextureId;\n\nvoid main(void){\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition.xy, 1.0)).xy, aVertexPosition.z, 1.0);\n\n    vTextureCoord = aTextureCoord;\n    vTextureId = aTextureId;\n    vColor = aColor * tint;\n}\n";

    var defaultFragment$2 = "varying vec2 vTextureCoord;\r\nvarying vec4 vColor;\r\nvarying float vTextureId;\r\nuniform sampler2D uSamplers[%count%];\r\n\r\nvoid main(void){\r\n    vec4 color;\r\n    %forloop%\r\n    gl_FragColor = color * vColor;\r\n}\r\n";

    /**
     * @class
     * @memberof PIXI
     * @hideconstructor
     */
    var BatchPluginFactory = function BatchPluginFactory () {};

    var staticAccessors$1 = { defaultVertexSrc: { configurable: true },defaultFragmentTemplate: { configurable: true } };

    BatchPluginFactory.create = function create (options)
    {
        var ref = Object.assign({
            vertex: defaultVertex$2,
            fragment: defaultFragment$2,
            geometryClass: BatchGeometry,
            vertexSize: 7,
        }, options);
            var vertex = ref.vertex;
            var fragment = ref.fragment;
            var vertexSize = ref.vertexSize;
            var geometryClass = ref.geometryClass;

        return /*@__PURE__*/(function (AbstractBatchRenderer) {
                function BatchPlugin(renderer)
            {
                AbstractBatchRenderer.call(this, renderer);

                this.shaderGenerator = new BatchShaderGenerator(vertex, fragment);
                this.geometryClass = geometryClass;
                this.vertexSize = vertexSize;
            }

                if ( AbstractBatchRenderer ) BatchPlugin.__proto__ = AbstractBatchRenderer;
                BatchPlugin.prototype = Object.create( AbstractBatchRenderer && AbstractBatchRenderer.prototype );
                BatchPlugin.prototype.constructor = BatchPlugin;

                return BatchPlugin;
            }(AbstractBatchRenderer));
    };

    /**
     * The default vertex shader source
     *
     * @static
     * @type {string}
     * @constant
     */
    staticAccessors$1.defaultVertexSrc.get = function ()
    {
        return defaultVertex$2;
    };

    /**
     * The default fragment shader source
     *
     * @static
     * @type {string}
     * @constant
     */
    staticAccessors$1.defaultFragmentTemplate.get = function ()
    {
        return defaultFragment$2;
    };

    Object.defineProperties( BatchPluginFactory, staticAccessors$1 );

    // Setup the default BatchRenderer plugin, this is what
    // we'll actually export at the root level
    var BatchRenderer = BatchPluginFactory.create();

    exports.AbstractBatchRenderer = AbstractBatchRenderer;
    exports.AbstractRenderer = AbstractRenderer;
    exports.Attribute = Attribute;
    exports.BaseRenderTexture = BaseRenderTexture;
    exports.BaseTexture = BaseTexture;
    exports.BatchDrawCall = BatchDrawCall;
    exports.BatchGeometry = BatchGeometry;
    exports.BatchPluginFactory = BatchPluginFactory;
    exports.BatchRenderer = BatchRenderer;
    exports.BatchShaderGenerator = BatchShaderGenerator;
    exports.BatchTextureArray = BatchTextureArray;
    exports.Buffer = Buffer;
    exports.CubeTexture = CubeTexture;
    exports.Filter = Filter;
    exports.Framebuffer = Framebuffer;
    exports.GLProgram = GLProgram;
    exports.GLTexture = GLTexture;
    exports.Geometry = Geometry;
    exports.MaskData = MaskData;
    exports.ObjectRenderer = ObjectRenderer;
    exports.Program = Program;
    exports.Quad = Quad;
    exports.QuadUv = QuadUv;
    exports.RenderTexture = RenderTexture;
    exports.RenderTexturePool = RenderTexturePool;
    exports.Renderer = Renderer;
    exports.Shader = Shader;
    exports.SpriteMaskFilter = SpriteMaskFilter;
    exports.State = State;
    exports.System = System;
    exports.Texture = Texture;
    exports.TextureMatrix = TextureMatrix;
    exports.TextureUvs = TextureUvs;
    exports.UniformGroup = UniformGroup;
    exports.ViewableBuffer = ViewableBuffer;
    exports.autoDetectRenderer = autoDetectRenderer;
    exports.checkMaxIfStatementsInShader = checkMaxIfStatementsInShader;
    exports.defaultFilterVertex = defaultFilter;
    exports.defaultVertex = _default;
    exports.resources = index;
    exports.systems = systems;

    return exports;

}({}, PIXI, PIXI.utils, PIXI, PIXI, PIXI, PIXI, PIXI));
Object.assign(this.PIXI, _pixi_core);
//# sourceMappingURL=core.js.map
