const imageSize = 1024;
const frameSize = 18;
const blurStrength = 25;
const fontWidth = "700";
const fontFamily = "Noto Serif JP";

export const droppedFileToImage = async (e: DragEvent) => {
  const file = e.dataTransfer?.files[0];

  return file?.type.startsWith("image/")
    ? await createImageBitmap(file)
    : undefined;
};

export const fetchUploadedImage = async (input: HTMLInputElement) => {
  const file = input?.files?.[0];

  return file ? await createImageBitmap(file) : undefined;
};

export const clipboardToImage = async () => {
  const items = await navigator.clipboard.read();
  const itemAndTypes = items.map((item) => ({ item: item, types: item.types }));

  const imageItemAndType = itemAndTypes
    .filter((table) => table.types.some((type) => type.startsWith("image/")))
    .map((table) => ({
      item: table.item,
      types: table.types.find((type) => type.startsWith("image/")),
    }))[0];

  const imageItem = imageItemAndType.item;
  const type = imageItemAndType.types;
  const blob = type ? await imageItem.getType(type) : undefined;

  return blob ? createImageBitmap(blob) : undefined;
};

export const calculateTextFieldHeight = (textField: HTMLTextAreaElement) => {
  const innerTextArea = textField?.shadowRoot?.querySelector('textarea');
  console.log(innerTextArea?.scrollHeight)

  return (innerTextArea?.scrollHeight ?? 0) + "px";
};

export const editImage =
  (canvas: OffscreenCanvas) =>
    (ctx: OffscreenCanvasRenderingContext2D) =>
      async (image: ImageBitmap) => {
        const scale = imageSize / Math.max(image.width, image.height);

        const resizedImage = await createImageBitmap(image, {
          resizeWidth: image.width * scale,
          resizeHeight: image.height * scale,
          resizeQuality: "high",
        });

        const backgroundScale = imageSize / Math.min(image.width, image.height);

        const backgroundImage = await createImageBitmap(image, {
          resizeWidth: image.width * backgroundScale,
          resizeHeight: image.height * backgroundScale,
          resizeQuality: "high",
        });

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

        ctx.filter = "none";

        ctx.drawImage(
          resizedImage,
          resizedImage.width < imageSize ? (imageSize - resizedImage.width) / 2 : 0,
          resizedImage.height < imageSize
            ? (imageSize - resizedImage.height) / 2
            : 0,
        );

        const finalImage = await createImageBitmap(canvas);

        ctx.drawImage(finalImage, 0, 0);
      };

export const editCaption =
  (canvas: OffscreenCanvas) =>
    (ctx: OffscreenCanvasRenderingContext2D) =>
      (caption: string) =>
        (fontSize: number) => {
          const metrics = ctx.measureText("");

          const ascent = metrics.fontBoundingBoxAscent;
          const descent = metrics.fontBoundingBoxDescent;

          const lines = caption.split("\n");

          canvas.width = imageSize;
          canvas.height = lines.length * (ascent + descent) + descent;

          ctx.font = `${fontWidth} ${fontSize}px '${fontFamily}'`;
          ctx.fillStyle = "white";

          lines.forEach((line, i) => {
            ctx.fillText(line, 0, (ascent + descent) * (i + 1));
          });
        };

export const editBackground =
  (canvas: OffscreenCanvas) =>
    (ctx: OffscreenCanvasRenderingContext2D) =>
      (captionCanvas: OffscreenCanvas) => {
        canvas.width = imageSize + frameSize * 2;
        canvas.height = imageSize + captionCanvas.height + frameSize * 2;

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      };

type Layers = {
  image: OffscreenCanvas;
  caption: OffscreenCanvas;
  background: OffscreenCanvas;
};

export const renderCanvas =
  (canvas: HTMLCanvasElement) =>
    (ctx: CanvasRenderingContext2D) =>
      (layers: Layers) => {
        if (layers.image.width === 0 || layers.caption.width === 0) return;

        canvas.width = layers.background.width;
        canvas.height = layers.background.height;

        ctx.drawImage(layers.background, 0, 0);
        ctx.drawImage(layers.image, frameSize, frameSize);
        ctx.drawImage(layers.caption, frameSize, imageSize + frameSize);
      };
