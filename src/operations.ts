////////////////////////////////////////////////////////////
// CONSTANTS
////////////////////////////////////////////////////////////

// Width and height of the "imageCanvas".
const imageSize = 1024;

// Width of the border around the image.
const imageBorderWidth = 18;

// Strength of blur that is applied to fill the gap in the "imageCanvas".
const blurStrength = 25;

// Font width that is used for the "captionCanvas".
const fontWidth = "700";

// Font family that is used for the "captionCanvas".
const fontFamily = "Noto Serif JP";

// Default file name for the image saving.
const defaultFileName = "meme";

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

// True if an image is "undefined".
export const isImageUndefined = (
  image: ImageBitmap | undefined,
): image is undefined => {
  return typeof image === "undefined";
};

// Make a HTML element invisible.
export const hideHtmlElement = (element: HTMLElement) => {
  element.style.display = "none";
};

// Activate one of the align buttons.
export const activateAlignButton =
  (buttons: Array<HTMLButtonElement>) => (direction: string) => {
    for (const button of buttons) {
      if (button.id === `align-${direction}`) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    }
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

type CaptionOptions = {
  caption: string;
  fontSize: number;
  captionAlign: string;
};

// Compose the captionCanvas
export const composeCaption =
  (canvas: OffscreenCanvas) =>
    (ctx: OffscreenCanvasRenderingContext2D) =>
      (options: CaptionOptions) => {
        // Measure the metrics of the font.
        const metrics = ctx.measureText("");

        const ascent = metrics.fontBoundingBoxAscent;
        const descent = metrics.fontBoundingBoxDescent;

        // Define the canvas size.
        const lines = options.caption.split("\n");

        canvas.width = imageSize;
        canvas.height = lines.length * (ascent + descent) + descent;

        // Render the caption.
        ctx.font = `${fontWidth} ${options.fontSize}px '${fontFamily}'`;
        ctx.fillStyle = "white";
        ctx.textAlign = options.captionAlign as CanvasTextAlign;

        const x =
          options.captionAlign === "left"
            ? 0
            : options.captionAlign === "center"
              ? imageSize / 2
              : options.captionAlign === "right"
                ? imageSize
                : 0;

        lines.forEach((line, i) => {
          ctx.fillText(line, x, (ascent + descent) * (i + 1));
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

// Type that is used for the argument of the "renderCanvas".
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

// Arguments for handling the "saveImage".
type SaveImageArguments = {
  saveImage: HTMLDialogElement;
  canvas: HTMLCanvasElement;
  enterFileName: HTMLInputElement;
};

// Handles the events of "saveImage".
export const handleSaveImage =
  (input: string) => (args: SaveImageArguments) => {
    // Open the dialog.
    if (input === "open") {
      args.saveImage.showModal();
      return;
    }

    // Close the dialog.
    if (input === "close") {
      args.saveImage.close();
      return;
    }

    // Save the final image.
    if (input === "save") {
      // Define the file name.
      const fileName =
        args.enterFileName.value !== ""
          ? args.enterFileName.value
          : defaultFileName;

      // Add an extention to the file name.
      const fileNameWithExtension =
        fileName.endsWith(".png") || fileName.endsWith(".PNG")
          ? fileName
          : fileName + ".png";

      // Create a link element.
      const link = document.createElement("a");

      // Set up the url to final image data.
      link.href = args.canvas.toDataURL("image/png");

      // Set up the file name.
      link.download = fileNameWithExtension;

      // Save the final image.
      link.click();

      // Close the dialog.
      args.saveImage.close();
      return;
    }
  };
