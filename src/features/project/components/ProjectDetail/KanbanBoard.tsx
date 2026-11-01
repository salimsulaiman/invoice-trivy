import * as React from "react"
import {
  DndContext,
  closestCorners,
  useDraggable,
  useDroppable,
  DragOverlay,
  defaultDropAnimationSideEffects,
  useSensors,
  useSensor,
  PointerSensor,
} from "@dnd-kit/core"
import type { DragEndEvent, DragStartEvent, DropAnimation } from "@dnd-kit/core"
import { useDeleteUpdate, useUpdateUpdateStatus } from "../../hooks/useProject"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { IProject, IProjectUpdate, ProjectStatus } from "../../types/project"
import { Badge } from "@/components/ui/badge"
import { Loader2, Pencil, Trash2 } from "lucide-react"
import { EditUpdateDialog } from "./EditUpdateDialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const COLUMNS: { id: ProjectStatus; title: string; color: string }[] = [
  { id: "pending", title: "Pending", color: "bg-slate-400" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-500" },
  { id: "revision", title: "Revision", color: "bg-amber-500" },
  { id: "completed", title: "Completed", color: "bg-emerald-500" },
  { id: "cancelled", title: "Cancelled", color: "bg-red-500" },
]

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
}

export function KanbanBoard({ project, updates }: { project: IProject; updates: IProjectUpdate[] }) {
  const [activeItem, setActiveItem] = React.useState<IProjectUpdate | null>(null)
  const [optimisticUpdates, setOptimisticUpdates] = React.useState<Record<string, ProjectStatus>>({})
  const [loadingIds, setLoadingIds] = React.useState<Set<string>>(new Set())
  const { mutate: updateStatus } = useUpdateUpdateStatus()

  const handleDragStart = (event: DragStartEvent) => {
    const item = updates.find((u) => u.id === event.active.id)
    setActiveItem(item || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveItem(null)

    if (!over) return

    const updateId = active.id as string
    const newStatus = over.id as ProjectStatus

    const currentStatus = optimisticUpdates[updateId] ?? updates.find((u) => u.id === updateId)?.status_at_time

    if (currentStatus === newStatus) return

    setOptimisticUpdates((prev) => ({ ...prev, [updateId]: newStatus }))
    setLoadingIds((prev) => new Set(prev).add(updateId))

    updateStatus(
      {
        updateId,
        status: newStatus,
        projectId: project.id,
      },
      {
        onSuccess: () => {
          setLoadingIds((prev) => {
            const next = new Set(prev)
            next.delete(updateId)
            return next
          })
        },
        onError: () => {
          setOptimisticUpdates((prev) => {
            const next = { ...prev }
            delete next[updateId]
            return next
          })
          setLoadingIds((prev) => {
            const next = new Set(prev)
            next.delete(updateId)
            return next
          })
        },
      }
    )
  }

  const resolvedUpdates = updates.map((u) => ({
    ...u,
    status_at_time: optimisticUpdates[u.id] ?? u.status_at_time,
  }))

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            updates={resolvedUpdates.filter((u) => u.status_at_time === column.id)}
            loadingIds={loadingIds}
            setOptimisticUpdates={setOptimisticUpdates} // <-- Add this
          />
        ))}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeItem ? <UpdateCard update={activeItem} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}

function KanbanColumn({ column, updates, loadingIds, setOptimisticUpdates }: {
  column: { id: ProjectStatus; title: string; color: string }
  updates: IProjectUpdate[]
  loadingIds: Set<string>
  setOptimisticUpdates: React.Dispatch<React.SetStateAction<Record<string, ProjectStatus>>>
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", column.color)} />
          <h3 className="font-semibold text-xs text-muted-foreground">
            {column.title}
          </h3>
          <Badge variant="outline" className="h-4 w-4 px-1 text-[9px] font-bold border-muted-foreground/20 text-muted-foreground">
            {updates.length}
          </Badge>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 min-h-87.5 rounded-xl border transition-all p-2 space-y-3",
          isOver
            ? "bg-indigo-100/10 border-dashed border-primary/40 dark:bg-indigo-900/10"
            : "bg-background border-border dark:bg-muted/10"
        )}
      >
        {updates.map((update: IProjectUpdate) => (
          <DraggableUpdate
            key={update.id}
            update={update}
            isLoading={loadingIds.has(update.id)}
            setOptimisticUpdates={setOptimisticUpdates}
          />
        ))}

        {updates.length === 0 && (
          <div className="h-16 flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/10 text-[9px] text-shark-700 dark:text-shark-400 uppercase tracking-widest">
            No Records
          </div>
        )}
      </div>
    </div>
  )
}

function DraggableUpdate({ update, isLoading, setOptimisticUpdates }: { update: IProjectUpdate; isLoading: boolean; setOptimisticUpdates: React.Dispatch<React.SetStateAction<Record<string, ProjectStatus>>> }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: update.id,
    disabled: isLoading,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn("touch-none", isDragging && "opacity-0")}
    >
      <UpdateCard update={update} isLoading={isLoading} setOptimisticUpdates={setOptimisticUpdates}/>
    </div>
  )
}

function UpdateCard({
  update,
  isOverlay,
  isLoading,
  setOptimisticUpdates,
}: {
  update: IProjectUpdate
  isOverlay?: boolean
  isLoading?: boolean,
  setOptimisticUpdates?: React.Dispatch<React.SetStateAction<Record<string, ProjectStatus>>>
}) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const deleteMutation = useDeleteUpdate()

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteMutation.mutate(update.id)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditDialogOpen(true)
  }

  return (
    <>
      <Card
        className={cn(
          "group relative border-border/40 bg-card text-card-foreground transition-all select-none shadow-sm",
          isOverlay
            ? "shadow-xl ring-1 ring-primary/20 rotate-1 scale-[1.02] z-50"
            : "hover:border-primary/40 hover:shadow-md",
          isLoading && "opacity-70 pointer-events-none"
        )}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-background/60 z-10">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isOverlay && !isLoading && (
          <div
            className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleEdit}
              className="p-1.5 rounded-md bg-background border shadow-sm hover:text-amber-600 transition-colors cursor-pointer"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 rounded-md bg-background border shadow-sm hover:text-red-600 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}

        <CardContent className="p-4 space-y-3">
          <p className="text-[11px] leading-relaxed text-foreground/80 whitespace-pre-wrap line-clamp-4">
            {update.note}
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-border/20">
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5 ring-1 ring-border">
                <AvatarFallback className="text-[8px] font-semibold bg-violet-600/10 text-violet-700 dark:text-violet-400">
                  {(update.users?.name || "U")
                    .split(" ")
                    .map((word: string) => word[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-[9px] font-medium text-muted-foreground truncate max-w-[120px]">
                {update.users?.name || "Unknown"}
              </span>
            </div>
            <span className="text-[9px] text-muted-foreground/60">
              {new Date(update.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      {isEditDialogOpen && (
        <EditUpdateDialog
          update={update}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={(newStatus) => {
          setOptimisticUpdates?.((prev) => ({
            ...prev,
            [update.id]: newStatus,
          }))
        }}
        />
      )}
    </>
  )
}