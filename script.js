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
const texture = new THREE.TextureLoader().load('/crosshair.png');
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

// Game State
let score = 0;
let isPracticeMode = false;
let practiceTimer = null;
let timeRemaining = 0;
let sessionStartTime = 0;
let lastHitTime = 0;
let hitTimes = [];
let missedShots = 0;
let totalShots = 0;
let selectedDifficulty = null;
// Targets only respawn on hit; no auto-spawn interval

// UI Elements
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

// Timer Display
const timerElement = document.createElement('div');
timerElement.className = 'timer-display';
timerElement.style.display = 'none';
document.body.appendChild(timerElement);

// Difficulty Display (during practice)
const difficultyElement = document.createElement('div');
difficultyElement.className = 'difficulty-display';
difficultyElement.style.position = 'absolute';
difficultyElement.style.top = '60px';
difficultyElement.style.right = '20px';
difficultyElement.style.color = 'white';
difficultyElement.style.fontFamily = 'Arial, sans-serif';
difficultyElement.style.fontSize = '20px';
difficultyElement.style.fontWeight = 'bold';
difficultyElement.style.display = 'none';
difficultyElement.style.zIndex = '100';
document.body.appendChild(difficultyElement);

// Target Sphere
let target;
const sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 'red' });

function spawnTarget() {
  if (target) scene.remove(target);
  target = new THREE.Mesh(sphereGeometry, sphereMaterial);

  // Range and size based on difficulty
  let xRange, yRange, zRange;
  let scaleMultiplier;
  
  if (selectedDifficulty === 'easy') {
    xRange = 6;   // Close, smaller area
    yRange = 4;
    zRange = 2;
    scaleMultiplier = 1.7; // larger target ~0.51 radius
  } else if (selectedDifficulty === 'medium') {
    xRange = 9;   // a bit easier than before
    yRange = 6;
    zRange = 4;
    scaleMultiplier = 1.2; // slightly larger than default
  } else if (selectedDifficulty === 'hard') {
    // Make hard exactly the same as medium as requested
    xRange = 9;
    yRange = 6;
    zRange = 4;
    scaleMultiplier = 1.0;
  } else {
    // Default range for non-practice mode
    xRange = 6;
    yRange = 3;
    zRange = 3;
    scaleMultiplier = 1.0;
  }

  target.position.set(
    (Math.random() - 0.5) * xRange,  // X range
    (Math.random() - 0.5) * yRange,  // Y range
    -Math.random() * zRange           // Z range
  );

  // Apply size based on difficulty
  target.scale.set(scaleMultiplier, scaleMultiplier, scaleMultiplier);

  scene.add(target);
}
spawnTarget();

// Mouse Move
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

// Click Event (shooting)
window.addEventListener('click', (event) => {
  // Don't count clicks on UI elements
  if (event.target.closest('.ui-panel, .modal, .reset-btn')) {
    return;
  }

  totalShots++;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(target);

  if (intersects.length > 0) {
    // Hit target
    const currentTime = Date.now();
    if (lastHitTime > 0) {
      const timeDiff = (currentTime - lastHitTime) / 1000; // in seconds
      hitTimes.push(timeDiff);
    }
    lastHitTime = currentTime;
    
    const pop = intersects[0].object;
    scene.remove(pop);
    score += 1;
    scoreElement.textContent = `Score: ${score}`;
    spawnTarget(); // spawn new one
  } else {
    // Missed shot
    missedShots++;
  }
});

// Reset Function
function resetGame() {
  score = 0;
  missedShots = 0;
  totalShots = 0;
  hitTimes = [];
  lastHitTime = 0;
  scoreElement.textContent = `Score: ${score}`;
  // End any active practice session UI/state and show setup again
  if (practiceTimer) {
    clearInterval(practiceTimer);
    practiceTimer = null;
  }
  isPracticeMode = false;
  timerElement.style.display = 'none';
  difficultyElement.style.display = 'none';
  document.body.classList.remove('practice-mode-active');

  // Show practice setup panel (difficulty + timer options)
  const panel = document.getElementById('practiceModeUI');
  if (panel) panel.style.display = 'block';
  selectedDifficulty = null;
  const buttons = document.querySelectorAll('.difficulty-btn');
  buttons.forEach(btn => btn.classList.remove('selected'));
  const timerOpts = document.getElementById('timerOptions');
  if (timerOpts) timerOpts.style.display = 'none';
  const desc = document.getElementById('difficultyDescription');
  if (desc) desc.textContent = 'Choose your difficulty level';
  
  spawnTarget();
}

// Difficulty configurations
const difficultyConfigs = {
  easy: {
    spawnInterval: 3000, // 3 seconds between spawns
    description: "Targets appear close in a small area - perfect for beginners"
  },
  medium: {
    spawnInterval: 2000, // 2 seconds between spawns
    description: "Targets appear at medium distance in a large area - balanced challenge"
  },
  hard: {
    spawnInterval: 1200, // 1.2 seconds between spawns
    description: "Targets appear far away in a huge area - expert level challenge"
  }
};

