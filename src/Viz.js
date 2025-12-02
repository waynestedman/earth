// Visualization version

// import * as dat from 'dat.gui';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { gsap } from "gsap";
import satellites from './data/satellites.json';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/'); // local path
// Optional if you're self-hosting:
// dracoLoader.setDecoderConfig({ type: 'js' });

// Speed control variable
const settings = {
  satelliteSpeed: 0.1, // Default speed multiplier
};

// GSAP timeline for satellite animations
let satelliteTimeline;

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

// Raycaster for click detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Store currently selected satellite
let selectedSatellite = null;
let previouslySelectedClickBox = null;

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
  earthModel.position.sub(center);

  earthModel.rotation.x = THREE.MathUtils.degToRad(23.5); // Axial tilt

  scene.add(earthModel);

  // Start animations after Earth is loaded
  if (satelliteModel) {
    if (satelliteTimeline) {
      satelliteTimeline.kill(); // Stop existing timeline
    }
    createSatelliteAnimations(); // Recreate with Earth rotation
  }
}, undefined, (error) => {
  console.error('An error occurred while loading the Earth model:', error);
});

gltfLoader.load('/model/magellan.glb', (gltf) => {
  satelliteModel = gltf.scene;
  setupSatellites(); // wait until model is loaded
  animate(); // start animation after model is loaded
});

// labels for the satellites
function createLabel(text) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  // Set font first to measure text
  const fontSize = 16;
  context.font = `bold ${fontSize}px Urbanist, Arial`;

  // Measure text to create tight bounding box
  const metrics = context.measureText(text);
  const textWidth = metrics.width;
  const textHeight = fontSize; // Approximate height

  // Add 8px padding on all sides (16px total width/height)
  const padding = 1;
  canvas.width = textWidth + (padding * 2);
  canvas.height = textHeight + (padding * 2);

  // Re-set font after canvas resize (canvas resets context)
  context.font = `bold ${fontSize}px Urbanist, Arial`;
  context.textAlign = 'left';
  context.textBaseline = 'top';

  // Draw background with padding
  context.fillStyle = 'rgba(0, 0, 0, 0.7)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Draw text with padding offset
  context.fillStyle = 'white';
  context.fillText(text, padding, padding);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    sizeAttenuation: false
  });
  const sprite = new THREE.Sprite(material);

  // Scale proportionally based on canvas dimensions
  // When sizeAttenuation is false, we need to scale based on actual canvas size
  const baseScale = 0.0025; // Adjust this to control overall label size
  const scaleX = canvas.width * baseScale;
  const scaleY = canvas.height * baseScale;
  sprite.scale.set(scaleX, scaleY, 1);
  sprite.renderOrder = 999;

  return sprite;
}

function setupSatellites() {
  satellites.forEach((sat, index) => {
    // const geometry = new THREE.SphereGeometry(0.05, 8, 8); // tiny sphere
    // const material = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
    // const satellite = new THREE.Mesh(geometry, material);

    // Clone the satellite model
    const satellite = satelliteModel.clone(true);
    satellite.scale.set(0.03, 0.03, 0.03);
    satellite.rotation.x = THREE.MathUtils.degToRad(-90);
    satellite.userData.name = sat.name;

    // Create invisible bounding box for click detection (expanded to include label)
    const boxGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const boxMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthTest: true,
      depthWrite: false
    });
    const clickBox = new THREE.Mesh(boxGeometry, boxMaterial);
    clickBox.position.y = 0.075; // Centered between satellite and label
    clickBox.userData.satelliteData = sat;
    clickBox.userData.isSatelliteClickBox = true;

    // Create an orbit container to apply inclination
    const orbit = new THREE.Object3D();
    orbit.rotation.x = sat.inclination;
    orbit.add(satellite);
    orbit.add(clickBox);

    // const satellite = model;

    // Create and attach label directly to orbit container
    const label = createLabel(sat.name);
    // Store label separately and position it manually in animation
    label.userData.satellite = satellite;
    orbit.add(label);

    // scene.add(satellite); // add orbit to the scene

    // Save references
    sat.mesh = satellite;
    sat.orbit = orbit;
    sat.label = label;
    sat.clickBox = clickBox;

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

  // Create GSAP timeline for satellite animations
  createSatelliteAnimations();
};

