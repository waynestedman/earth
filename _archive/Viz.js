import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/'); // local path
// Optional if you're self-hosting:
// dracoLoader.setDecoderConfig({ type: 'js' });

const canvas = document.querySelector('#appcanvas');

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
// renderer.setClearColor('#444444');
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.physicallyCorrectLights = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
// document.body.appendChild(renderer.domElement);
canvas.appendChild(renderer.domElement);

// Enable XR
// const xr = renderer.xr;
// xr.enabled = true;
renderer.xr.enabled = true;
// const vrButton = new VRButton(renderer);
document.body.appendChild(VRButton.createButton(renderer));

// Scene
const scene = new THREE.Scene();
// const starTexture = new THREE.TextureLoader().load('/stars.jpg');
// const starGeometry = new THREE.SphereGeometry(100, 64, 64);
// const starMaterial = new THREE.MeshBasicMaterial({
//     map: starTexture
// });
// const starField = new THREE.Mesh(starGeometry, starMaterial);
// scene.add(starField);

// grid plane
// const grid = new THREE.GridHelper(10, 10);
// scene.add(grid);

// Create a group for satellites
const satelliteGroup = new THREE.Group();
scene.add(satelliteGroup);

function createOrbitCurve(radius, segments = 100) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      points.push(new THREE.Vector3(x, 0, z));
  }
  return new THREE.CatmullRomCurve3(points, true); // closed curve
}

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
light.castShadow = true;
light.intensity = 2;
scene.add(light);

// Ambient Light
scene.add(new THREE.AmbientLight(0x404040, 1.5));

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Load GLB model
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

let earthModel; // placeholder for earth model
let satelliteModel; // placeholder for satellite model

gltfLoader.load('/model/earth.glb', (gltf) => {
  earthModel = gltf.scene;
  earthModel.scale.set(0.005, 0.005, 0.005);

  // Compute bounding box to center it
  const box = new THREE.Box3().setFromObject(earthModel);
  const center = box.getCenter(new THREE.Vector3());
  earthModel.position.sub(center); // Center the model

  earthModel.rotation.x = THREE.MathUtils.degToRad(23.5); // Axial tilt
  
  scene.add(earthModel);
}, undefined, (error) => {
  console.error('An error occurred while loading the Earth model:', error);
});

gltfLoader.load('/model/magellan.glb', (gltf) => {
  satelliteModel = gltf.scene;
  setupSatellites(); // wait until model is loaded
  animate(); // start animation after model is loaded
});

// satellite data
const satellites = [
  { radius: 3, speed: 0.01, angle: 0, inclination: 0, name: 'sat 1' },
  { radius: 3.5, speed: 0.015, angle: Math.PI / 6, inclination: 0.1, name: 'sat 2' },
  { radius: 3.5, speed: 0.016, angle: Math.PI / 3, inclination: -0.2, name: 'sat 3' },
  { radius: 3.5, speed: 0.017, angle: -Math.PI / 4, inclination: 0.1, name: 'sat 4' },
  { radius: 3.5, speed: 0.018, angle: -Math.PI / 2, inclination: -0.3, name: 'sat 5' },
  { radius: 3.5, speed: 0.019, angle: Math.PI / 2.5, inclination: -0.1, name: 'sat 6' },
  { radius: 3.5, speed: 0.008, angle: Math.PI / 2, inclination: 0.3, name: 'sat 7' },
  { radius: 4.0, speed: 0.012, angle: Math.PI, inclination: -0.2, name: 'sat 8' },
  { radius: 4.0, speed: 0.013, angle: -Math.PI / 6, inclination: -0.1, name: 'sat 9' },
  { radius: 4.5, speed: 0.014, angle: -Math.PI / 2.1, inclination: 0.2, name: 'sat 10' },
  { radius: 4.5, speed: 0.014, angle: -Math.PI / 3, inclination: 0.2, name: 'sat 11' },
  { radius: 4.5, speed: 0.006, angle: Math.PI / 3, inclination: -0.3, name: 'sat 12' },
  { radius: 4.5, speed: 0.009, angle: -Math.PI / 2, inclination: 0.5, name: 'sat 13' },
  { radius: 5.0, speed: 0.011, angle: Math.PI / 4, inclination: -0.1, name: 'sat 14' },
  { radius: 5.5, speed: 0.007, angle: -Math.PI / 4, inclination: 0.4, name: 'sat 15' }
];

// labels for the satellites
function createLabel(text) {
  const canvas = document.createElement('canvas');
  const size = 256;
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  context.fillStyle = 'white';
  context.font = '28px Arial';
  context.textAlign = 'center';
  context.fillText(text, size / 2, size / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.75, 0.25, 1); // Adjust size as needed

  return sprite;
}

function setupSatellites() {
  satellites.forEach((sat, index) => {
    // const geometry = new THREE.SphereGeometry(0.05, 8, 8); // tiny sphere
    // const material = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
    // const satellite = new THREE.Mesh(geometry, material);
    
    // Clone the satellite model
    const satellite = satelliteModel.clone(true);
    satellite.scale.set(0.03, 0.03, 0.03); // scale if needed
    satellite.userData.name = sat.name;

    // Create an orbit container to apply inclination
    const orbit = new THREE.Object3D();
    orbit.rotation.x = sat.inclination;
    orbit.add(satellite);

    // const satellite = model;

    // Create and attach label
    const label = createLabel(sat.name);
    label.position.set(0, 0.1, 0); // position label just above the satellite
    satellite.add(label); // attach to the satellite so it follows its motion

    // scene.add(satellite); // add orbit to the scene

    // Save references
    sat.mesh = satellite;
    sat.orbit = orbit;
    sat.label = label;

    // Add the orbit container  to the satellite group
    satelliteGroup.add(orbit);

    const orbitCurve = createOrbitCurve(sat.radius);
    const orbitGeometry = new THREE.TubeGeometry(orbitCurve, 100, 0.003, 8, true);
    const orbitMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff, // cyan glow
      transparent: true,
      opacity: 0.6
    });
    const orbitMesh = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.add(orbitMesh); // attach orbit line to its inclination rotation
  });
};

// Add satellites to the scene
scene.add(satelliteGroup);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  if (earthModel) {
    earthModel.rotation.y += 0.002; // Rotate the earth model
  }

  // Update satellite positions
  satellites.forEach(sat => {
    if (!sat.mesh) return; // Skip until it's ready

    sat.angle += sat.speed;
    const x = sat.radius * Math.cos(sat.angle);
    const z = sat.radius * Math.sin(sat.angle);
    sat.mesh.position.set(x, 0, z);
  });

  // keep labels facing the camera
  // satellites.forEach((sat) => {
  //   sat.label.lookAt(camera.position);
  // });

  controls.update();
  renderer.render(scene, camera);

}

  // requestAnimationFrame(animate);
  renderer.setAnimationLoop(animate);