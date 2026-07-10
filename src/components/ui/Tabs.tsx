"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

function useTabs() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs compound components must be used within <Tabs>");
  return ctx;
}

type TabsRef = React.ComponentRef<"div">;
type TabsProps = React.ComponentPropsWithoutRef<"div"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export const Tabs = React.forwardRef<TabsRef, TabsProps>(
  ({ className, value: controlledValue, defaultValue, onValueChange, children, ...props }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? "");
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;

    const handleChange = React.useCallback(
      (v: string) => {
        if (!isControlled) setUncontrolledValue(v);
        onValueChange?.(v);
      },
      [isControlled, onValueChange]
    );

    return (
      <TabsContext.Provider value={{ value, onValueChange: handleChange }}>
        <div ref={ref} className={cn("flex flex-col", className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = "Tabs";

type TabsListRef = React.ComponentRef<"div">;
type TabsListProps = React.ComponentPropsWithoutRef<"div">;

export const TabsList = React.forwardRef<TabsListRef, TabsListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 border-b border-(--border)",
        className
      )}
      {...props}
    />
  )
);
TabsList.displayName = "TabsList";

type TabsTriggerRef = React.ComponentRef<"button">;
type TabsTriggerProps = React.ComponentPropsWithoutRef<"button"> & {
  value: string;
};

export const TabsTrigger = React.forwardRef<TabsTriggerRef, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = useTabs();
    const isActive = selectedValue === value;

    return (
      <button
        ref={ref}
        role="tab"
        type="button"
        aria-selected={isActive}
        data-state={isActive ? "active" : "inactive"}
        onClick={() => onValueChange(value)}
        className={cn(
          "px-3 py-1.5 text-[14px] font-medium cursor-pointer transition-colors",
          "border-b-2 border-transparent -mb-px",
          "outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-opacity-20",
          isActive
            ? "text-(--text) border-b-(--primary)"
            : "text-(--muted) hover:text-(--text)",
          className
        )}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";
