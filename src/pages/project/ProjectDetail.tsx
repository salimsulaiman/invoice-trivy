import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Loader2, Calendar, User, FileText } from "lucide-react"
import { format } from "date-fns"
import { useProject, useProjectUpdates } from "@/features/project/hooks/useProject"
import { KanbanBoard } from "@/features/project/components/ProjectDetail/KanbanBoard"
import { AddUpdateDialog } from "@/features/project/components/ProjectDetail/AddUpdateDialog"

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const { data: project, isLoading: projectLoading } = useProject(id!)
  const { data: updates, isLoading: updatesLoading } = useProjectUpdates(id!)

  if (projectLoading || updatesLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) return <div className="p-10 text-center">Project tidak ditemukan.</div>

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="-ml-2 h-8 text-muted-foreground"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Kembali
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" /> {project.invoices?.invoice_number}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" /> {project.invoices?.customers?.name}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> 
              Deadline: {project.deadline ? format(new Date(project.deadline), "dd MMM yyyy") : "Belum diatur"}
            </div>
          </div>
        </div>
        <AddUpdateDialog 
            projectId={project.id} 
            currentStatus={project.status} 
        />
      </div>

      <KanbanBoard project={project} updates={updates || []} />
    </div>
  )
}