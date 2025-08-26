uniform mat3 model;
uniform mat3 melee;
uniform mat3 very_close;
uniform mat3 close;
uniform mat3 far;
uniform mat3 very_far;

void addRing(inout vec3 color, inout float alpha, vec3 ringColor, float radius, float prevRadius, float dist) {
  float outer = step(dist, radius);
  float inner = step(dist, prevRadius);
  float mask = outer - inner;
  float a = (dist - prevRadius) / (radius - prevRadius);
  float falloff = mix(0.1, 0.6, a);
  alpha += falloff * mask;
  color += mix(vec3(1, 1, 1), ringColor, falloff) * mask;
}

half4 main(float2 coord) {
  vec2 worldCoord = (model * vec3(coord, 1.0)).xy;
  float dist = length(worldCoord);

  vec3 color = vec3(0.0);
  float alpha = 0.0;
  addRing(color, alpha, melee[0].rgb, melee[1].x, 0.0, dist);
  addRing(color, alpha, very_close[0].rgb, very_close[1].x, melee[1].x, dist);
  addRing(color, alpha, close[0].rgb, close[1].x, very_close[1].x, dist);
  addRing(color, alpha, far[0].rgb, far[1].x, close[1].x, dist);
  addRing(color, alpha, very_far[0].rgb, very_far[1].x, far[1].x, dist);
  
  return half4(vec3(color) * alpha, alpha);
}