"use client";

import { useRef, useState, type ReactElement, type ReactNode } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip/tooltip";

/** Action hints use hover/focus. Dedicated info buttons can also toggle on tap. */
export default function EditorTooltip({ children, content, tapToOpen = false }: {
  children: ReactElement; content: ReactNode; tapToOpen?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pinned = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  function dismiss() { pinned.current = false; setOpen(false); }
  return <Tooltip open={open} onOpenChange={value => { if (!pinned.current) setOpen(value); }}>
    <TooltipTrigger asChild ref={trigger}
      aria-expanded={tapToOpen ? open : undefined}
      onBlur={tapToOpen ? dismiss : undefined}
      onPointerDown={tapToOpen ? event => {
        event.stopPropagation();
        // Keep Radix's pointer-down close from undoing a tap toggle.
        event.preventDefault();
      } : undefined}
      onClick={tapToOpen ? event => {
        event.preventDefault(); event.stopPropagation();
        pinned.current = !pinned.current;
        setOpen(pinned.current);
      } : undefined}>
      {children}
    </TooltipTrigger>
    <TooltipContent collisionPadding={16} onEscapeKeyDown={dismiss} onPointerDownOutside={event => {
      if (trigger.current?.contains(event.target as Node)) { event.preventDefault(); return; }
      dismiss();
    }}>
      {content}
    </TooltipContent>
  </Tooltip>;
}
