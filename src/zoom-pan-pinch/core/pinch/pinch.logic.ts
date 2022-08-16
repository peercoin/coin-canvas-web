import { ReactZoomPanPinchContext } from "../../models";
import { handleCancelAnimation } from "../animations/animations.utils";
import {BoundsMode} from "../bounds/bounds.types";
import { handleCalculateBounds } from "../bounds/bounds.utils";
import { handleAlignToScaleBounds } from "../zoom/zoom.logic";
import { handleCalculateZoomPositions } from "../zoom/zoom.utils";
import {
  calculatePinchZoom,
  calculateTouchMidPoint,
  getTouchDistance
} from "./pinch.utils";

export function handlePinchStart(
  contextInstance: ReactZoomPanPinchContext,
  event: TouchEvent
): void {
  const distance = getTouchDistance(event);

  contextInstance.pinchStartDistance = distance;
  contextInstance.lastDistance = distance;
  contextInstance.pinchStartScale = contextInstance.transformState.scale;
  contextInstance.isPanning = false;

  handleCancelAnimation(contextInstance);
}

export function handlePinchZoom(
  contextInstance: ReactZoomPanPinchContext,
  event: TouchEvent
): void {
  const { contentComponent, pinchStartDistance } = contextInstance;
  const { scale } = contextInstance.transformState;
  const { limitToBounds, boundsMode, zoomAnimation } =
    contextInstance.setup;
  const { disabled, size } = zoomAnimation;

  // if one finger starts from outside of wrapper
  if (pinchStartDistance === null || contentComponent === null) {
    return;
  }

  const midPoint = calculateTouchMidPoint(event, scale, contentComponent);

  // if touches goes off of the wrapper element
  if (!isFinite(midPoint.x) || !isFinite(midPoint.y)) {
    return;
  }

  const currentDistance = getTouchDistance(event);
  const newScale = calculatePinchZoom(contextInstance, currentDistance);

  if (newScale === scale) {
    return;
  }

  const bounds = handleCalculateBounds(contextInstance, newScale);

  const isPaddingDisabled
    = disabled || size === 0 || boundsMode == BoundsMode.CENTER_ZOOMED_OUT;
  const isLimitedToBounds = limitToBounds && isPaddingDisabled;

  const { x, y } = handleCalculateZoomPositions(
    contextInstance,
    midPoint.x,
    midPoint.y,
    newScale,
    bounds,
    isLimitedToBounds
  );

  contextInstance.pinchMidpoint = midPoint;
  contextInstance.lastDistance = currentDistance;

  contextInstance.setTransformState(newScale, x, y);
}

export function handlePinchStop(
  contextInstance: ReactZoomPanPinchContext
): void {
  const { pinchMidpoint } = contextInstance;

  contextInstance.velocity = null;
  contextInstance.lastDistance = null;
  contextInstance.pinchMidpoint = null;
  contextInstance.pinchStartScale = null;
  contextInstance.pinchStartDistance = null;
  handleAlignToScaleBounds(contextInstance, pinchMidpoint?.x, pinchMidpoint?.y);
}
