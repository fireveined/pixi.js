/*!
 * @pixi/mixin-get-global-position - v5.2.0
 * Compiled Mon, 23 Dec 2019 12:37:54 UTC
 *
 * @pixi/mixin-get-global-position is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
'use strict';

var display = require('@pixi/display');
var math = require('@pixi/math');

/**
 * Returns the global position of the displayObject. Does not depend on object scale, rotation and pivot.
 *
 * @method getGlobalPosition
 * @memberof PIXI.DisplayObject#
 * @param {PIXI.Point} [point=new PIXI.Point()] - The point to write the global value to.
 * @param {boolean} [skipUpdate=false] - Setting to true will stop the transforms of the scene graph from
 *  being updated. This means the calculation returned MAY be out of date BUT will give you a
 *  nice performance boost.
 * @return {PIXI.Point} The updated point.
 */
display.DisplayObject.prototype.getGlobalPosition = function getGlobalPosition(point, skipUpdate)
{
    if ( point === void 0 ) point = new math.Point();
    if ( skipUpdate === void 0 ) skipUpdate = false;

    if (this.parent)
    {
        this.parent.toGlobal(this.position, point, skipUpdate);
    }
    else
    {
        point.x = this.position.x;
        point.y = this.position.y;
    }

    return point;
};
//# sourceMappingURL=mixin-get-global-position.js.map
