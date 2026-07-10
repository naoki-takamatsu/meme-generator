/**
 * Buttons for caption alignment.
 */
export type AlignButtons = {
  left: HTMLButtonElement;
  center: HTMLButtonElement;
  right: HTMLButtonElement;
};

/**
 * The "OffScreenCanvas" and its context. To avoid calling the "getContext" every time.
 */
export type OffScreenCanvasWithCtx = {
  value: OffscreenCanvas;
  ctx: OffscreenCanvasRenderingContext2D;
};

/**
 * The "HTMLCanvasElement" and its context. To avoid calling the "getContext" every time.
 */
export type CanvasWithCtx = {
  value: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
};
