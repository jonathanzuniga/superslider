import * as PIXI from "pixi.js";
import fit from "math-fit";
import gsap from "gsap";
import disp from "./displacement.jpg";

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
            backgroundColor: 0xffffff,
            resizeTo: window,
        });

        document.body.appendChild(this.app.view);

        this.margin = 50;
        this.scroll = 0;
        this.scrollTarget = 0;
        this.width = (window.innerWidth - 2 * this.margin) / 3;
        this.height = window.innerHeight * 0.8;
        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);
        this.images = [t1, t2, t3, t4, t5, t6];
        this.WHOLEWIDTH = this.images.length * (this.width + this.margin);

        loadImages(this.images, (images) => {
            // console.log(images);

            this.loadedImages = images;

            this.add();
            this.render();
            this.scrollEvent();
            this.addFilter();
        });
    }

    scrollEvent() {
        document.addEventListener("mousewheel", (event) => {
            // console.log(event);

            this.scrollTarget = event.wheelDelta / 3;
        });
    }

    addFilter() {
        this.displacementSprite = PIXI.Sprite.from(disp);
        this.app.stage.addChild(this.displacementSprite);

        const target = {
            w: 512,
            h: 512,
        };

        const parent = {
            w: innerWidth,
            h: innerHeight,
        };

        const cover = fit(target, parent);

        this.displacementSprite.position.set(cover.left, cover.top);
        this.displacementSprite.scale.set(cover.scale, cover.scale);

        this.displacementFilter = new PIXI.filters.DisplacementFilter(
            this.displacementSprite
        );

        this.displacementFilter.x = 0;
        this.displacementFilter.y = 0;

        this.container.filters = [this.displacementFilter];
    }

    add() {
        const parent = {
            w: this.width,
            h: this.height,
        };

        this.thumbs = [];

        this.loadedImages.forEach(async (img, index) => {
            const texture = await PIXI.Texture.fromURL(img.path);
            const sprite = new PIXI.Sprite(texture);
            const container = new PIXI.Container();
            const spriteContainer = new PIXI.Container();
            const mask = new PIXI.Sprite(PIXI.Texture.WHITE);

            mask.width = this.width;
            mask.height = this.height;

            sprite.mask = mask;
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

            spriteContainer.addChild(sprite);

            container.on("mouseover", this.mouseOn);
            container.on("mouseout", this.mouseOut);
            container.addChild(spriteContainer);
            container.addChild(mask);

            this.container.addChild(container);
            this.thumbs.push(container);
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

    calcPos(scr, pos) {
        let temp =
            ((scr + pos + this.WHOLEWIDTH + this.width + this.margin) %
                this.WHOLEWIDTH) -
            this.width -
            this.margin;

        return temp;
    }

    render() {
        this.app.ticker.add(() => {
            this.app.renderer.render(this.container);

            this.direction = this.scroll > 0 ? -1 : 1;

            this.scroll -= (this.scroll - this.scrollTarget) * 0.1;
            this.scroll *= 0.8;

            this.thumbs.forEach((th) => {
                th.position.x = this.calcPos(this.scroll, th.position.x);
            });

            this.displacementFilter.scale.x =
                3 * this.direction * Math.abs(this.scroll);
        });
    }
}

new Sketch();
