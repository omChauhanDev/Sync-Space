"use client";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const setThemeHandler = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <Button
      variant='ghost'
      size='icon'
      className='focus-visible: bg-background text-foreground select-none appearance-none p-0 m-0 rounded-full hover:bg-background'
      onClick={setThemeHandler}
    >
      <Sun
        style={{ width: "26px", height: "26px" }}
        className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0'
      />
      <Moon
        style={{ width: "26px", height: "26px" }}
        className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100'
      />
      <span className='sr-only selected-none appearance-none border-none'>
        Toggle theme
      </span>
    </Button>
  );
}
