/**
 * Short alias of "document.getElementById()".
 */
export const getElement = (id: string) => {
  return document.getElementById(id);
};

/**
 * Create an object for the "OffscreenCanvas" and its context.
 */
export const createOffScreenCanvas = () => {
  const value = new OffscreenCanvas(0, 0);
  const ctx = value.getContext("2d")!;

  return { value, ctx };
};

/**
 * Create an object for the "HTMLCanvasElement" and its context.
 */
export const getCanvas = () => {
  const value = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = value.getContext("2d")!;

  return { value, ctx };
};

/**
 * Get all the buttons for caption alignment.
 */
export const getAlignButtons = () => {
  const left = getElement("align-left") as HTMLButtonElement;
  const center = getElement("align-center") as HTMLButtonElement;
  const right = getElement("align-right") as HTMLButtonElement;

  return { left, center, right };
};

/**
 * Load a image from a dragged and dropped file.
 */
export const loadDroppedImage = async (e: DragEvent) => {
  const file = e.dataTransfer?.files[0];

  return file?.type.startsWith("image/")
    ? await createImageBitmap(file)
    : undefined;
};

/**
 * Load a image from an uploaded file.
 */
export const loadUploadedImage = async (input: HTMLInputElement) => {
  const file = input?.files?.[0];

  return file ? await createImageBitmap(file) : undefined;
};

/**
 * Load a image from the clipboard.
 */
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

/**
 * True if an image is "undefined".
 */
export const isImageUndefined = (
  image: ImageBitmap | undefined,
): image is undefined => {
  return typeof image === "undefined";
};
