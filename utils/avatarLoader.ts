// ──────────────────────────────────────────────────────────────
//  avatarLoader.ts
//  Loads a .glb or .gltf model and prepares it for ASCII rendering:
//    • Auto-centres the bounding box
//    • Normalises scale to fit inside a 2-unit sphere
//    • Replaces all materials with a solid white MeshStandardMaterial
//      (flat materials give higher contrast ASCII output)
//    • Falls back to a procedural bust if no model file is found
//
//  ── HOW TO SWAP IN YOUR OWN MODEL ──────────────────────────
//  1. Drop your .glb into  /public/assets/models/avatar.glb
//  2. Change MODEL_PATH below to  "/assets/models/avatar.glb"
//  3. That's it — loader, centering and scaling are automatic.
// ──────────────────────────────────────────────────────────────

// ↓ Replace with your own .glb / .gltf path under /public
export const MODEL_PATH = "/assets/models/avatar.glb";

/**
 * Try to load a GLB/GLTF model from `modelPath`.
 * If the file does not exist (or loading fails), returns a
 * procedural Three.js bust group instead.
 *
 * @param THREE       - the `three` module (passed in to avoid multiple imports)
 * @param modelPath   - path under /public, e.g. "/assets/models/avatar.glb"
 */
export async function loadAvatar(
  THREE: any,
  modelPath: string = MODEL_PATH,
): Promise<any /* THREE.Group */> {
  // ── 1. Check if the file actually exists ─────────────────
  let fileExists = false;
  try {
    const res = await fetch(modelPath, { method: "HEAD" });
    fileExists = res.ok;
  } catch {
    fileExists = false;
  }

  if (!fileExists) {
    // ── 2a. Procedural bust placeholder ────────────────────
    return buildProceduralBust(THREE);
  }

  // ── 2b. Real GLB/GLTF load ────────────────────────────────
  try {
    const { GLTFLoader } = await import(
      // @ts-ignore — drei/three path
      "three/examples/jsm/loaders/GLTFLoader.js"
    );

    const loader = new GLTFLoader();
    const gltf: any = await new Promise((resolve, reject) =>
      loader.load(modelPath, resolve, undefined, reject)
    );

    const model: any = gltf.scene;

    // Auto-centre
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    // Normalise scale: longest axis → 2 units
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    model.scale.setScalar(2 / maxDim);

    // Flatten all materials to solid white for maximum contrast
    const solidMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.75,
      metalness: 0.15,
    });
    model.traverse((child: any) => {
      if (child.isMesh) {
        child.material = solidMat;
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });

    return model;
  } catch {
    // Loading the real file failed — fall back to placeholder
    return buildProceduralBust(THREE);
  }
}

// ──────────────────────────────────────────────────────────────
//  Procedural bust — visible while no real .glb is present.
//  A simple head + neck + shoulder silhouette that reads well
//  as ASCII at low resolution.
// ──────────────────────────────────────────────────────────────
function buildProceduralBust(THREE: any): any {
  const group = new THREE.Group();

  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.78,
    metalness: 0.12,
  });

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.65, 32, 32), mat);
  head.scale.set(0.98, 1.18, 0.92);
  head.position.y = 0.35;
  group.add(head);

  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.3, 16), mat);
  neck.position.y = -0.26;
  group.add(neck);

  // Left shoulder
  const lShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), mat);
  lShoulder.position.set(-0.72, -0.52, 0);
  group.add(lShoulder);

  // Right shoulder
  const rShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), mat);
  rShoulder.position.set(0.72, -0.52, 0);
  group.add(rShoulder);

  // Upper chest (connects shoulders)
  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.65, 0.25, 20), mat);
  chest.position.y = -0.62;
  group.add(chest);

  // Brow ridge (gives head some depth contrast)
  const brow = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.07, 0.1),
    mat,
  );
  brow.position.set(0, 0.55, 0.6);
  group.add(brow);

  return group;
}
