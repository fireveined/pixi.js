/*!
 * @pixi/canvas-text - v5.2.0
 * Compiled Mon, 23 Dec 2019 12:37:54 UTC
 *
 * @pixi/canvas-text is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
'use strict';

var text = require('@pixi/text');
var sprite = require('@pixi/sprite');

/**
 * Renders the object using the Canvas renderer
 *
 * @method _renderCanvas
 * @memberof PIXI.Text#
 * @private
 * @param {PIXI.CanvasRenderer} renderer - The renderer
 */
text.Text.prototype._renderCanvas = function _renderCanvas(renderer)
{
    if (this._autoResolution && this._resolution !== renderer.resolution)
    {
        this._resolution = renderer.resolution;
        this.dirty = true;
    }

    this.updateText(true);

    sprite.Sprite.prototype._renderCanvas.call(this, renderer);
};
//# sourceMappingURL=canvas-text.js.map
