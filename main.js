import * as THREE from "three";
import { Vector3 } from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

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
  const vertex = new THREE.Vector3();
  const color = new THREE.Color();
  const objects = [];

  const onKeyDown = function (event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = true;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = true;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = true;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = true;
        break;

      case "Space":
        if (canJump === true) velocity.y += 350;
        canJump = false;
        break;
    }
  };

  const onKeyUp = function (event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = false;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = false;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = false;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = false;
        break;
    }
  };

  document.addEventListener("keydown", (event) => onKeyDown(event));
  document.addEventListener("keyup", (event) => onKeyUp(event));

  const raycaster = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(0, -1, 0),
    0,
    10
  );

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const controls = new PointerLockControls(camera, document.body);

  document.addEventListener("click", () => {
    controls.lock();
  });

  scene.add(controls.object);
  renderer.setAnimationLoop(animate);

  function animate() {
    const time = performance.now();

    if (controls.isLocked === true) {
      // game paused if not clicked on
      raycaster.ray.origin.copy(controls.object.position);
      raycaster.ray.origin.y -= 10;

      const intersections = raycaster.intersectObjects(objects, false);

      const onObject = intersections.length > 0;

      const delta = (time - prevTime) / 1000;

      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;

      velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

      direction.z = Number(moveForward) - Number(moveBackward);
      direction.x = Number(moveRight) - Number(moveLeft);
      direction.normalize(); // this ensures consistent movements in all directions

      if (moveForward || moveBackward)
        velocity.z -= direction.z * 400.0 * delta;
      if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

      if (onObject === true) {
        velocity.y = Math.max(0, velocity.y);
        canJump = true;
      }

      controls.moveRight(-velocity.x * delta);
      controls.moveForward(-velocity.z * delta);

      controls.object.position.y += velocity.y * delta; // new behavior

      if (controls.object.position.y < 0) {
        velocity.y = 0;
        controls.object.position.y = 0;

        canJump = true;
      }
    }

    prevTime = time;
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
}

init();
