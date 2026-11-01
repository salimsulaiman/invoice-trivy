import { type ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Edit, Eye, Trash2 } from "lucide-react"
import { format } from "date-fns"
import type { IProject, ProjectStatus } from "../../types/project"
import { EditProjectDialog } from "./EditProjectDialog"
import React from "react"


const ProjectAction = ({ 
  project, 
  onView, 
  onDelete 
}: { 
  project: IProject; 
  onView: (data: IProject) => void; 
  onDelete: (id: string) => void 
}) => {
  const [isEditOpen, setIsEditOpen] = React.useState(false)

  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onView(project)}
      >
        <Eye className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsEditOpen(true)}
      >
        <Edit className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive"
        onClick={() => onDelete(project.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {isEditOpen && (
        <EditProjectDialog
          project={project}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}
    </div>
  )
}

export const projectColumns = (
  onView: (data: IProject) => void,
  onDelete: (id: string) => void
): ColumnDef<IProject>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Project Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.title}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.invoices?.invoice_number}
        </span>
      </div>
    )
  },
  {
    accessorKey: "invoices.customers.name",
    id: "customer",
    header: "Customer",
    cell: ({ row }) => row.original.invoices?.customers?.name ?? "-",
  },
  {
    accessorKey: "deadline",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Deadline
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) =>
      row.original.deadline
        ? format(new Date(row.original.deadline), "dd MMM yyyy")
        : "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status as ProjectStatus
      const variants: Record<ProjectStatus, "default" | "secondary" | "destructive" | "outline"> = {
        completed: "default",
        pending: "secondary",
        revision: "destructive",
        cancelled: "outline",
        in_progress: "outline",
      }

      return (
        <Badge variant={variants[status]} className="capitalize">
          {status.replace("_", " ")}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ProjectAction 
        project={row.original} 
        onView={onView} 
        onDelete={onDelete} 
      />
    ),
  },
]