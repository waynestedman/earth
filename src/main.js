import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import * as satellite from 'satellite.js'; // Import satellite.js for TLE calculations
import axios from 'axios';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const canvas = document.querySelector('#appcanvas');

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.physicallyCorrectLights = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
canvas.appendChild(renderer.domElement);

renderer.xr.enabled = true;
document.body.appendChild(VRButton.createButton(renderer));

// Scene
const scene = new THREE.Scene();

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
  loadTLEData(); // Load TLE data and setup satellites
  animate(); // Start animation after model is loaded
});

let satellitePaths = []; // Array to store satellite data and their paths

// Load TLE data and setup satellites
async function loadTLEData() {
  try {
    const response = await axios.get('/tle.json'); // Use axios to fetch the TLE data
console.log('TLE data loaded:', response.data); // Log the TLE data for debugging
    const tleData = response.data; 

    tleData.forEach((tle) => {
      const satrec = satellite.twoline2satrec(tle.tleLine1, tle.tleLine2);
      const now = new Date();

      // Calculate initial position
      const positionAndVelocity = satellite.propagate(satrec, now);
      const positionEci = positionAndVelocity.position;

      if (!positionEci) return;

      const gmst = satellite.gstime(now);
      const positionGd = satellite.eciToGeodetic(positionEci, gmst);

      const latitude = satellite.degreesLat(positionGd.latitude);
      const longitude = satellite.degreesLong(positionGd.longitude);
      const altitude = positionGd.height;

      // Convert lat/lon/alt to 3D coordinates
      const radius = 3 + altitude / 1000; // Scale altitude for visualization
      const x = radius * Math.cos(THREE.MathUtils.degToRad(latitude)) * Math.cos(THREE.MathUtils.degToRad(longitude));
      const z = radius * Math.cos(THREE.MathUtils.degToRad(latitude)) * Math.sin(THREE.MathUtils.degToRad(longitude));
      const y = radius * Math.sin(THREE.MathUtils.degToRad(latitude));

      // Clone the satellite model
      const satelliteMesh = satelliteModel.clone(true);
      satelliteMesh.scale.set(0.03, 0.03, 0.03); // scale if needed
      satelliteMesh.position.set(x, y, z);
      satelliteMesh.userData.name = tle.name;

      // Create and attach label
      const label = createLabel(tle.name);
      label.position.set(0, 0.1, 0); // position label just above the satellite
      satelliteMesh.add(label);

      // Add to satellite group
      satelliteGroup.add(satelliteMesh);
    });
  } catch (error) {
    console.error('Failed to load TLE data:', error);
  }
}

// Create labels for satellites
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

  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);