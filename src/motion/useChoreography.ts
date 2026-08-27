import { useLayoutEffect, type RefObject } from "react";
import { createChoreography } from "./choreography";

export function useChoreography(rootRef: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) return;

    return createChoreography(root);
  }, [rootRef]);
}
