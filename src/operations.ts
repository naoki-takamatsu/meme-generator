////////////////////////////////////////////////////////////
// CONSTANTS
////////////////////////////////////////////////////////////

// The width and height of the "imageCanvas".
const imageSize = 1024;

// The width of the border around the image.
const imageBorderWidth = 18;

// The strength of blur that is applied to fill the gap in the "imageCanvas".
const blurStrength = 25;

// The font width that is used for the "captionCanvas".
const fontWidth = "700";

// The font family that is used for the "captionCanvas".
const fontFamily = "Noto Serif JP";

////////////////////////////////////////////////////////////
// OPERATIONS
////////////////////////////////////////////////////////////

// Load a image from a dragged and dropped file.
export const loadDroppedImage = async (e: DragEvent) => {
  const file = e.dataTransfer?.files[0];

  return file?.type.startsWith("image/")
    ? await createImageBitmap(file)
    : undefined;
};

// Load a image from an uploaded file.
export const loadUploadedImage = async (input: HTMLInputElement) => {
  const file = input?.files?.[0];

  return file ? await createImageBitmap(file) : undefined;
};

// Load a image from the clipboard.
export const loadClipboardImage = async () => {
  const items = await navigator.clipboard.read();

  for (const item of items) {
    const type = item.types.find((type) => type.startsWith("image/"));

    if (!type) continue;

    const blob = await item.getType(type);

    return createImageBitmap(blob);
  }

  return undefined;
};

// Compose the imageCanvas.
export const composeImage =
  (canvas: OffscreenCanvas) =>
    (ctx: OffscreenCanvasRenderingContext2D) =>
      async (image: ImageBitmap) => {
        // Resize the original image to fit in the square. The result image must be a square due to an aesthetic reason.
        const scale = imageSize / Math.max(image.width, image.height);

        const resizedImage = await createImageBitmap(image, {
          resizeWidth: image.width * scale,
          resizeHeight: image.height * scale,
          resizeQuality: "high",
        });

        // Resize the original image to fill the gap in the square. This resized image works as a blurred background.
        const backgroundScale = imageSize / Math.min(image.width, image.height);

        const backgroundImage = await createImageBitmap(image, {
          resizeWidth: image.width * backgroundScale,
          resizeHeight: image.height * backgroundScale,
          resizeQuality: "high",
        });

        // Render the blurred background.
        canvas.width = imageSize;
        canvas.height = imageSize;

        ctx.filter = `blur(${blurStrength}px)`;

        ctx.drawImage(
          backgroundImage,
          backgroundImage.width > imageSize
            ? (imageSize - backgroundImage.width) / 2
            : 0,
          backgroundImage.height > imageSize
            ? (imageSize - backgroundImage.height) / 2
            : 0,
        );

        // Render the resized image on the blurred background.
        ctx.filter = "none";

        ctx.drawImage(
          resizedImage,
          resizedImage.width < imageSize ? (imageSize - resizedImage.width) / 2 : 0,
          resizedImage.height < imageSize
            ? (imageSize - resizedImage.height) / 2
            : 0,
        );
      };

// Compose the captionCanvas
export const composeCaption =
  (canvas: OffscreenCanvas) =>
    (ctx: OffscreenCanvasRenderingContext2D) =>
      (caption: string) =>
        (fontSize: number) => {
          // Measure the metrics of the font.
          const metrics = ctx.measureText("");

          const ascent = metrics.fontBoundingBoxAscent;
          const descent = metrics.fontBoundingBoxDescent;

          // Define the canvas size.
          const lines = caption.split("\n");

          canvas.width = imageSize;
          canvas.height = lines.length * (ascent + descent) + descent;

          // Render the caption.
          ctx.font = `${fontWidth} ${fontSize}px '${fontFamily}'`;
          ctx.fillStyle = "white";

          lines.forEach((line, i) => {
            ctx.fillText(line, 0, (ascent + descent) * (i + 1));
          });
        };

// Compose the backgroundCanvas.
export const composeBackground =
  (canvas: OffscreenCanvas) =>
    (ctx: OffscreenCanvasRenderingContext2D) =>
      (captionCanvas: OffscreenCanvas) => {
        // Define the canvas size.
        canvas.width = imageSize + imageBorderWidth * 2;
        canvas.height = imageSize + captionCanvas.height + imageBorderWidth * 2;

        //Render the background.
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      };

// The type that is used for the argument of the "renderCanvas".
type Layers = {
  image: OffscreenCanvas;
  caption: OffscreenCanvas;
  background: OffscreenCanvas;
};

// Render the final image.
export const renderCanvas =
  (canvas: HTMLCanvasElement) =>
    (ctx: CanvasRenderingContext2D) =>
      (layers: Layers) => {
        // Make sure the both layers are ready.
        if (layers.image.width === 0 || layers.caption.width === 0) return;

        // Define the canvas size.
        canvas.width = layers.background.width;
        canvas.height = layers.background.height;

        // Render all the layers.
        ctx.drawImage(layers.background, 0, 0);
        ctx.drawImage(layers.image, imageBorderWidth, imageBorderWidth);
        ctx.drawImage(
          layers.caption,
          imageBorderWidth,
          imageSize + imageBorderWidth,
        );
      };
