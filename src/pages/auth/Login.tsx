import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Command } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLogin } from "@/features/auth/hooks/useAuth"

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { mutate: login, isPending } = useLogin()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = (data: LoginFormValues) => {
    login(data)
  }

 return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-3xl grid lg:grid-cols-2 rounded-xl overflow-hidden shadow-sm bg-background min-h-100">
        
        <div className="hidden lg:flex flex-col justify-between p-10 bg-zinc-900 text-white">
          <div className="flex items-center">
            <img
              src="/assets/trivy-logo.webp"
              alt="Trivy Logo"
              className="h-14 w-auto object-contain"
            />
          </div>
          <blockquote className="space-y-2">
            <p className="text-sm">
              "Beyond Limits, Beyond Digital"
            </p>
            <footer className="text-xs opacity-70">Trivy Infinity Solutions</footer>
          </blockquote>
        </div>

        <div className="flex items-center justify-center p-6 lg:p-10">
            <div className="w-full max-w-sm">
                <div className="space-y-1 text-center mb-6">
                <h1 className="text-2xl font-semibold">Login</h1>
                <p className="text-sm text-muted-foreground">
                    Masukkan email Anda untuk melanjutkan
                </p>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                        id="email"
                        placeholder="name@example.com"
                        type="email"
                        disabled={isPending}
                        {...form.register("email")}
                        />
                        {form.formState.errors.email && (
                        <p className="text-xs text-destructive">
                            {form.formState.errors.email.message}
                        </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                        id="password"
                        type="password"
                        placeholder="Password"
                        disabled={isPending}
                        {...form.register("password")}
                        />
                        {form.formState.errors.password && (
                        <p className="text-xs text-destructive">
                            {form.formState.errors.password.message}
                        </p>
                        )}
                    </div>

                    <Button className="w-full" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                    </Button>
                </form>
            </div>
            </div>
      </div>
    </div>
  )
}