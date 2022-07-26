import { PositionType, ReactZoomPanPinchContext } from "../../models";
import { isExcludedNode, roundNumber } from "../../utils";
import { checkZoomBounds } from "../zoom/zoom.utils";

export function isPinchStartAllowed(
  contextInstance: ReactZoomPanPinchContext,
  event: TouchEvent
): boolean {
  const { disabled, excluded } = contextInstance.setup.pinch;
  const { isInitialized } = contextInstance;

  const target = event.target as HTMLElement | null;
  const isAllowed = isInitialized && !disabled && target !== null;
  if (!isAllowed) {
    return false;
  }

  const isExcluded = isExcludedNode(target, excluded);

  if (isExcluded) {
    return false;
  }

  return true;
}

export function isPinchAllowed(
  contextInstance: ReactZoomPanPinchContext
): boolean {
  const { disabled } = contextInstance.setup.pinch;
  const { isInitialized, pinchStartDistance } = contextInstance;

  const isAllowed =
    isInitialized &&
    !disabled &&
    pinchStartDistance !== null &&
    pinchStartDistance !== 0;

  if (!isAllowed) {
    return false;
  }

  return true;
}

export function calculateTouchMidPoint(
  event: TouchEvent,
  scale: number,
  contentComponent: HTMLDivElement
): PositionType {
  const contentRect = contentComponent.getBoundingClientRect();
  const { touches } = event;
  const firstPointX = roundNumber(touches[0].clientX - contentRect.left, 5);
  const firstPointY = roundNumber(touches[0].clientY - contentRect.top, 5);
  const secondPointX = roundNumber(touches[1].clientX - contentRect.left, 5);
  const secondPointY = roundNumber(touches[1].clientY - contentRect.top, 5);

  return {
    x: (firstPointX + secondPointX) / 2 / scale,
    y: (firstPointY + secondPointY) / 2 / scale
  };
}

export function getTouchDistance(event: TouchEvent): number {
  return Math.sqrt(
    (event.touches[0].pageX - event.touches[1].pageX) ** 2 +
      (event.touches[0].pageY - event.touches[1].pageY) ** 2
  );
}

export function calculatePinchZoom(
  contextInstance: ReactZoomPanPinchContext,
  currentDistance: number
): number {
  const { pinchStartScale, pinchStartDistance, setup } = contextInstance;
  const { maxScale, minScale, zoomAnimation } = setup;
  const { size, disabled } = zoomAnimation;

  if (
    pinchStartScale === null ||
    pinchStartScale === 0 ||
    pinchStartDistance === null ||
    pinchStartDistance === 0 ||
    currentDistance === 0
  ) {
    throw new Error("Pinch touches distance was not provided");
  }

  if (currentDistance < 0) {
    return contextInstance.transformState.scale;
  }

  const touchProportion = currentDistance / pinchStartDistance;
  const scaleDifference = touchProportion * pinchStartScale;

  return checkZoomBounds(
    roundNumber(scaleDifference, 2),
    minScale,
    maxScale,
    size,
    !disabled
  );
}
