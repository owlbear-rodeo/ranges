uniform mat3 model;
uniform mat3 melee;
uniform mat3 very_close;
uniform mat3 close;
uniform mat3 far;
uniform mat3 very_far;

half4 main(float2 coord) {
  vec2 worldCoord = (model * vec3(coord, 1.0)).xy;
  float dist = length(worldCoord);

  float circle1 = step(dist, melee[1].x);
  float circle2 = step(dist, very_close[1].x); 
  float circle3 = step(dist, close[1].x);
  float circle4 = step(dist, far[1].x);
  float circle5 = step(dist, very_far[1].x);

  vec3 color = circle1 * melee[0].rgb +
               (circle2 - circle1) * very_close[0].rgb +
               (circle3 - circle2) * close[0].rgb + 
               (circle4 - circle3) * far[0].rgb +
               (circle5 - circle4) * very_far[0].rgb; 
  
  float alpha = 0.25;
  return half4(color, 1.0) * alpha;
}