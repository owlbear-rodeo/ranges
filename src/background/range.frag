uniform mat3 model;
uniform mat3 circle1;
uniform mat3 circle2;
uniform mat3 circle3;
uniform mat3 circle4;
uniform mat3 circle5;
uniform float minFalloff;
uniform float maxFalloff;

void addRing(inout vec3 color, inout float alpha, vec3 ringColor, float radius, float prevRadius, float dist) {
  float outer = step(dist, radius);
  float inner = step(dist, prevRadius);
  float mask = outer - inner;
  float a = (dist - prevRadius) / (radius - prevRadius);
  float falloff = mix(minFalloff, maxFalloff, a);
  alpha += falloff * mask;
  color += mix(vec3(1, 1, 1), ringColor, falloff) * mask;
}

half4 main(float2 coord) {
  vec2 worldCoord = (model * vec3(coord, 1.0)).xy;
  float dist = length(worldCoord);

  vec3 color = vec3(0.0);
  float alpha = 0.0;
  addRing(color, alpha, circle1[0].rgb, circle1[1].x, 0.0, dist);
  addRing(color, alpha, circle2[0].rgb, circle2[1].x, circle1[1].x, dist);
  addRing(color, alpha, circle3[0].rgb, circle3[1].x, circle2[1].x, dist);
  addRing(color, alpha, circle4[0].rgb, circle4[1].x, circle3[1].x, dist);
  addRing(color, alpha, circle5[0].rgb, circle5[1].x, circle4[1].x, dist);
  
  return half4(vec3(color) * alpha, alpha);
}