import * as O from "./operations.ts";

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
let caption = "";

// Alignment of Caption.
let captionAlignment = "left";

// Buttons for caption alignment.
const alignLeft = document.getElementById("align-left") as HTMLButtonElement;
const alignCenter = document.getElementById(
  "align-center",
) as HTMLButtonElement;
const alignRight = document.getElementById("align-right") as HTMLButtonElement;
const alignButtons = [alignLeft, alignCenter, alignRight];

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

// Dialog for saving the final image.
const saveImage = document.getElementById("save-image") as HTMLDialogElement;

// Input element for entering a file name.
const enterFileName = document.getElementById(
  "enter-file-name",
) as HTMLInputElement;

// Button for cancel the image saving.
const cancelSave = document.getElementById("cancel-save") as HTMLButtonElement;

// Button for confirm the image saving.
const confirmSave = document.getElementById(
  "confirm-save",
) as HTMLButtonElement;

////////////////////////////////////////////////////////////
// TRIGGERS
////////////////////////////////////////////////////////////

// When the user drags and drops an image.
document.addEventListener("dragover", (e) => {
  e.preventDefault();
});

document.addEventListener("drop", async (e) => {
  e.preventDefault();

  const image = await O.loadDroppedImage(e);

  if (O.isImageUndefined(image)) return;

  syncImage(image);
});

// When the user uploads an image.
const hiddenInput = document.getElementById("hidden-input") as HTMLInputElement;
hiddenInput.addEventListener("change", async () => {
  const image = await O.loadUploadedImage(hiddenInput);

  if (O.isImageUndefined(image)) return;

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
  const image = await O.loadClipboardImage();

  if (O.isImageUndefined(image)) return;

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

// When the user chooses left alignment.
alignLeft.addEventListener("click", () => {
  syncCaptionAlign("left");
});

// When the user chooses center alignment.
alignCenter.addEventListener("click", () => {
  syncCaptionAlign("center");
});

// When the user chooses right alignment.
alignRight.addEventListener("click", () => {
  syncCaptionAlign("right");
});

// When the user clicks the "canvas".
canvas.addEventListener("click", () => {
  if (O.isImageUndefined(image)) return;

  syncSaveImage("open");
});

// When the user clicks the cancel button.
cancelSave.addEventListener("click", () => {
  syncSaveImage("close");
});

// When the user clicks the confirm button.
confirmSave.addEventListener("click", () => {
  syncSaveImage("save");
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
  O.hideHtmlElement(dragAndDropGuide);
};

const syncImageCanvas = async () => {
  await O.composeImage(imageCanvas)(imageCtx)(image!);

  syncCanvas();
};

const syncFontSize = (input: number) => {
  fontSize = input;

  syncCaptionCanvas();
};

const syncCaptionAlign = (input: string) => {
  captionAlignment = input;

  syncAlignButtons(input);
  syncCaptionCanvas();
};

const syncAlignButtons = (input: string) => {
  O.activateAlignButton(alignButtons)(input);
};

const syncCaptionCanvas = () => {
  const captionOptions = {
    caption,
    fontSize,
    captionAlign: captionAlignment,
  };

  O.composeCaption(captionCanvas)(captionCtx)(captionOptions);

  syncBackgroundCanvas();
};

const syncBackgroundCanvas = () => {
  O.composeBackground(backgroundCanvas)(backgroundCtx)(captionCanvas);

  syncCanvas();
};

const syncCanvas = () => {
  const layers = {
    image: imageCanvas,
    caption: captionCanvas,
    background: backgroundCanvas,
  };

  O.renderCanvas(canvas)(ctx)(layers);
};

const syncSaveImage = (input: string) => {
  const args = {
    saveImage,
    canvas,
    enterFileName,
  };

  O.handleSaveImage(input)(args);
};

////////////////////////////////////////////////////////////
// INITIALIZE
////////////////////////////////////////////////////////////

const initialize = () => {
  // Wait until everyting is ready, then make the body visible.
  window.addEventListener("load", () => {
    document.body.classList.add("ready");
  });

  // Set up the "captionCanvas".
  enterCaption.dispatchEvent(new Event("input"));

  // Set up the "fontSize".
  fontSizeInput.dispatchEvent(new Event("input"));

  // Set up the "captionAlignment".
  alignLeft.dispatchEvent(new Event("click"));
};

initialize();
