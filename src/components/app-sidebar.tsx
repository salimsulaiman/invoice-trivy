import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Settings,
  Search,
  LogOut,
  User,
  Loader2,
  FolderKanban,
  Shield,
  Landmark,
} from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Separator } from "./ui/separator"
import { useLogout } from "@/features/auth/hooks/useAuth"
import { useAuthStore } from "@/store/use-auth-store"

function AppHeader() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")

  const user = useAuthStore((state) => state.user);

  const { mutate: logout, isPending: isLoggingOut } = useLogout()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/invoices?q=${encodeURIComponent(query.trim())}`)
    }

    setQuery("")
  }


  

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-background">
      <div className="flex items-center gap-2 md:gap-4 flex-1">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4 hidden md:block" />

        <form onSubmit={handleSearch} className="relative w-full max-w-35 sm:max-w-xs md:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari invoice..."
            className="pl-8 h-8 text-sm"
          />
        </form>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <span className="hidden sm:block text-sm text-muted-foreground whitespace-nowrap">
          {format(new Date(), "EEEE, d MMMM yyyy", { locale: id })}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-border hover:ring-primary transition-all">
              <AvatarImage src="" />
              <AvatarFallback className="text-xs font-medium">
                {(user?.name || "Elvacode")
                  .split(" ")
                  .map((word: string) => word[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                  <p className="font-medium text-sm leading-none">
                    {user?.name || "Elvacode User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2 cursor-pointer w-full">
                <User className="w-4 h-4" />
                <span>Profile Settings</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              disabled={isLoggingOut}
              onClick={() => logout()}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer gap-2"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export function AppSidebar() {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)

  return (
    <Sidebar>
      <SidebarHeader className="p-8">
        <img
          src="/assets/trivy-logo-black.webp"
          alt="Logo"
          className="h-auto w-20 dark:hidden"
        />
        <img
          src="/assets/trivy-logo.webp"
          alt="Logo"
          className="hidden h-auto w-20 dark:block"
        />
      </SidebarHeader>

      <SidebarContent>
        {user?.role !== "worker" && (
          <SidebarGroup>
            <SidebarGroupLabel>Overview</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === "/" || location.pathname === "/dashboard"}
                  >
                    <Link to="/dashboard">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {user?.role !== "worker" && (
          <SidebarGroup>
            <SidebarGroupLabel>Master Data</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith("/customers")}
                  >
                    <Link to="/customers">
                      <Users className="w-4 h-4" />
                      Customers
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith("/bank-accounts")}
                  >
                    <Link to="/bank-accounts">
                      <Landmark className="w-4 h-4" />
                      Bank Accounts
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {user?.role === "owner" && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname.startsWith("/workers")}
                    >
                      <Link to="/workers">
                        <Users className="w-4 h-4" />
                        Workers / Users
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {user?.role !== "worker" && (
          <SidebarGroup>
            <SidebarGroupLabel>Transactions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith("/invoices")}
                  >
                    <Link to="/invoices">
                      <FileText className="w-4 h-4" />
                      Invoices
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith("/payments")}
                  >
                    <Link to="/payments">
                      <CreditCard className="w-4 h-4" />
                      Payments
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname.startsWith("/projects")}
                >
                  <Link to="/projects">
                    <FolderKanban className="w-4 h-4" />
                    Projects
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname.startsWith("/settings")}
                >
                  <Link to="/settings">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {user?.role === "owner" && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith("/signature-approvals")}
                  >
                    <Link to="/signature-approvals">
                      <Shield className="w-4 h-4" />
                      Signature Approvals
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 text-xs text-muted-foreground">
        © 2026 Trivy Infinity Solutions
      </SidebarFooter>
    </Sidebar>
  )
}

export { AppHeader }