// Practice Mode Functions
function startPracticeMode(duration) {
  if (!selectedDifficulty) {
    alert('Please select a difficulty level first!');
    return;
  }
  
  isPracticeMode = true;
  sessionStartTime = Date.now();
  timeRemaining = duration;
  // Reset scores/times without clearing difficulty or spawn timers prematurely
  score = 0;
  missedShots = 0;
  totalShots = 0;
  hitTimes = [];
  lastHitTime = 0;
  scoreElement.textContent = `Score: ${score}`;
  spawnTarget();
  
  // Hide practice mode UI
  document.getElementById('practiceModeUI').style.display = 'none';
  
  // Show timer and difficulty display
  timerElement.style.display = 'block';
  updateTimerDisplay();
  difficultyElement.style.display = 'block';
  difficultyElement.textContent = `Difficulty: ${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}`;
  
  // Hide cursor during practice
  document.body.classList.add('practice-mode-active');
  
  // No auto-spawn; targets respawn only on successful hit
  
  // Start timer
  practiceTimer = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    
    if (timeRemaining <= 0) {
      endPracticeSession();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function endPracticeSession() {
  isPracticeMode = false;
  clearInterval(practiceTimer);
  timerElement.style.display = 'none';
  difficultyElement.style.display = 'none';
  
  // Show cursor again
  document.body.classList.remove('practice-mode-active');
  
  // Calculate statistics
  const sessionDuration = (Date.now() - sessionStartTime) / 1000; // in seconds
  const avgTimeBetweenHits = hitTimes.length > 0 ? 
    hitTimes.reduce((sum, time) => sum + time, 0) / hitTimes.length : 0;
  const accuracy = totalShots > 0 ? ((totalShots - missedShots) / totalShots) * 100 : 0;
  const shotsPerMinute = (totalShots / (sessionDuration / 60)).toFixed(1);
  
  // Show statistics modal
  showStatisticsModal({
    finalScore: score,
    sessionDuration: sessionDuration,
    avgTimeBetweenHits: avgTimeBetweenHits,
    missedShots: missedShots,
    accuracy: accuracy,
    shotsPerMinute: shotsPerMinute
  });
}

function showStatisticsModal(stats) {
  document.getElementById('finalScore').textContent = stats.finalScore;
  document.getElementById('sessionDuration').textContent = formatTime(stats.sessionDuration);
  document.getElementById('avgTimeBetweenHits').textContent = `${stats.avgTimeBetweenHits.toFixed(2)}s`;
  document.getElementById('missedShots').textContent = stats.missedShots;
  document.getElementById('accuracy').textContent = `${stats.accuracy.toFixed(1)}%`;
  document.getElementById('shotsPerMinute').textContent = stats.shotsPerMinute;
  
  document.getElementById('statisticsModal').style.display = 'flex';
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function closeStatisticsModal() {
  document.getElementById('statisticsModal').style.display = 'none';
  document.getElementById('practiceModeUI').style.display = 'block';
  
  // Reset to difficulty selection
  selectedDifficulty = null;
  document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('selected'));
  document.getElementById('timerOptions').style.display = 'none';
  document.getElementById('difficultyDescription').textContent = 'Choose your difficulty level';
  
  resetGame();
}

// Difficulty selection functions
function selectDifficulty(difficulty) {
  selectedDifficulty = difficulty;
  
  // Update UI
  document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('selected'));
  document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('selected');
  
  // Show difficulty description
  document.getElementById('difficultyDescription').textContent = difficultyConfigs[difficulty].description;
  
  // Show timer options
  document.getElementById('timerOptions').style.display = 'block';
}

// Event Listeners
document.getElementById('resetBtn').addEventListener('click', resetGame);

// Difficulty selection buttons
document.querySelectorAll('.difficulty-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const difficulty = btn.getAttribute('data-difficulty');
    selectDifficulty(difficulty);
  });
});

// Timer option buttons
document.querySelectorAll('.timer-btn[data-time]').forEach(btn => {
  btn.addEventListener('click', () => {
    const time = parseInt(btn.getAttribute('data-time'));
    startPracticeMode(time);
  });
});

// Custom timer button
document.getElementById('customTimerBtn').addEventListener('click', () => {
  document.getElementById('customTimerInput').style.display = 'flex';
});

// Start custom timer
document.getElementById('startCustomTimer').addEventListener('click', () => {
  const minutes = parseInt(document.getElementById('customMinutes').value) || 0;
  const seconds = parseInt(document.getElementById('customSeconds').value) || 0;
  const totalSeconds = minutes * 60 + seconds;
  
  if (totalSeconds > 0) {
    document.getElementById('customTimerInput').style.display = 'none';
    document.getElementById('customMinutes').value = '';
    document.getElementById('customSeconds').value = '';
    startPracticeMode(totalSeconds);
  }
});

// Close modal
document.getElementById('closeModal').addEventListener('click', closeStatisticsModal);

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