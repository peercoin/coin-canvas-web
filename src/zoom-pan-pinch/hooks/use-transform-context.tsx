import { useContext } from "react";
import { getContext } from "../utils";
import { Context } from "../components/transform-context";
import { ReactZoomPanPinchRef } from "../models";

export default function useTransformContext(): ReactZoomPanPinchRef {
  const libraryContext = useContext(Context);

  if (libraryContext.contextInstance === null) {
    throw new Error("Transform context mus be placed inside TransformWrapper");
  }

  return getContext(libraryContext.contextInstance);
}

