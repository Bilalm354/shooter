import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { EdgesGeometry, LineSegments, LineBasicMaterial } from "three";

function init() {
  let scene, camera, renderer, cube;
  let moveForward = false;
  let moveBackward = false;
  let moveLeft = false;
  let moveRight = false;
  let canJump = false;
  let prevTime = performance.now();
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const objects = [];

  const playerBox = new THREE.Box3();
  const objectBox = new THREE.Box3();

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  function onKeyDown(event) {
    switch (event.code) {
      case "KeyW":
        moveForward = true;
        break;
      case "KeyA":
        moveLeft = true;
        break;
      case "KeyS":
        moveBackward = true;
        break;
      case "KeyD":
        moveRight = true;
        break;
      case "Space":
        if (canJump) velocity.y += 350;
        canJump = false;
        break;
    }
  }

  function onKeyUp(event) {
    switch (event.code) {
      case "KeyW":
        moveForward = false;
        break;
      case "KeyA":
        moveLeft = false;
        break;
      case "KeyS":
        moveBackward = false;
        break;
      case "KeyD":
        moveRight = false;
        break;
    }
  }

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 20, -30);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.physicallyCorrectLights = true;
  document.body.appendChild(renderer.domElement);

  // Controls
  const controls = new PointerLockControls(camera, document.body);
  document.addEventListener("click", () => controls.lock());
  scene.add(controls.getObject());

  // Lighting (brighter)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // brighter ambient
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1.5, 100); // brighter key light
  pointLight.position.set(0, 15, 0);
  pointLight.castShadow = true;
  pointLight.shadow.mapSize.set(1024, 1024);
  scene.add(pointLight);

  const fillLight = new THREE.PointLight(0xaaaaff, 0.6, 100);
  fillLight.position.set(20, 10, 10);
  scene.add(fillLight);

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ color: 0x444444 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  objects.push(floor);

  // Room
  const roomSize = 50;
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(roomSize, roomSize, roomSize),
    new THREE.MeshStandardMaterial({ color: 0x8888aa, side: THREE.BackSide })
  );
  scene.add(room);
  objects.push(room);

  // Room edges
  const edges = new EdgesGeometry(
    new THREE.BoxGeometry(roomSize, roomSize, roomSize)
  );
  const line = new LineSegments(
    edges,
    new LineBasicMaterial({ color: 0x000000 })
  );
  scene.add(line);

  // Cube obstacle
  cube = new THREE.Mesh(
    new THREE.BoxGeometry(5, 5, 5),
    new THREE.MeshStandardMaterial({ color: 0x00ff00 })
  );
  cube.position.set(0, 2.5, -10);
  cube.castShadow = true;
  cube.receiveShadow = true;
  scene.add(cube);
  objects.push(cube);

  // Animation loop
  renderer.setAnimationLoop(() => {
    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    if (controls.isLocked === true) {
      // Gravity
      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;
      velocity.y -= 9.8 * 100.0 * delta;

      direction.z = Number(moveForward) - Number(moveBackward);
      direction.x = Number(moveRight) - Number(moveLeft);
      direction.normalize();

      if (moveForward || moveBackward)
        velocity.z -= direction.z * 400.0 * delta;
      if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

      // Save original position
      const oldPosition = controls.getObject().position.clone();

      // Apply movement
      controls.moveRight(-velocity.x * delta);
      controls.moveForward(-velocity.z * delta);
      controls.getObject().position.y += velocity.y * delta;

      // Basic ground check
      if (controls.getObject().position.y < 20) {
        velocity.y = 0;
        controls.getObject().position.y = 20;
        canJump = true;
      }

      // Collision detection
      playerBox.setFromCenterAndSize(
        controls.getObject().position,
        new THREE.Vector3(1, 4, 1)
      );

      for (let i = 0; i < objects.length; i++) {
        objectBox.setFromObject(objects[i]);
        if (playerBox.intersectsBox(objectBox)) {
          controls.getObject().position.copy(oldPosition); // simple resolution
          velocity.x = 0;
          velocity.z = 0;
          break;
        }
      }
    }

    prevTime = time;

    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  });
}

init();
