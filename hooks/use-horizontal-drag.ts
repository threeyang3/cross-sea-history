"use client";

import { useRef, useState } from "react";
import type { DragEvent, MouseEvent, PointerEvent } from "react";

type DragUpdate = (distance: number) => void;
type Gesture = {
  pointerId: number;
  x: number;
  y: number;
  active: boolean;
  update: DragUpdate;
};

// Wait for horizontal intent so a tap can still activate an event and a vertical
// touch gesture can scroll the page. Capture keeps a drag alive off the surface.
export function useHorizontalDrag<T extends HTMLElement>(
  begin: (event: PointerEvent<T>) => DragUpdate | undefined,
) {
  const gesture = useRef<Gesture | null>(null);
  const suppressClick = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  function finish(event: PointerEvent<T>) {
    if (gesture.current?.pointerId !== event.pointerId) return;
    gesture.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return {
    isDragging,
    handlers: {
      onPointerDown(event: PointerEvent<T>) {
        if (!event.isPrimary || event.button !== 0) return;
        suppressClick.current = false;
        const update = begin(event);
        gesture.current = update ? {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          active: false,
          update,
        } : null;
      },
      onPointerMove(event: PointerEvent<T>) {
        const current = gesture.current;
        if (!current || current.pointerId !== event.pointerId) return;
        const distance = event.clientX - current.x;
        const vertical = event.clientY - current.y;
        if (!current.active) {
          if (Math.max(Math.abs(distance), Math.abs(vertical)) < 6) return;
          if (Math.abs(vertical) > Math.abs(distance)) {
            gesture.current = null;
            return;
          }
          current.active = true;
          suppressClick.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          setIsDragging(true);
        }
        event.preventDefault();
        current.update(distance);
      },
      onPointerUp: finish,
      onPointerCancel: finish,
      onLostPointerCapture(event: PointerEvent<T>) {
        // Ignore a child's implicit touch capture moving to this surface.
        if (event.target === event.currentTarget) finish(event);
      },
      onClickCapture(event: MouseEvent<T>) {
        // Keyboard activation has detail=0 and must keep working after a drag.
        if (!suppressClick.current || event.detail === 0) return;
        suppressClick.current = false;
        event.preventDefault();
        event.stopPropagation();
      },
      onDragStart(event: DragEvent<T>) {
        event.preventDefault();
      },
    },
  };
}
