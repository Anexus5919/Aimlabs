import * as THREE from 'three';

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 5;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000);

// Crosshair
const texture = new THREE.TextureLoader().load('./crosshair.png');
const material = new THREE.SpriteMaterial({
  map: texture,
  transparent: true,
  color: 0xffffff,
});
const crosshair = new THREE.Sprite(material);
crosshair.scale.set(0.7, 0.7, 0.7);
scene.add(crosshair);

// Raycaster & Mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Score Counter
let score = 0;
const scoreElement = document.createElement('div');
scoreElement.style.position = 'absolute';
scoreElement.style.top = '20px';
scoreElement.style.left = '20px';
scoreElement.style.color = 'white';
scoreElement.style.fontFamily = 'Arial, sans-serif';
scoreElement.style.fontSize = '24px';
scoreElement.style.fontWeight = 'bold';
scoreElement.textContent = `Score: ${score}`;
document.body.appendChild(scoreElement);

// Target Sphere
let target;
const sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 'red' });
function spawnTarget() {
  if (target) scene.remove(target);
  target = new THREE.Mesh(sphereGeometry, sphereMaterial);

  // Random position within visible range
  target.position.set(
    (Math.random() - 0.5) * 6,  // X range
    (Math.random() - 0.5) * 3,  // Y range
    -Math.random() * 3           // Z range
  );

  scene.add(target);
}
spawnTarget();

// Mouse Move
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

// Click Event (shooting)
window.addEventListener('click', () => {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(target);

  if (intersects.length > 0) {
    // Pop effect
    const pop = intersects[0].object;
    scene.remove(pop);
    score += 1;
    scoreElement.textContent = `Score: ${score}`;
    spawnTarget(); // spawn new one
  }
});

// Plane for crosshair placement
const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -2);

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Move crosshair with mouse
  raycaster.setFromCamera(mouse, camera);
  const intersectionPoint = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, intersectionPoint);
  if (intersectionPoint) crosshair.position.copy(intersectionPoint);

  renderer.render(scene, camera);
}
animate();

// Handle Resize
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});
