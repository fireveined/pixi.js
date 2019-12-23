/*!
 * @pixi/text-bitmap - v5.2.0
 * Compiled Mon, 23 Dec 2019 12:37:54 UTC
 *
 * @pixi/text-bitmap is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@pixi/core');
var display = require('@pixi/display');
var math = require('@pixi/math');
var settings = require('@pixi/settings');
var sprite = require('@pixi/sprite');
var utils = require('@pixi/utils');
var loaders = require('@pixi/loaders');

/**
 * A BitmapText object will create a line or multiple lines of text using bitmap font.
 *
 * The primary advantage of this class over Text is that all of your textures are pre-generated and loading,
 * meaning that rendering is fast, and changing text has no performance implications.
 *
 * The primary disadvantage is that you need to preload the bitmap font assets, and thus the styling is set in stone.
 * Supporting character sets other than latin, such as CJK languages, may be impractical due to the number of characters.
 *
 * To split a line you can use '\n', '\r' or '\r\n' in your string.
 *
 * You can generate the fnt files using
 * http://www.angelcode.com/products/bmfont/ for Windows or
 * http://www.bmglyph.com/ for Mac.
 *
 * A BitmapText can only be created when the font is loaded.
 *
 * ```js
 * // in this case the font is in a file called 'desyrel.fnt'
 * let bitmapText = new PIXI.BitmapText("text using a fancy font!", {font: "35px Desyrel", align: "right"});
 * ```
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
var BitmapText = /*@__PURE__*/(function (Container) {
    function BitmapText(text, style)
    {
        var this$1 = this;
        if ( style === void 0 ) style = {};

        Container.call(this);

        /**
         * Private tracker for the width of the overall text
         *
         * @member {number}
         * @private
         */
        this._textWidth = 0;

        /**
         * Private tracker for the height of the overall text
         *
         * @member {number}
         * @private
         */
        this._textHeight = 0;

        /**
         * Private tracker for the letter sprite pool.
         *
         * @member {PIXI.Sprite[]}
         * @private
         */
        this._glyphs = [];

        /**
         * Private tracker for the current style.
         *
         * @member {object}
         * @private
         */
        this._font = {
            tint: style.tint !== undefined ? style.tint : 0xFFFFFF,
            align: style.align || 'left',
            name: null,
            size: 0,
        };

        /**
         * Private tracker for the current font.
         *
         * @member {object}
         * @private
         */
        this.font = style.font; // run font setter

        /**
         * Private tracker for the current text.
         *
         * @member {string}
         * @private
         */
        this._text = text;

        /**
         * The max width of this bitmap text in pixels. If the text provided is longer than the
         * value provided, line breaks will be automatically inserted in the last whitespace.
         * Disable by setting value to 0
         *
         * @member {number}
         * @private
         */
        this._maxWidth = 0;

        /**
         * The max line height. This is useful when trying to use the total height of the Text,
         * ie: when trying to vertically align.
         *
         * @member {number}
         * @private
         */
        this._maxLineHeight = 0;

        /**
         * Letter spacing. This is useful for setting the space between characters.
         * @member {number}
         * @private
         */
        this._letterSpacing = 0;

        /**
         * Text anchor. read-only
         *
         * @member {PIXI.ObservablePoint}
         * @private
         */
        this._anchor = new math.ObservablePoint(function () { this$1.dirty = true; }, this, 0, 0);

        /**
         * The dirty state of this object.
         *
         * @member {boolean}
         */
        this.dirty = false;

        /**
         * If true PixiJS will Math.floor() x/y values when rendering, stopping pixel interpolation.
         * Advantages can include sharper image quality (like text) and faster rendering on canvas.
         * The main disadvantage is movement of objects may appear less smooth.
         * To set the global default, change {@link PIXI.settings.ROUND_PIXELS}
         *
         * @member {boolean}
         * @default false
         */
        this.roundPixels = settings.settings.ROUND_PIXELS;

        this.updateText();
    }

    if ( Container ) BitmapText.__proto__ = Container;
    BitmapText.prototype = Object.create( Container && Container.prototype );
    BitmapText.prototype.constructor = BitmapText;

    var prototypeAccessors = { tint: { configurable: true },align: { configurable: true },anchor: { configurable: true },font: { configurable: true },text: { configurable: true },maxWidth: { configurable: true },maxLineHeight: { configurable: true },textWidth: { configurable: true },letterSpacing: { configurable: true },textHeight: { configurable: true } };

    /**
     * Renders text and updates it when needed
     *
     * @private
     */
    BitmapText.prototype.updateText = function updateText ()
    {
        var data = BitmapText.fonts[this._font.name];
        var scale = this._font.size / data.size;
        var pos = new math.Point();
        var chars = [];
        var lineWidths = [];
        var text = this._text.replace(/(?:\r\n|\r)/g, '\n') || ' ';
        var textLength = text.length;
        var maxWidth = this._maxWidth * data.size / this._font.size;

        var prevCharCode = null;
        var lastLineWidth = 0;
        var maxLineWidth = 0;
        var line = 0;
        var lastBreakPos = -1;
        var lastBreakWidth = 0;
        var spacesRemoved = 0;
        var maxLineHeight = 0;

        for (var i = 0; i < textLength; i++)
        {
            var charCode = text.charCodeAt(i);
            var char = text.charAt(i);

            if ((/(?:\s)/).test(char))
            {
                lastBreakPos = i;
                lastBreakWidth = lastLineWidth;
            }

            if (char === '\r' || char === '\n')
            {
                lineWidths.push(lastLineWidth);
                maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
                ++line;
                ++spacesRemoved;

                pos.x = 0;
                pos.y += data.lineHeight;
                prevCharCode = null;
                continue;
            }

            var charData = data.chars[charCode];

            if (!charData)
            {
                continue;
            }

            if (prevCharCode && charData.kerning[prevCharCode])
            {
                pos.x += charData.kerning[prevCharCode];
            }

            chars.push({
                texture: charData.texture,
                line: line,
                charCode: charCode,
                position: new math.Point(pos.x + charData.xOffset + (this._letterSpacing / 2), pos.y + charData.yOffset),
            });
            pos.x += charData.xAdvance + this._letterSpacing;
            lastLineWidth = pos.x;
            maxLineHeight = Math.max(maxLineHeight, (charData.yOffset + charData.texture.height));
            prevCharCode = charCode;

            if (lastBreakPos !== -1 && maxWidth > 0 && pos.x > maxWidth)
            {
                ++spacesRemoved;
                utils.removeItems(chars, 1 + lastBreakPos - spacesRemoved, 1 + i - lastBreakPos);
                i = lastBreakPos;
                lastBreakPos = -1;

                lineWidths.push(lastBreakWidth);
                maxLineWidth = Math.max(maxLineWidth, lastBreakWidth);
                line++;

                pos.x = 0;
                pos.y += data.lineHeight;
                prevCharCode = null;
            }
        }

        var lastChar = text.charAt(text.length - 1);

        if (lastChar !== '\r' && lastChar !== '\n')
        {
            if ((/(?:\s)/).test(lastChar))
            {
                lastLineWidth = lastBreakWidth;
            }

            lineWidths.push(lastLineWidth);
            maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
        }

        var lineAlignOffsets = [];

        for (var i$1 = 0; i$1 <= line; i$1++)
        {
            var alignOffset = 0;

            if (this._font.align === 'right')
            {
                alignOffset = maxLineWidth - lineWidths[i$1];
            }
            else if (this._font.align === 'center')
            {
                alignOffset = (maxLineWidth - lineWidths[i$1]) / 2;
            }

            lineAlignOffsets.push(alignOffset);
        }

        var lenChars = chars.length;
        var tint = this.tint;

        for (var i$2 = 0; i$2 < lenChars; i$2++)
        {
            var c = this._glyphs[i$2]; // get the next glyph sprite

            if (c)
            {
                c.texture = chars[i$2].texture;
            }
            else
            {
                c = new sprite.Sprite(chars[i$2].texture);
                c.roundPixels = this.roundPixels;
                this._glyphs.push(c);
            }

            c.position.x = (chars[i$2].position.x + lineAlignOffsets[chars[i$2].line]) * scale;
            c.position.y = chars[i$2].position.y * scale;
            c.scale.x = c.scale.y = scale;
            c.tint = tint;

            if (!c.parent)
            {
                this.addChild(c);
            }
        }

        // remove unnecessary children.
        for (var i$3 = lenChars; i$3 < this._glyphs.length; ++i$3)
        {
            this.removeChild(this._glyphs[i$3]);
        }

        this._textWidth = maxLineWidth * scale;
        this._textHeight = (pos.y + data.lineHeight) * scale;

        // apply anchor
        if (this.anchor.x !== 0 || this.anchor.y !== 0)
        {
            for (var i$4 = 0; i$4 < lenChars; i$4++)
            {
                this._glyphs[i$4].x -= this._textWidth * this.anchor.x;
                this._glyphs[i$4].y -= this._textHeight * this.anchor.y;
            }
        }
        this._maxLineHeight = maxLineHeight * scale;
    };

    /**
     * Updates the transform of this object
     *
     * @private
     */
    BitmapText.prototype.updateTransform = function updateTransform ()
    {
        this.validate();
        this.containerUpdateTransform();
    };

    /**
     * Validates text before calling parent's getLocalBounds
     *
     * @return {PIXI.Rectangle} The rectangular bounding area
     */
    BitmapText.prototype.getLocalBounds = function getLocalBounds ()
    {
        this.validate();

        return Container.prototype.getLocalBounds.call(this);
    };

    /**
     * Updates text when needed
     *
     * @private
     */
    BitmapText.prototype.validate = function validate ()
    {
        if (this.dirty)
        {
            this.updateText();
            this.dirty = false;
        }
    };

    /**
     * The tint of the BitmapText object.
     *
     * @member {number}
     */
    prototypeAccessors.tint.get = function ()
    {
        return this._font.tint;
    };

    prototypeAccessors.tint.set = function (value) // eslint-disable-line require-jsdoc
    {
        this._font.tint = (typeof value === 'number' && value >= 0) ? value : 0xFFFFFF;

        this.dirty = true;
    };

    /**
     * The alignment of the BitmapText object.
     *
     * @member {string}
     * @default 'left'
     */
    prototypeAccessors.align.get = function ()
    {
        return this._font.align;
    };

    prototypeAccessors.align.set = function (value) // eslint-disable-line require-jsdoc
    {
        this._font.align = value || 'left';

        this.dirty = true;
    };

    /**
     * The anchor sets the origin point of the text.
     *
     * The default is `(0,0)`, this means the text's origin is the top left.
     *
     * Setting the anchor to `(0.5,0.5)` means the text's origin is centered.
     *
     * Setting the anchor to `(1,1)` would mean the text's origin point will be the bottom right corner.
     *
     * @member {PIXI.Point | number}
     */
    prototypeAccessors.anchor.get = function ()
    {
        return this._anchor;
    };

    prototypeAccessors.anchor.set = function (value) // eslint-disable-line require-jsdoc
    {
        if (typeof value === 'number')
        {
            this._anchor.set(value);
        }
        else
        {
            this._anchor.copyFrom(value);
        }
    };

    /**
     * The font descriptor of the BitmapText object.
     *
     * @member {object}
     */
    prototypeAccessors.font.get = function ()
    {
        return this._font;
    };

    prototypeAccessors.font.set = function (value) // eslint-disable-line require-jsdoc
    {
        if (!value)
        {
            return;
        }

        if (typeof value === 'string')
        {
            value = value.split(' ');

            this._font.name = value.length === 1 ? value[0] : value.slice(1).join(' ');
            this._font.size = value.length >= 2 ? parseInt(value[0], 10) : BitmapText.fonts[this._font.name].size;
        }
        else
        {
            this._font.name = value.name;
            this._font.size = typeof value.size === 'number' ? value.size : parseInt(value.size, 10);
        }

        this.dirty = true;
    };

    /**
     * The text of the BitmapText object.
     *
     * @member {string}
     */
    prototypeAccessors.text.get = function ()
    {
        return this._text;
    };

    prototypeAccessors.text.set = function (text) // eslint-disable-line require-jsdoc
    {
        text = String(text === null || text === undefined ? '' : text);

        if (this._text === text)
        {
            return;
        }
        this._text = text;
        this.dirty = true;
    };

    /**
     * The max width of this bitmap text in pixels. If the text provided is longer than the
     * value provided, line breaks will be automatically inserted in the last whitespace.
     * Disable by setting the value to 0.
     *
     * @member {number}
     */
    prototypeAccessors.maxWidth.get = function ()
    {
        return this._maxWidth;
    };

    prototypeAccessors.maxWidth.set = function (value) // eslint-disable-line require-jsdoc
    {
        if (this._maxWidth === value)
        {
            return;
        }
        this._maxWidth = value;
        this.dirty = true;
    };

    /**
     * The max line height. This is useful when trying to use the total height of the Text,
     * i.e. when trying to vertically align.
     *
     * @member {number}
     * @readonly
     */
    prototypeAccessors.maxLineHeight.get = function ()
    {
        this.validate();

        return this._maxLineHeight;
    };

    /**
     * The width of the overall text, different from fontSize,
     * which is defined in the style object.
     *
     * @member {number}
     * @readonly
     */
    prototypeAccessors.textWidth.get = function ()
    {
        this.validate();

        return this._textWidth;
    };

    /**
     * Additional space between characters.
     *
     * @member {number}
     */
    prototypeAccessors.letterSpacing.get = function ()
    {
        return this._letterSpacing;
    };

    prototypeAccessors.letterSpacing.set = function (value) // eslint-disable-line require-jsdoc
    {
        if (this._letterSpacing !== value)
        {
            this._letterSpacing = value;
            this.dirty = true;
        }
    };

    /**
     * The height of the overall text, different from fontSize,
     * which is defined in the style object.
     *
     * @member {number}
     * @readonly
     */
    prototypeAccessors.textHeight.get = function ()
    {
        this.validate();

        return this._textHeight;
    };

    /**
     * Register a bitmap font with data and a texture.
     *
     * @static
     * @param {XMLDocument} xml - The XML document data.
     * @param {Object.<string, PIXI.Texture>|PIXI.Texture|PIXI.Texture[]} textures - List of textures for each page.
     *  If providing an object, the key is the `<page>` element's `file` attribute in the FNT file.
     * @return {Object} Result font object with font, size, lineHeight and char fields.
     */
    BitmapText.registerFont = function registerFont (xml, textures)
    {
        var data = {};
        var info = xml.getElementsByTagName('info')[0];
        var common = xml.getElementsByTagName('common')[0];
        var pages = xml.getElementsByTagName('page');
        var res = utils.getResolutionOfUrl(pages[0].getAttribute('file'), settings.settings.RESOLUTION);
        var pagesTextures = {};

        data.font = info.getAttribute('face');
        data.size = parseInt(info.getAttribute('size'), 10);
        data.lineHeight = parseInt(common.getAttribute('lineHeight'), 10) / res;
        data.chars = {};

        // Single texture, convert to list
        if (textures instanceof core.Texture)
        {
            textures = [textures];
        }

        // Convert the input Texture, Textures or object
        // into a page Texture lookup by "id"
        for (var i = 0; i < pages.length; i++)
        {
            var id = pages[i].getAttribute('id');
            var file = pages[i].getAttribute('file');

            pagesTextures[id] = textures instanceof Array ? textures[i] : textures[file];
        }

        // parse letters
        var letters = xml.getElementsByTagName('char');

        for (var i$1 = 0; i$1 < letters.length; i$1++)
        {
            var letter = letters[i$1];
            var charCode = parseInt(letter.getAttribute('id'), 10);
            var page = letter.getAttribute('page') || 0;
            var textureRect = new math.Rectangle(
                (parseInt(letter.getAttribute('x'), 10) / res) + (pagesTextures[page].frame.x / res),
                (parseInt(letter.getAttribute('y'), 10) / res) + (pagesTextures[page].frame.y / res),
                parseInt(letter.getAttribute('width'), 10) / res,
                parseInt(letter.getAttribute('height'), 10) / res
            );

            data.chars[charCode] = {
                xOffset: parseInt(letter.getAttribute('xoffset'), 10) / res,
                yOffset: parseInt(letter.getAttribute('yoffset'), 10) / res,
                xAdvance: parseInt(letter.getAttribute('xadvance'), 10) / res,
                kerning: {},
                texture: new core.Texture(pagesTextures[page].baseTexture, textureRect),
                page: page,
            };
        }

        // parse kernings
        var kernings = xml.getElementsByTagName('kerning');

        for (var i$2 = 0; i$2 < kernings.length; i$2++)
        {
            var kerning = kernings[i$2];
            var first = parseInt(kerning.getAttribute('first'), 10) / res;
            var second = parseInt(kerning.getAttribute('second'), 10) / res;
            var amount = parseInt(kerning.getAttribute('amount'), 10) / res;

            if (data.chars[second])
            {
                data.chars[second].kerning[first] = amount;
            }
        }

        // I'm leaving this as a temporary fix so we can test the bitmap fonts in v3
        // but it's very likely to change
        BitmapText.fonts[data.font] = data;

        return data;
    };

    Object.defineProperties( BitmapText.prototype, prototypeAccessors );

    return BitmapText;
}(display.Container));

