// GAME SETTING
const GRAVITY: number = 0.1;
const SPACE_BETWEEN_WALLS: number = 195;

const scoreBox = document.getElementById("scoreBox") as HTMLDivElement;
const container = document.getElementById("canvasContainer") as HTMLDivElement;
const menuBox = document.getElementById("menuBox") as HTMLDivElement;
const hudBack = document.getElementById("hudBack") as HTMLButtonElement;
const mainMenuBox = document.getElementById("mainMenu") as HTMLDivElement;
const menuScoreBox = document.getElementById("menuScoreBox") as HTMLDivElement;
const mainMenuCurrent = document.getElementById("mainMenuCurrent") as HTMLHeadingElement;
const mainMenuBest = document.getElementById("mainMenuBest") as HTMLHeadingElement;
const soundBox1 = document.getElementById("soundBox1") as HTMLDivElement;
const soundBox2 = document.getElementById("soundBox2") as HTMLDivElement;

type GameElements = {
  npc: boolean;
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  size: { w: number; h: number };
  collision: boolean;
  update(): void;
  jump(): void;
  reset(): void;
  drawbird(): void;
  drawpipe(): void;
  drawpipeup(): void;
};

// CANVAS

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
let ctx = canvas?.getContext("2d");
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

//MEDIA

let birdImage = new Image();
birdImage.src = "../../Flappy/dist/img/bird.png";
let pipeImage = new Image();
pipeImage.src = "../../Flappy/dist/img/sprites/pipe-green.png";
let pipeImageUp = new Image();
pipeImageUp.src = "../../Flappy/dist/img/sprites/pipe-green-up.png";
let hitAudio = new Audio("../../Flappy/dist/audio/hit.ogg");
let pointAudio = new Audio("../../Flappy/dist/audio/point.ogg");
let jumpAudio = new Audio("../../Flappy/dist/audio/wing.ogg");

// VARIABLES
const HIGHSCORE = JSON.parse(localStorage.getItem("highscore") || "[]") || [];
const HIGHSCORE2 = HIGHSCORE;
const GROUND: number = canvas.offsetHeight;
const SCREEN_CENTER: number = GROUND / 2;

const MAX_WALL_HEIGHT: number = canvas.offsetHeight - SPACE_BETWEEN_WALLS;
let points: number = 0;
let stopGame: boolean = true;
let stopPoint: boolean = false;
let stopSound: boolean = false;

function randomWallHeight() {
  const RANDOM_WALL_1: number = Math.floor(Math.random() * MAX_WALL_HEIGHT);
  const RANDOM_WALL_2: number = canvas.offsetHeight - RANDOM_WALL_1 - SPACE_BETWEEN_WALLS;
  const RANDOM_WALL_2_START: number = RANDOM_WALL_1 + SPACE_BETWEEN_WALLS;
  return [RANDOM_WALL_1, RANDOM_WALL_2, RANDOM_WALL_2_START];
}

// CLASS DECLARATION

class body {
  npc: boolean;
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  size: { w: number; h: number };
  collision: boolean;
  constructor(
    npc: boolean,
    pos: { x: number; y: number },
    vel: { x: number; y: number },
    size: { w: number; h: number }
  ) {
    this.npc = npc;
    this.pos = pos;
    this.vel = vel;
    this.size = size;
    this.collision = false;
  }
  update() {
    if (this.npc) {
      this.pos.x += this.vel.x;
      if (this.pos.x + 70 <= 0) {
        this.reset();
      }
    } else {
      this.vel.y += GRAVITY;
      this.pos.y += this.vel.y;
      const g = GROUND - this.size.h;
      if (this.pos.y >= g || this.pos.y <= 0) {
        mainMenu();
      }
    }
  }
  drawbird() {
    if (this.collision) mainMenu();
    if (this.npc) return;
    ctx!.drawImage(birdImage, this.pos.x, this.pos.y, this.size.w, this.size.h);
  }
  drawpipe() {
    if (!this.npc) return;
    ctx!.drawImage(pipeImage, this.pos.x, this.pos.y, this.size.w, this.size.h);
  }
  drawpipeup() {
    if (!this.npc) return;
    ctx!.drawImage(pipeImageUp, this.pos.x, this.pos.y, this.size.w, this.size.h);
  }
  jump() {
    if (this.npc) return;
    this.pos.y -= 100;
    this.vel.y = 0;
  }
  reset() {
    if (this.npc) {
      stopPoint = false;
      this.pos.x = canvas.offsetWidth;
      const walls = randomWallHeight();

      gameObjects[1].size.h = walls[0];
      gameObjects[2].pos.y = walls[2];
      gameObjects[2].size.h = walls[1];
    } else {
      this.pos.y = SCREEN_CENTER;
    }
  }
}

// PUTTING OBJECTS INTO ARRAY

let gameObjects: GameElements[] = [];

