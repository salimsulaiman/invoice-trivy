"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  Calendar as CalendarIcon,
  FilterX,
  ListFilter,
  Plus,
  Search,
  Download,
} from "lucide-react"
import { DataTable } from "@/components/data-table"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { projectColumns } from "./columns"
import { useProjects } from "../../hooks/useProject"
import { useNavigate } from "react-router-dom"
import { useProjectFilters } from "../../hooks/useProjectFilter"
import { CreateProjectDialog } from "./CreateProjectDialog"
import { DeleteProjectDialog } from "./DeleteProjectDialog"

export function ProjectTable() {
  const navigate = useNavigate()
  const { data, isLoading: isDataLoading } = useProjects()
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [selectedProject, setSelectedProject] = React.useState<any>(null)

  const {
    searchValue,
    statusFilter,
    date,
    filteredData,
    isDebouncing,
    setSearchValue,
    setStatusFilter,
    setDate,
    resetFilters,
  } = useProjectFilters(data)

  const columns = React.useMemo(
    () =>
      projectColumns(
        (project) => navigate(`/projects/${project.id}`),
        (id) => {
          const proj = data?.find((p) => p.id === id)
          if (proj) {
            setSelectedProject(proj)
            setIsDeleteOpen(true)
          }
        }
      ),
    [data, navigate]
  )

  const hasActiveFilters = date?.from || statusFilter !== "all" || searchValue

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Monitoring progres pengerjaan project client secara real-time.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Project
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
          <div className="relative w-full sm:max-w-60">
            <Input
              placeholder="Search project or invoice..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
            <SelectTrigger className="w-full sm:w-45">
              <div className="flex items-center gap-2">
                <ListFilter className="h-4 w-4" />
                <SelectValue placeholder="Project Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="revision">Revision</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={resetFilters}
              className="h-9 px-2 lg:px-3 text-destructive hover:text-destructive"
            >
              Reset <FilterX className="ml-2 h-4 w-4" />
            </Button>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-full sm:w-65 justify-start text-left font-normal h-9",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Filter by deadline</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>  
        <DataTable
          columns={columns}
          data={filteredData}
          isLoading={isDataLoading || isDebouncing}
        />

        <CreateProjectDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
        />
        <DeleteProjectDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          project={selectedProject}
        />
    </div>
  )
}