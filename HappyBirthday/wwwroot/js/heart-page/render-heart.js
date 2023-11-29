const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;
const CANVAS_CENTER_X = CANVAS_WIDTH / 2;
const CANVAS_CENTER_Y = CANVAS_HEIGHT / 2;
const IMAGE_ENLARGE = 11;
const HEART_COLOR = configRepo.COLOR_HEART;

function createHeart(t, shrink_ratio = IMAGE_ENLARGE) {
    let x = 16 * (Math.sin(t) ** 3);
    let y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

    x *= shrink_ratio;
    y *= shrink_ratio;

    x += CANVAS_CENTER_X;
    y += CANVAS_CENTER_Y;
    return [Math.floor(x), Math.floor(y)];
}

function fillScatterInside(x, y, beta = 0.15) {
    const ratio_x = -beta * Math.log(Math.random());
    const ratio_y = -beta * Math.log(Math.random());
    const dx = ratio_x * (x - CANVAS_CENTER_X);
    const dy = ratio_y * (y - CANVAS_CENTER_Y);
    return [x - dx, y - dy];
}

function shrink(x, y, ratio) {
    const force = -1 / (((x - CANVAS_CENTER_X) ** 2 + (y - CANVAS_CENTER_Y) ** 2) ** 0.6);
    const dx = ratio * force * (x - CANVAS_CENTER_X);
    const dy = ratio * force * (y - CANVAS_CENTER_Y);
    return [x - dx, y - dy];
}

function curve(p) {
    return 2 * (2 * Math.sin(4 * p)) / (2 * Math.PI);
}

class Heart {
    constructor(generate_frame = 20) {
        this._points = new Set();
        this._edge_diffusion_points = new Set();
        this._center_diffusion_points = new Set();
        this.all_points = {};
        this.build(configRepo.TIME_SECOND_HEART * 1000);
        this.random_halo = 1000;
        this.generate_frame = generate_frame;
        for (let frame = 0; frame < generate_frame; frame++) {
            this.calc(frame);
        }
    }

    build(number) {
        for (let i = 0; i < number; i++) {
            const t = Math.random() * 2 * Math.PI;
            const [x, y] = createHeart(t);
            this._points.add([x, y]);
        }

        const pointList = Array.from(this._points);
        for (let [_x, _y] of pointList) {
            for (let i = 0; i < 3; i++) {
                const [x, y] = fillScatterInside(_x, _y, 0.05);
                this._edge_diffusion_points.add([x, y]);
            }
        }

        for (let i = 0; i < 4000; i++) {
            const [x, y] = pointList[Math.floor(Math.random() * pointList.length)];
            const [newX, newY] = fillScatterInside(x, y, 0.17);
            this._center_diffusion_points.add([newX, newY]);
        }
    }

    calc_position(x, y, ratio) {
        const force = 1 / (((x - CANVAS_CENTER_X) ** 2 + (y - CANVAS_CENTER_Y) ** 2) ** 0.520);
        const dx = ratio * force * (x - CANVAS_CENTER_X) + Math.floor(Math.random() * 3) - 1;
        const dy = ratio * force * (y - CANVAS_CENTER_Y) + Math.floor(Math.random() * 3) - 1;
        return [x - dx, y - dy];
    }

    calc(generate_frame) {
        const ratio = 10 * curve((generate_frame / 10) * Math.PI);
        const halo_radius = 4 + 6 * (1 + curve((generate_frame / 10) * Math.PI));
        const halo_number = 3000 + 4000 * Math.abs(curve((generate_frame / 10) * Math.PI) ** 2);
        const all_points = [];

        const heart_halo_point = new Set();
        for (let i = 0; i < halo_number; i++) {
            const t = Math.random() * 2 * Math.PI;
            let [x, y] = createHeart(t, 11.6);
            [x, y] = shrink(x, y, halo_radius);
            if (!heart_halo_point.has([x, y])) {
                heart_halo_point.add([x, y]);
                x += Math.floor(Math.random() * 29) - 14;
                y += Math.floor(Math.random() * 29) - 14;
                const size = Math.floor(Math.random() * 2) + 1;
                all_points.push([x, y, size]);
            }
        }

        for (let [x, y] of this._points) {
            [x, y] = this.calc_position(x, y, ratio);
            const size = Math.floor(Math.random() * 3) + 1;
            all_points.push([x, y, size]);
        }

        for (let [x, y] of this._edge_diffusion_points) {
            [x, y] = this.calc_position(x, y, ratio);
            const size = Math.floor(Math.random() * 2) + 1;
            all_points.push([x, y, size]);
        }

        for (let [x, y] of this._center_diffusion_points) {
            [x, y] = this.calc_position(x, y, ratio);
            const size = Math.floor(Math.random() * 2) + 1;
            all_points.push([x, y, size]);
        }

        this.all_points[generate_frame] = all_points;
    }

    render(render_canvas, render_frame) {
        for (let [x, y, size] of this.all_points[render_frame % this.generate_frame]) {
            render_canvas.fillStyle = HEART_COLOR;
            render_canvas.fillRect(x, y, size, size);
        }
    }
}

function draw(render_canvas, render_heart, render_frame = 0) {
    render_canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    render_heart.render(render_canvas, render_frame);
    requestAnimationFrame(() => draw(render_canvas, render_heart, render_frame + 1));
}

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvas.style.backgroundColor = configRepo.BACK_GROUND_HEART;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const heart = new Heart();
    draw(ctx, heart);
});