gameObjects = [
  new body(false, { x: 40, y: SCREEN_CENTER }, { x: 0, y: 0 }, { w: 50, h: 40 }),
  new body(
    true,
    { x: canvas.offsetWidth, y: 0 },
    { x: -2, y: 0 },
    { w: 70, h: (canvas.offsetHeight - 185) / 2 }
  ),
  new body(
    true,
    { x: canvas.offsetWidth, y: (canvas.offsetHeight * 2) / 3 },
    { x: -2, y: 0 },
    { w: 70, h: (canvas.offsetHeight - 185) / 2 }
  ),
];

// COLLISION DETECT FUNCTION

function collisionDetect() {
  let obj1;
  let obj2;

  for (let i = 0; i < gameObjects.length; i++) {
    gameObjects[i].collision = false;
  }

  for (let i = 0; i < gameObjects.length; i++) {
    obj1 = gameObjects[i];

    for (let j = i + 1; j < gameObjects.length; j++) {
      obj2 = gameObjects[j];
      if (
        intersect(
          obj1.pos.x,
          obj1.pos.y,
          obj1.size.w,
          obj1.size.h,
          obj2.pos.x,
          obj2.pos.y,
          obj2.size.w,
          obj2.size.h
        )
      ) {
        obj1.collision = true;
        obj2.collision = true;
      }
    }
  }
}

// CHECKING IF OBJECTS INTERSECT

function intersect(
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number
) {
  // Check x and y for overlap
  if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2) return false;
  return true;
}

// FUNCTION ADDING POINTS

function gameSpeed() {
  if (points % 10 === 0)
    for (let i = 1; i < gameObjects.length; i++) gameObjects[i].vel.x -= 0.5;
}

function pointAdd() {
  if (gameObjects[0].collision === false) {
    if (gameObjects[0].pos.x >= gameObjects[1].pos.x + gameObjects[1].size.w) {
      if (!stopPoint) {
        points++;
        if (!stopSound) pointAudio.play();

        stopPoint = true;
        gameSpeed();
      }
      scoreBox.innerText = points.toString();
    }
  }
}

function sound() {
  if (stopSound) {
    stopSound = false;
    soundBox1.innerText = "Sound on";
    soundBox2.innerText = "Sound on";
  } else {
    stopSound = true;
    soundBox1.innerText = "Sound off";
    soundBox2.innerText = "Sound off";
  }
}

function startOver() {
  mainMenuBox.classList.add("visibility");
  for (let i = 1; i < gameObjects.length; i++) {
    gameObjects[i].pos.x = canvas.offsetWidth;
    gameObjects[i].collision = false;
  }
  gameObjects[0].pos = { x: 40, y: SCREEN_CENTER };
  gameObjects[0].collision = false;
  gameObjects[0].vel.y = 0;
  gameObjects[1].vel.x = -2;
  gameObjects[2].vel.x = -2;
  points = 0;
  scoreBox.innerText = points.toString();
  stopGame = false;
  animate();
}

function start() {
  menuBox?.classList.add("visibility");
  stopGame = false;
  animate();
}
function pause() {
  menuBox?.classList.remove("visibility");
  stopGame = true;
}

function mainMenu() {
  if (!stopSound) hitAudio.play();
  menuBox.classList.add("visibility");
  mainMenuBox.classList.remove("visibility");
  menuScoreBox.classList.remove("visibility");
  stopGame = true;
  mainMenuCurrent.innerText = points.toString();
  mainMenuBest.innerText = HIGHSCORE2;
  if (points != 0) {
    HIGHSCORE.push(points);
    HIGHSCORE.sort((a: string, b: string) => {
      return Number(b) - Number(a);
    });
  }
  HIGHSCORE.splice(1);
  localStorage.setItem("highscore", JSON.stringify(HIGHSCORE));
}

function animate() {
  if (stopGame) return;
  for (let i = 0; i < gameObjects.length; i++) {
    gameObjects[i].update();
  }
  collisionDetect();
  pointAdd();
  ctx?.clearRect(0, 0, innerWidth, innerHeight);
  for (let i = 0; i < gameObjects.length; i++) {
    birdImage.addEventListener(
      "load",
      () => {
        gameObjects[i].drawbird();
      },
      false
    );
    pipeImage.addEventListener(
      "load",
      () => {
        gameObjects[i].drawpipe();
      },
      false
    );
    pipeImageUp.addEventListener(
      "load",
      () => {
        gameObjects[i].drawpipeup();
      },
      false
    );

    gameObjects[i].drawbird();
    if (gameObjects[i] === gameObjects[1]) gameObjects[i].drawpipeup();
    if (gameObjects[i] === gameObjects[2]) gameObjects[i].drawpipe();
  }
  requestAnimationFrame(animate);
}
canvas.addEventListener("click", () => {
  if (!stopSound) jumpAudio.play();
  gameObjects[0].jump();
});
