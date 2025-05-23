import * as React from "react"
import { Toaster } from "sonner"

export function NotificationToaster() {
  return (
    <Toaster 
      position="bottom-right"
      toastOptions={{
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
        },
      }}
    />
  )
}

export { toast } from "sonner" 