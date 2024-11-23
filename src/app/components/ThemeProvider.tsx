"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [mounted, setMounted] = React.useState(false);

  // Delay rendering until the component is mounted on the client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid rendering server-side by returning null initially
    return null;
  }

  return (
    <NextThemesProvider
      {...props}
      attribute='class'
      defaultTheme='light'
      enableSystem
    >
      {children}
    </NextThemesProvider>
  );
}
