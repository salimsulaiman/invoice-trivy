import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectTable } from "@/features/project/components/ProjectTable/ProjectTable"
import { useProjects } from "@/features/project/hooks/useProject"
import { Loader2 } from "lucide-react"

export default function ProjectPage() {
  const { isLoading } = useProjects()

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="w-full">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Project List</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectTable />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}