// Add satellites to the scene
scene.add(satelliteGroup);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Click detection
function onMouseClick(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the ray
  const intersects = raycaster.intersectObjects(scene.children, true);

  // Find the first satellite click box
  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].object.userData.isSatelliteClickBox) {
      const satelliteData = intersects[i].object.userData.satelliteData;
      const clickBox = intersects[i].object;

      // Remove highlight from previously selected satellite
      if (previouslySelectedClickBox && previouslySelectedClickBox !== clickBox) {
        previouslySelectedClickBox.material.opacity = 0;
      }

      // Highlight the selected satellite's bounding box
      clickBox.material.opacity = 0.1;
      clickBox.material.color.setHex(0x00ffff); // Cyan color
      previouslySelectedClickBox = clickBox;

      // Update selected satellite
      selectedSatellite = satelliteData;

      // Log to console
      console.log('Satellite clicked:', satelliteData.name);
      console.log('Satellite data:', satelliteData);

      // Emit custom event for UI to listen to
      const satelliteClickEvent = new CustomEvent('satelliteSelected', {
        detail: satelliteData
      });
      window.dispatchEvent(satelliteClickEvent);

      break;
    }
  }
}

window.addEventListener('click', onMouseClick);

// Listen for satellite selection from UI
window.addEventListener('satelliteSelected', (event) => {
  const satelliteData = event.detail;

  // Find the corresponding satellite in the satellites array
  const satellite = satellites.find(sat => sat.name === satelliteData.name);

  if (satellite && satellite.clickBox) {
    // Remove highlight from previously selected satellite
    if (previouslySelectedClickBox && previouslySelectedClickBox !== satellite.clickBox) {
      previouslySelectedClickBox.material.opacity = 0;
    }

    // Highlight the selected satellite's bounding box
    satellite.clickBox.material.opacity = 0.05;
    satellite.clickBox.material.color.setHex(0x00ffff); // Cyan color
    previouslySelectedClickBox = satellite.clickBox;
  }
});

// Export for external access
export { selectedSatellite };

// Create GSAP animations for satellites and Earth
function createSatelliteAnimations() {
  satelliteTimeline = gsap.timeline({ repeat: -1 });

  // Add Earth rotation to the timeline
  if (earthModel) {
    satelliteTimeline.to(earthModel.rotation, {
      y: Math.PI * 2, // One full rotation (absolute value)
      duration: 30, // Earth rotation duration
      ease: "none",
      repeat: -1
    }, 0);
  }

  satellites.forEach(sat => {
    if (!sat.mesh) return;

    // const duration = 100 / (sat.speed * 1000); 
    const duration = 100 / (sat.speed * settings.satelliteSpeed * 1000);

    // Create circular motion using GSAP
    satelliteTimeline.to(sat, {
      angle: sat.angle + Math.PI * 2, // One full rotation
      duration: duration,
      ease: "none",
      repeat: -1,
      onUpdate: function() {
        const x = sat.radius * Math.cos(sat.angle);
        const z = sat.radius * Math.sin(sat.angle);
        sat.mesh.position.set(x, 0, z);
        // Update label position to follow satellite (closer)
        if (sat.label) {
          sat.label.position.set(x, 0.15, z);
        }
        // Update click box position to follow satellite (centered between satellite and label)
        if (sat.clickBox) {
          sat.clickBox.position.set(x, 0.075, z);
        }
      }
    }, 0); // Start all animations at the same time
  });
}

// Animation loop
function animate() {
  controls.update();
  renderer.render(scene, camera);
}

  renderer.setAnimationLoop(animate);