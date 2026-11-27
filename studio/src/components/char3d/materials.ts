import * as THREE from "three";

/** One shared sun for every scene (the "east" sun): a character is lit from the same world direction in every cut. */
export const SUN_DIR = new THREE.Vector3(-6.0, 4.6, 4.6).normalize(); // world-space direction TOWARDS the sun (east = -x, high, a little in front)
export const SUN_COLOR = "#FFB36E";
export const RIM_COLOR = new THREE.Color("#FFF4DC");
export const INK = "#1D1524";

type Opts = { rim?: number; roughness?: number; emissive?: string; emissiveIntensity?: number; metalness?: number };
const cache = new Map<string, THREE.Material>();

/**
 * Soft Miko-like surface: standard (Lambert-ish) shading from the scene lights + a broken, patchy white sunlight rim
 * on the side facing SUN_DIR (fresnel x sun-facing x low-frequency patches, so it reads as light catching edges).
 */
export function bodyMat(color: string, o: Opts = {}): THREE.MeshStandardMaterial {
  const key = `b|${color}|${o.rim ?? 1}|${o.roughness ?? 0.88}|${o.emissive ?? ""}|${o.metalness ?? 0}`;
  const hit = cache.get(key);
  if (hit) return hit as THREE.MeshStandardMaterial;
  const rim = o.rim ?? 1;
  const m = new THREE.MeshStandardMaterial({ color, roughness: o.roughness ?? 0.88, metalness: o.metalness ?? 0, emissive: o.emissive ?? "#000000", emissiveIntensity: o.emissiveIntensity ?? 1 });
  const uSun = { value: new THREE.Vector3() };
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uSunView = uSun;
    sh.uniforms.uRimK = { value: rim };
    sh.uniforms.uRimColor = { value: RIM_COLOR };
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vObjP;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvObjP = position;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vObjP;\nuniform vec3 uSunView;\nuniform float uRimK;\nuniform vec3 uRimColor;")
      .replace("#include <opaque_fragment>", `
        {
          vec3 rn = normalize(vNormal);
          vec3 rv = normalize(vViewPosition);
          float fres = pow(1.0 - clamp(dot(rn, rv), 0.0, 1.0), 2.1);
          float facing = smoothstep(0.0, 0.5, dot(rn, uSunView));
          float pat = 0.5 + 0.5 * sin(vObjP.y * 0.115 + 1.6 * sin(vObjP.x * 0.07 + 0.6) + vObjP.z * 0.05);
          float breakUp = smoothstep(0.22, 0.62, pat);
          outgoingLight += uRimColor * fres * facing * breakUp * uRimK * 0.95;
        }
        #include <opaque_fragment>`);
  };
  m.onBeforeRender = (_r, _s, camera) => { uSun.value.copy(SUN_DIR).transformDirection(camera.matrixWorldInverse); };
  m.customProgramCacheKey = () => "bodyrim";
  cache.set(key, m);
  return m;
}

/** Glossy dark feature material (eyes, brows, mouth) so a sphere eye catches a real specular glint from the sun. */
export function featureMat(color = INK, rough = 0.32): THREE.MeshStandardMaterial {
  const key = `f|${color}|${rough}`;
  const hit = cache.get(key);
  if (hit) return hit as THREE.MeshStandardMaterial;
  const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0 });
  cache.set(key, m);
  return m;
}

/** Ink outline = inverted hull: same geometry, back faces only, pushed out along the normal by `w` object units. */
export function inkMat(w: number): THREE.MeshBasicMaterial {
  const key = `i|${w}`;
  const hit = cache.get(key);
  if (hit) return hit as THREE.MeshBasicMaterial;
  const m = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide, toneMapped: false });
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace("#include <begin_vertex>", `vec3 transformed = position + normalize(normal) * ${w.toFixed(3)};`);
  };
  m.customProgramCacheKey = () => `ink${w}`;
  cache.set(key, m);
  return m;
}

const hex = (s: string) => new THREE.Color(s);
export const mix = (a: string, b: string, t: number) => "#" + hex(a).lerp(hex(b), t).getHexString();