BitmapText.fonts = {};

/**
 * {@link PIXI.Loader Loader} middleware for loading
 * bitmap-based fonts suitable for using with {@link PIXI.BitmapText}.
 * @class
 * @memberof PIXI
 * @implements PIXI.ILoaderPlugin
 */
var BitmapFontLoader = function BitmapFontLoader () {};

BitmapFontLoader.parse = function parse (resource, texture)
{
    resource.bitmapFont = BitmapText.registerFont(resource.data, texture);
};

/**
 * Called when the plugin is installed.
 *
 * @see PIXI.Loader.registerPlugin
 */
BitmapFontLoader.add = function add ()
{
    loaders.LoaderResource.setExtensionXhrType('fnt', loaders.LoaderResource.XHR_RESPONSE_TYPE.DOCUMENT);
};

/**
 * Replacement for NodeJS's path.dirname
 * @private
 * @param {string} url Path to get directory for
 */
BitmapFontLoader.dirname = function dirname (url)
{
    var dir = url
        .replace(/\\/g, '/') // convert windows notation to UNIX notation, URL-safe because it's a forbidden character
        .replace(/\/$/, '') // replace trailing slash
        .replace(/\/[^\/]*$/, ''); // remove everything after the last

    // File request is relative, use current directory
    if (dir === url)
    {
        return '.';
    }
    // Started with a slash
    else if (dir === '')
    {
        return '/';
    }

    return dir;
};

