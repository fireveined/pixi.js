precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;
attribute float aTextureId;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform vec4 tint;

varying vec2 vTextureCoord;
varying vec4 vColor;
varying float vTextureId;

void main(void){
    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition.xy, 1.0)).xy, aVertexPosition.z, 1.0);

    vTextureCoord = aTextureCoord;
    vTextureId = aTextureId;
    vColor = aColor * tint;
}
