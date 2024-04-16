import { CanvasAPI } from "../index";
import "jest-canvas-mock";

describe("CanvasAPI", () => {
  let canvasAPI: CanvasAPI;

  const LOAD_FAILURE_SRC = "LOAD_FAILURE_SRC";
  const LOAD_SUCCESS_SRC = "LOAD_SUCCESS_SRC";

  beforeAll(() => {
    // Mocking Image.prototype.src to call the onload or onerror
    // callbacks depending on the src passed to it
    Object.defineProperty(global.Image.prototype, "src", {
      // Define the property setter
      set(src) {
        if (src === LOAD_FAILURE_SRC) {
          // Call with setTimeout to simulate async loading
          setTimeout(() => this.onerror(new Error("mocked error")));
        } else if (src === LOAD_SUCCESS_SRC) {
          setTimeout(() => this.onload());
        }
      },
    });
  });

  it("Calls onError when passed bad src", (done) => {
    const onError = (ev: Error) => {
      expect(ev).toBeInstanceOf(Error);

      // Indicate to Jest that the test has finished
      done();
    };

    // mount(<ImageComponent onError={onError} src={LOAD_FAILURE_SRC} />);
  });

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("id", "canvas");
    document.body.appendChild(canvas);
    canvasAPI = new CanvasAPI(canvas);
  });

  afterEach(() => {
    const canvas = document.getElementById("canvas");
    if (canvas) {
      document.body.removeChild(canvas);
    }
  });

  test("async test", async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });

  it("should draw rectangle correctly", () => {
    canvasAPI.drawRectangle(10, 10, 50, 50, "red");
    expect(canvasAPI.ctx.fillStyle).toBe("#ff0000");
    expect(canvasAPI.ctx.fillRect).toHaveBeenCalledWith(10, 10, 50, 50);
  });

  it("should load image correctly", async () => {
    const imgPath = "sample.png";
    let ret = await canvasAPI.loadImage(imgPath);
    console.log(ret);
    expect(canvasAPI.image).not.toBeNull();
  });

  // Add more test cases for other methods
});