/**
 * Called after a resource is loaded.
 * @see PIXI.Loader.loaderMiddleware
 * @param {PIXI.LoaderResource} resource
 * @param {function} next
 */
BitmapFontLoader.use = function use (resource, next)
{
    // skip if no data or not xml data
    if (!resource.data || resource.type !== loaders.LoaderResource.TYPE.XML)
    {
        next();

        return;
    }

    // skip if not bitmap font data, using some silly duck-typing
    if (resource.data.getElementsByTagName('page').length === 0
        || resource.data.getElementsByTagName('info').length === 0
        || resource.data.getElementsByTagName('info')[0].getAttribute('face') === null
    )
    {
        next();

        return;
    }

    var xmlUrl = !resource.isDataUrl ? BitmapFontLoader.dirname(resource.url) : '';

    if (resource.isDataUrl)
    {
        if (xmlUrl === '.')
        {
            xmlUrl = '';
        }

        if (this.baseUrl && xmlUrl)
        {
            // if baseurl has a trailing slash then add one to xmlUrl so the replace works below
            if (this.baseUrl.charAt(this.baseUrl.length - 1) === '/')
            {
                xmlUrl += '/';
            }
        }
    }

    // remove baseUrl from xmlUrl
    xmlUrl = xmlUrl.replace(this.baseUrl, '');

    // if there is an xmlUrl now, it needs a trailing slash. Ensure that it does if the string isn't empty.
    if (xmlUrl && xmlUrl.charAt(xmlUrl.length - 1) !== '/')
    {
        xmlUrl += '/';
    }

    var pages = resource.data.getElementsByTagName('page');
    var textures = {};

    // Handle completed, when the number of textures
    // load is the same number as references in the fnt file
    var completed = function (page) {
        textures[page.metadata.pageFile] = page.texture;

        if (Object.keys(textures).length === pages.length)
        {
            BitmapFontLoader.parse(resource, textures);
            next();
        }
    };

    for (var i = 0; i < pages.length; ++i)
    {
        var pageFile = pages[i].getAttribute('file');
        var url = xmlUrl + pageFile;
        var exists = false;

        // incase the image is loaded outside
        // using the same loader, resource will be available
        for (var name in this.resources)
        {
            var bitmapResource = this.resources[name];

            if (bitmapResource.url === url)
            {
                bitmapResource.metadata.pageFile = pageFile;
                if (bitmapResource.texture)
                {
                    completed(bitmapResource);
                }
                else
                {
                    bitmapResource.onAfterMiddleware.add(completed);
                }
                exists = true;
                break;
            }
        }

        // texture is not loaded, we'll attempt to add
        // it to the load and add the texture to the list
        if (!exists)
        {
            // Standard loading options for images
            var options = {
                crossOrigin: resource.crossOrigin,
                loadType: loaders.LoaderResource.LOAD_TYPE.IMAGE,
                metadata: Object.assign(
                    { pageFile: pageFile },
                    resource.metadata.imageMetadata
                ),
                parentResource: resource,
            };

            this.add(url, options, completed);
        }
    }
};

exports.BitmapFontLoader = BitmapFontLoader;
exports.BitmapText = BitmapText;
//# sourceMappingURL=text-bitmap.js.map
