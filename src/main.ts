import * as U from "./lib/utils.ts";
import * as S from "./setters.ts";

////////////////////////////////////////////////////////////
// STATE
////////////////////////////////////////////////////////////

/**
 * Image uploaded by the user.
 */
let image: ImageBitmap | undefined;

/**
 * Caption entered by the user.
 */
let caption = "";

/**
 * Alignment of Caption.
 */
let captionAlign = "left";

/**
 * Font size (px) used for caption rendering.
 */
let fontSize = 0;

/**
 * Canvas and rendering context for the image.
 */
const imageCanvas = U.createOffScreenCanvas();

/**
 * Canvas and rendering context for the caption.
 */
const captionCanvas = U.createOffScreenCanvas();

/**
 * Canvas and rendering context for the background.
 */
const backgroundCanvas = U.createOffScreenCanvas();

/**
 * Canvas and rendering context for the final rendering.
 */
const canvas = U.getCanvas();

/**
 * Buttons for caption alignment.
 */
const alignButtons = U.getAlignButtons();

/**
 * Dialog for saving the final image.
 */
const saveImage = U.getElement("save-image") as HTMLDialogElement;

/**
 * Input element for entering a file name.
 */
const enterFileName = U.getElement("enter-file-name") as HTMLInputElement;

/**
 * Button for cancel the image saving.
 */
const cancelSave = U.getElement("cancel-save") as HTMLButtonElement;

/**
 * Button for confirm the image saving.
 */
const confirmSave = U.getElement("confirm-save") as HTMLButtonElement;

/**
 * HTML element that shows guide text.
 */
const dragAndDropGuide = U.getElement(
  "drag-and-drop-guide",
) as HTMLParagraphElement;

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

const syncCaptionAlign = (input: string) => {
  captionAlign = input;

  syncAlignButtons();
  syncCaptionCanvas();
};

const syncFontSize = (input: number) => {
  fontSize = input;

  syncCaptionCanvas();
};

const syncImageCanvas = async () => {
  await S.setImageCanvas({ image: image! }, imageCanvas);

  syncCanvas();
};

const syncCaptionCanvas = () => {
  S.setCaptionCanvas({ caption, fontSize, captionAlign }, captionCanvas);

  syncBackgroundCanvas();
};

const syncBackgroundCanvas = () => {
  S.setBackgroundCanvas({ captionCanvas }, backgroundCanvas);

  syncCanvas();
};

const syncCanvas = () => {
  S.setCanvas({ imageCanvas, captionCanvas, backgroundCanvas }, canvas);
};

const syncAlignButtons = () => {
  S.setAlignButtons({ captionAlign }, alignButtons);
};

const syncSaveImage = (command: string) => {
  S.setSaveImage({ command, canvas, enterFileName }, saveImage);
};

const syncDragAndDropGuide = () => {
  S.setDragAndDropGuide(dragAndDropGuide);
};

////////////////////////////////////////////////////////////
// TRIGGERS
////////////////////////////////////////////////////////////

// When the user drags and drops an image.
document.addEventListener("dragover", (e) => {
  e.preventDefault();
});

document.addEventListener("drop", async (e) => {
  e.preventDefault();

  const image = await U.loadDroppedImage(e);

  if (U.isImageUndefined(image)) return;

  syncImage(image);
});

// When the user uploads an image.
const hiddenInput = U.getElement("hidden-input") as HTMLInputElement;
hiddenInput.addEventListener("change", async () => {
  const image = await U.loadUploadedImage(hiddenInput);

  if (U.isImageUndefined(image)) return;

  syncImage(image);
});

const uploadImage = U.getElement("upload-image") as HTMLButtonElement;
uploadImage.addEventListener("click", () => {
  hiddenInput.click();
});

// When the user pastes an image.
const pasteImage = U.getElement("paste-image") as HTMLButtonElement;
pasteImage.addEventListener("click", async () => {
  const image = await U.loadClipboardImage();

  if (U.isImageUndefined(image)) return;

  syncImage(image);
});

// When the user changes font size.
const fontSizeInput = U.getElement("font-size-input") as HTMLInputElement;
fontSizeInput.addEventListener("input", () => {
  syncFontSize(Number(fontSizeInput.value));
});

// When the user enters a caption.
const enterCaption = U.getElement("enter-caption") as HTMLTextAreaElement;
enterCaption.addEventListener("input", (e) => {
  const element = e.target as HTMLTextAreaElement;
  syncCaption(element.value);
});

// When the user chooses left alignment.
alignButtons.left.addEventListener("click", () => {
  syncCaptionAlign("left");
});

// When the user chooses center alignment.
alignButtons.center.addEventListener("click", () => {
  syncCaptionAlign("center");
});

// When the user chooses right alignment.
alignButtons.right.addEventListener("click", () => {
  syncCaptionAlign("right");
});

// When the user clicks the "canvas".
canvas.value.addEventListener("click", () => {
  if (U.isImageUndefined(image)) return;

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
  alignButtons.left.dispatchEvent(new Event("click"));
};

initialize();
