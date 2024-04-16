export class CanvasAPI {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  image: HTMLImageElement | null;
  scale: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d")!;
    this.image = null;
    this.scale = 1;
  }

  loadImage(src: string): Promise<void> {
    console.log("loadImage started.");
    console.log(this.ctx);
    return new Promise((resolve, reject) => {
      this.image = new Image();
      this.image.src = src;
      console.log("image", this.image.src, this.image);
      this.image.onload = () => {
        if (this.image) {
          let width = this.image.width;
          let height = this.image.height;
          this.ctx.drawImage(this.image, 0, 0, width, height);
        }
        resolve();
      };
      this.image.onerror = (error) => {
        reject(error);
      };
    });
  }

  drawRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  drawPolyline(points: [number, number][], color: string): void {
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i][0], points[i][1]);
    }
    this.ctx.stroke();
  }

  drawClosedPolyline(points: [number, number][], color: string): void {
    this.drawPolyline(points.concat([points[0]]), color);
  }

  drawPoint(x: number, y: number, size: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  setScale(scale: number): void {
    this.scale = scale;
    this.clearCanvas();
    if (this.image) {
      this.ctx.drawImage(
        this.image,
        0,
        0,
        this.image.width * scale,
        this.image.height * scale
      );
    }
  }
}
