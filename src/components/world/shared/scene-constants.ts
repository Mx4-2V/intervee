import * as THREE from "three";

export const CAMERA_OFFSET = new THREE.Vector3(18, 18, 18);
export const CAMERA_FORWARD = new THREE.Vector3(-1, 0, -1).normalize();
export const CAMERA_RIGHT = new THREE.Vector3(1, 0, -1).normalize();
export const GRID_SIZE = 1;
export const JUMP_FORCE = 8;
export const MOVE_SPEED = 5.5;
export const PLAYER_SPAWN_POSITION: [number, number, number] = [0, 0, 0];
export const SHOW_COORDS = true;

export function snapValue(value: number) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}
