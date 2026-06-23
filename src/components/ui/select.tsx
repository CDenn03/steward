"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

type TriggerRef = React.ComponentRef<typeof SelectPrimitive.Trigger>;
type TriggerProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>;

export const SelectTrigger = React.forwardRef<TriggerRef, TriggerProps>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex items-center justify-between gap-2 w-full px-3 py-2 text-[13px]",
        "bg-(--bg) border border-(--border) rounded-(--r-input)",
        "outline-none focus:border-(--primary) focus:bg-(--surface)",
        "text-(--text)",
        "transition-colors cursor-pointer",
        "[&>span]:flex-1 [&>span]:text-left [&>span]:truncate",
        "data-placeholder:[&>span]:text-(--muted)",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown size={14} className="text-(--muted) shrink-0" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

type ContentRef = React.ComponentRef<typeof SelectPrimitive.Content>;
type ContentProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>;

export const SelectContent = React.forwardRef<ContentRef, ContentProps>(
  ({ className, children, position = "popper", ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        className={cn(
          "z-50 min-w-32 overflow-hidden",
          "bg-(--surface) border border-(--border) rounded-(--r-card)",
          "shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          className
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex items-center justify-center h-6 bg-(--surface) text-(--muted)">
          <ChevronDown size={12} className="rotate-180" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex items-center justify-center h-6 bg-(--surface) text-(--muted)">
          <ChevronDown size={12} />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

type ItemRef = React.ComponentRef<typeof SelectPrimitive.Item>;
type ItemProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>;

export const SelectItem = React.forwardRef<ItemRef, ItemProps>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex items-center gap-2 w-full px-3 py-1.5 text-[13px]",
        "rounded-(--r-btn) outline-none select-none cursor-pointer",
        "text-(--text) data-disabled:opacity-50 data-disabled:pointer-events-none",
        "data-highlighted:bg-(--bg) data-highlighted:text-(--text)",
        "data-[state=checked]:font-medium",
        className
      )}
      {...props}
    >
      <span className="flex-1 truncate">{children}</span>
      <SelectPrimitive.ItemIndicator>
        <Check size={13} className="text-(--primary)" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
);
SelectItem.displayName = SelectPrimitive.Item.displayName;

type SeparatorRef = React.ComponentRef<typeof SelectPrimitive.Separator>;
type SeparatorProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>;

export const SelectSeparator = React.forwardRef<SeparatorRef, SeparatorProps>(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-(--border)", className)}
      {...props}
    />
  )
);
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;