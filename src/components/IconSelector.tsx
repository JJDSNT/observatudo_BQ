// src/components/IconSelector.tsx
"use client";

import { useState, ComponentType, useRef, useEffect } from "react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideProps } from "lucide-react";

export type LucideIconName = keyof typeof Icons;

interface IconSelectorProps {
  value: LucideIconName;
  onChange: (icon: LucideIconName) => void;
  icons: LucideIconName[];
}

export function IconSelector({
  value,
  onChange,
  icons,
}: Readonly<IconSelectorProps>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const SelectedIcon = Icons[value] as ComponentType<LucideProps>;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-10 h-10 flex items-center justify-center rounded border bg-white dark:bg-zinc-800"
        title={`Ícone selecionado: ${value}`}
      >
        <SelectedIcon size={18} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-80 max-h-64 overflow-y-auto bg-white dark:bg-zinc-900 border rounded shadow-lg">
          <div className="grid grid-cols-6 gap-1 p-3">
            {icons.map((iconName) => {
              const Icon = Icons[iconName] as ComponentType<LucideProps>;
              const isSelected = iconName === value;

              return (
                <button
                  key={iconName}
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded border transition-colors",
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600"
                      : "hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-800"
                  )}
                  title={iconName}
                >
                  <Icon size={16} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}