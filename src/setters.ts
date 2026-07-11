import * as C from "./lib/config.ts";
import * as T from "./lib/types.ts";

////////////////////////////////////////////////////////////
// SETTERS
////////////////////////////////////////////////////////////

/**
 *  Compose the imageCanvas.
 */
export const setImageCanvas = async (
  args: { image: ImageBitmap },
  canvasWithCtx: T.OffScreenCanvasWithCtx,
) => {
  const imageWidth = args.image.width;
  const imageHeight = args.image.height;
  const canvas = canvasWithCtx.value;
  const ctx = canvasWithCtx.ctx;

  // Resize the original image to fit in the square. The result image must be a square due to an aesthetic reason.
  const scale = C.imageSize / Math.max(imageWidth, imageHeight);

  const resizedImage = await createImageBitmap(args.image, {
    resizeWidth: imageWidth * scale,
    resizeHeight: imageHeight * scale,
    resizeQuality: "high",
  });

  // Resize the original image to fill the gap in the square. This resized image works as a blurred background.
  const backgroundScale = C.imageSize / Math.min(imageWidth, imageHeight);

  const backgroundImage = await createImageBitmap(args.image, {
    resizeWidth: imageWidth * backgroundScale,
    resizeHeight: imageHeight * backgroundScale,
    resizeQuality: "high",
  });

  // Render the blurred background.
  canvas.width = C.imageSize;
  canvas.height = C.imageSize;

  ctx.filter = `blur(${C.blurStrength}px)`;

  ctx.drawImage(
    backgroundImage,
    backgroundImage.width > C.imageSize
      ? (C.imageSize - backgroundImage.width) / 2
      : 0,
    backgroundImage.height > C.imageSize
      ? (C.imageSize - backgroundImage.height) / 2
      : 0,
  );

  // Render the resized image on the blurred background.
  ctx.filter = "none";

  ctx.drawImage(
    resizedImage,
    resizedImage.width < C.imageSize
      ? (C.imageSize - resizedImage.width) / 2
      : 0,
    resizedImage.height < C.imageSize
      ? (C.imageSize - resizedImage.height) / 2
      : 0,
  );
};

/**
 * Compose the captionCanvas.
 */
export const setCaptionCanvas = (
  args: { caption: string; fontSize: number; captionAlign: string },
  canvasWithCtx: T.OffScreenCanvasWithCtx,
) => {
  const canvas = canvasWithCtx.value;
  const ctx = canvasWithCtx.ctx;

  // Measure the metrics of the font.
  const metrics = ctx.measureText("");

  const ascent = metrics.fontBoundingBoxAscent;
  const descent = metrics.fontBoundingBoxDescent;

  // Define the canvas size.
  const lines = args.caption.split("\n");

  canvas.width = C.imageSize;
  canvas.height = lines.length * (ascent + descent) + descent;

  // Render the caption.
  ctx.font = `${C.fontWidth} ${args.fontSize}px '${C.fontFamily}'`;
  ctx.fillStyle = "white";
  ctx.textAlign = args.captionAlign as CanvasTextAlign;

  const x =
    args.captionAlign === "left"
      ? 0
      : args.captionAlign === "center"
        ? C.imageSize / 2
        : args.captionAlign === "right"
          ? C.imageSize
          : 0;

  lines.forEach((line, i) => {
    ctx.fillText(line, x, (ascent + descent) * (i + 1));
  });
};

/**
 * Compose the backgroundCanvas.
 */
export const setBackgroundCanvas = (
  args: { captionCanvas: T.OffScreenCanvasWithCtx },
  canvasWithCtx: T.OffScreenCanvasWithCtx,
) => {
  const captionHeight = args.captionCanvas.value.height;
  const canvas = canvasWithCtx.value;
  const ctx = canvasWithCtx.ctx;

  // Define the canvas size.
  canvas.width = C.imageSize + C.imageBorderWidth * 2;
  canvas.height = C.imageSize + captionHeight + C.imageBorderWidth * 2;

  //Render the background.
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const isCanvasNotReady = (canvas: HTMLCanvasElement | OffscreenCanvas) => {
  return canvas.width === 0;
};

/**
 * Render the final image.
 */
export const setCanvas = (
  args: {
    imageCanvas: T.OffScreenCanvasWithCtx;
    captionCanvas: T.OffScreenCanvasWithCtx;
    backgroundCanvas: T.OffScreenCanvasWithCtx;
  },
  canvasWithCtx: T.CanvasWithCtx,
) => {
  const canvas = canvasWithCtx.value;
  const ctx = canvasWithCtx.ctx;

  // Make sure the both layers are ready.
  if (
    isCanvasNotReady(args.imageCanvas.value) ||
    isCanvasNotReady(args.imageCanvas.value)
  )
    return;

  // Define the canvas size.
  canvas.width = args.backgroundCanvas.value.width;
  canvas.height = args.backgroundCanvas.value.height;

  // Render all the layers.
  ctx.drawImage(args.backgroundCanvas.value, 0, 0);
  ctx.drawImage(args.imageCanvas.value, C.imageBorderWidth, C.imageBorderWidth);
  ctx.drawImage(
    args.captionCanvas.value,
    C.imageBorderWidth,
    C.imageSize + C.imageBorderWidth,
  );
};

/**
 * Activate one of the align buttons.
 */
export const setAlignButtons =
  (args: { captionAlign: string }, alignButtons: T.AlignButtons) => {
    for (const [align, button] of Object.entries(alignButtons)) {
      if (align === args.captionAlign) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    }
  };

/**
 * Handles the events of "saveImage".
 */
export const setSaveImage =
  (args: {
    command: string;
    canvas: T.CanvasWithCtx;
    enterFileName: HTMLInputElement;
  }, saveImage: HTMLDialogElement) => {
      const command = args.command;

      // Open the dialog.
      if (command === "open") {
        saveImage.showModal();
        return;
      }

      // Close the dialog.
      if (command === "close") {
        saveImage.close();
        return;
      }

      // Save the final image.
      if (command === "save") {
        // Define the file name.
        const fileName =
          args.enterFileName.value !== ""
            ? args.enterFileName.value
            : C.defaultFileName;

        // Add an extention to the file name.
        const fileNameWithExtension =
          fileName.endsWith(".png") || fileName.endsWith(".PNG")
            ? fileName
            : fileName + ".png";

        // Create a link element.
        const link = document.createElement("a");

        // Set up the url to final image data.
        link.href = args.canvas.value.toDataURL("image/png");

        // Set up the file name.
        link.download = fileNameWithExtension;

        // Save the final image.
        link.click();

        // Close the dialog.
        saveImage.close();
        return;
      }
    };

/**
 * Make a HTML element invisible.
 */
export const setDragAndDropGuide = (element: HTMLElement) => {
  element.style.display = "none";
};
