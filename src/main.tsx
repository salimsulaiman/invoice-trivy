import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { BrowserRouter } from "react-router-dom"
import { QueryProvider } from "./providers/QueryProvider.tsx"
import { Toaster } from "sonner"
import { AuthProvider } from "./providers/AuthProvider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <QueryProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        <Toaster />
        </QueryProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)
