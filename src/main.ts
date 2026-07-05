import "./styles/main.css";
import "./styles/fonts.css";
import * as C from "./converter.ts";

////////////////////////////////////////////////////////////
// STATE
////////////////////////////////////////////////////////////

// Font size (px) used for caption rendering.
let fontSize: number;

// HTML element that shows guide text.
const dragAndDropGuide = document.getElementById(
  "drag-and-drop-guide",
) as HTMLParagraphElement;

// Image uploaded by the user.
let image: ImageBitmap | undefined;

// Caption entered by the user.
let caption: string;

// Canvas and rendering context for the image.
const imageCanvas = new OffscreenCanvas(0, 0);
const imageCtx = imageCanvas.getContext("2d")!;

// Canvas and rendering context for the caption.
const captionCanvas = new OffscreenCanvas(0, 0);
const captionCtx = captionCanvas.getContext("2d")!;

// Canvas and rendering context for the background.
const backgroundCanvas = new OffscreenCanvas(0, 0);
const backgroundCtx = backgroundCanvas.getContext("2d")!;

// Canvas and rendering context for the final rendering.
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

////////////////////////////////////////////////////////////
// TRIGGERS
////////////////////////////////////////////////////////////

// When the user drags and drops an image.
document.addEventListener("dragover", (e) => {
  e.preventDefault();
});

document.addEventListener("drop", async (e) => {
  e.preventDefault();

  const image = await C.droppedFileToImage(e);

  if (typeof image === "undefined") return;

  syncImage(image);
});

// When the user uploads an image.
const hiddenInput = document.getElementById("hidden-input") as HTMLInputElement;
hiddenInput.addEventListener("change", async () => {
  const image = await C.fetchUploadedImage(hiddenInput);

  if (typeof image === "undefined") return;

  syncImage(image);
});

const uploadImage = document.getElementById(
  "upload-image",
) as HTMLButtonElement;
uploadImage.addEventListener("click", () => {
  hiddenInput.click();
});

// When the user pastes an image.
const pasteImage = document.getElementById("paste-image") as HTMLButtonElement;
pasteImage.addEventListener("click", async () => {
  const image = await C.clipboardToImage();

  if (typeof image === "undefined") return;

  syncImage(image);
});

// When the user changes font size.
const fontSizeInput = document.getElementById(
  "font-size-input",
) as HTMLInputElement;
fontSizeInput.addEventListener("input", () => {
  syncFontSize(Number(fontSizeInput.value));
});

// When the user enters a caption.
const enterCaption = document.getElementById(
  "enter-caption",
) as HTMLTextAreaElement;
enterCaption.addEventListener("input", (e) => {
  const element = e.target as HTMLTextAreaElement;
  syncCaption(element.value);
});

////////////////////////////////////////////////////////////
// SYNCS
////////////////////////////////////////////////////////////

const syncImage = async (input: ImageBitmap) => {
  image = input;

  syncDragAndDropGuide();
  syncImageCanvas();
};

const syncCaption = (input: string) => {
  caption = input;

  syncCaptionCanvas();
};

const syncDragAndDropGuide = () => {
  dragAndDropGuide.style.display = "none";
};

const syncImageCanvas = async () => {
  await C.editImage(imageCanvas)(imageCtx)(image!);

  syncCanvas();
};

const syncFontSize = (input: number) => {
  fontSize = input;

  syncCaptionCanvas();
};

const syncCaptionCanvas = () => {
  C.editCaption(captionCanvas)(captionCtx)(caption)(fontSize);

  syncBackgroundCanvas();
};

const syncBackgroundCanvas = () => {
  C.editBackground(backgroundCanvas)(backgroundCtx)(captionCanvas);

  syncCanvas();
};

const syncCanvas = () => {
  const layers = {
    image: imageCanvas,
    caption: captionCanvas,
    background: backgroundCanvas,
  };

  C.renderCanvas(canvas)(ctx)(layers);
};

////////////////////////////////////////////////////////////
// INITIALIZE
////////////////////////////////////////////////////////////

const initialize = () => {
  // Wait until everyting is ready, then make the body visible.
  window.addEventListener("load", () => {
    document.body.classList.add("ready");
  });

  // Set up the font.
  document.fonts.load("10px Noto Serif JP");

  // Set up the caption canvas.
  enterCaption.dispatchEvent(new Event("input"));

  // Set up the font size.
  fontSizeInput.dispatchEvent(new Event("input"));
};

initialize();
