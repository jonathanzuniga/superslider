import * as PIXI from "pixi.js";
import fit, { contain } from "math-fit";
import gsap from "gsap";

const t1 = "https://picsum.photos/1024/1024?grayscale";
const t2 = "https://picsum.photos/1024/1024?grayscale";
const t3 = "https://picsum.photos/1024/1024?grayscale";
const t4 = "https://picsum.photos/1024/1024?grayscale";
const t5 = "https://picsum.photos/1024/1024?grayscale";
const t6 = "https://picsum.photos/1024/1024?grayscale";

function loadImages(paths, whenLoaded) {
    const imgs = [];
    const imgO = [];
    paths.forEach(function (path) {
        const img = new Image();
        img.onload = function () {
            imgs.push(img);
            imgO.push({ path, img });
            if (imgs.length === paths.length) whenLoaded(imgO);
        };
        img.src = path;
    });
}

class Sketch {
    constructor() {
        this.app = new PIXI.Application({
            backgroundColor: 0x1099bb,
            resizeTo: window,
        });

        document.body.appendChild(this.app.view);

        this.margin = 50;
        this.scroll = 0;
        this.width = (window.innerWidth - 2 * this.margin) / 3;
        this.height = window.innerHeight * 0.8;
        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);
        this.images = [t1, t2, t3, t4, t5, t6];

        loadImages(this.images, (images) => {
            // console.log(images);

            this.loadedImages = images;

            this.add();
            this.render();
            this.scrollEvent();
        });
    }

    scrollEvent() {
        document.addEventListener("mousewheel", (event) => {
            // console.log(event);

            this.scroll = event.wheelDelta;
        });
    }

    add() {
        const parent = {
            w: this.width,
            h: this.height,
        };

        this.loadedImages.forEach(async (img, index) => {
            const texture = await PIXI.Texture.fromURL(img.path);
            const sprite = new PIXI.Sprite(texture);
            const container = new PIXI.Container();
            const spriteContainer = new PIXI.Container();
            const mask = new PIXI.Sprite(PIXI.Texture.WHITE);

            mask.width = this.width;
            mask.height = this.height;

            sprite.mask = mask;

            // sprite.width = 100;
            // sprite.height = 100;

            sprite.anchor.set(0.5);

            // console.log(sprite);

            sprite.position.set(
                sprite.texture.orig.width / 2,
                sprite.texture.orig.height / 2
            );

            const image = {
                w: sprite.texture.orig.width,
                h: sprite.texture.orig.height,
            };

            const cover = fit(image, parent);

            // console.log(cover);

            spriteContainer.position.set(cover.left, cover.top);
            spriteContainer.scale.set(cover.scale, cover.scale);

            container.x = (this.margin + this.width) * index;
            container.y = this.height / 10;
            container.interactive = true;
            container.on("mouseover", this.mouseOn);
            container.on("mouseout", this.mouseOut);

            spriteContainer.addChild(sprite);
            container.addChild(spriteContainer);
            container.addChild(mask);

            this.container.addChild(container);
        });
    }

    mouseOn(event) {
        const el = event.target.children[0].children[0];

        // console.log(el);

        gsap.to(el.scale, { duration: 1, x: 1.1, y: 1.1 });
    }

    mouseOut(event) {
        const el = event.currentTarget.children[0].children[0];

        // console.log(el);

        gsap.to(el.scale, { duration: 1, x: 1, y: 1 });
    }

    render() {
        this.app.ticker.add(() => {
            this.app.renderer.render(this.container);
        });
    }
}

new Sketch();
