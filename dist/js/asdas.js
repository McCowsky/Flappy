"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ctx = canvas.querySelector('canvas');
canvas.width = innerWidth - 4;
canvas.height = innerHeight - 4;
requestAnimationFrame(mainLoop); // starts the animation
const gravity = { x: 0, y: 0.1 };
const ground = ctx.canvas.height; // ground at bottom of canvas.
const bounce = 0.9; // very bouncy
const object = {
    pos: { x: ctx.canvas.width / 2, y: 0 },
    vel: { x: 0, y: 0 },
    size: { w: 10, h: 10 },
    update() {
        this.vel.x += gravity.x;
        this.vel.y += gravity.y;
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        const g = ground - this.size.h; // adjust for size
        if (this.pos.y >= g) {
            this.pos.y = g - (this.pos.y - g); //
            this.vel.y = -Math.abs(this.vel.y) * bounce;
            if (this.vel.y >= -gravity.y) {
                // check for rest.
                this.vel.y = 0;
                this.pos.y = g - gravity.y;
            }
        }
    },
    draw() {
        ctx.fillRect(this.pos.x, this.pos.y, this.size.w, this.size.h);
    },
    reset() {
        this.pos.y = this.vel.y = this.vel.x = 0;
    },
};
function mainLoop() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    object.update(); // move object
    object.draw();
    requestAnimationFrame(mainLoop);
}
canvas.addEventListener("click", object.reset.bind(object));
