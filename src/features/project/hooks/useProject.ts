import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  getProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  getProjectUpdates, 
  createProjectUpdate, 
  updateProjectUpdateStatus,
  updateProjectStatus,
  deleteProjectUpdate,
  updateProjectUpdate,
  deleteProject
} from "../api/project-api";
import type {  UpdateProjectInput, CreateProjectUpdateInput, ProjectStatus } from "../types/project";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => getProjectById(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create project");
    },
  });
}

export function useUpdateMainProjectStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProjectStatus }) =>
      updateProjectStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Status utama proyek diperbarui");
    },
    onError: (error: any) => {
      toast.error("Gagal memperbarui status proyek", {
        description: error.message,
      });
    }
  });
}

export function useUpdateUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ updateId, status }: { updateId: string; status: ProjectStatus; projectId: string }) =>
      updateProjectUpdateStatus(updateId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-updates", variables.projectId] });
    },
    onError: (error: any) => {
      toast.error("Gagal memperbarui status progres", {
        description: error.message,
      });
    }
  });
}

export function useProjectUpdates(projectId: string) {
  return useQuery({
    queryKey: ["project-updates", projectId],
    queryFn: () => getProjectUpdates(projectId),
    enabled: !!projectId,
  });
}

export function useCreateProjectUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectUpdateInput) => createProjectUpdate(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-updates", variables.project_id] });
      toast.success("Update progres berhasil ditambahkan");
    },
  });
}

export function useDeleteUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteProjectUpdate(id),
    onSuccess: () => {
      // Invalidate agar list update ter-refresh
      queryClient.invalidateQueries({ queryKey: ["project-updates"] });
      toast.success("Catatan progres berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error("Gagal menghapus", { description: error.message });
    }
  });
}

export function useUpdateUpdateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { note: string; status_at_time: ProjectStatus } }) =>
      updateProjectUpdate(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["project-updates", data.project_id] });
      toast.success("Catatan progres diperbarui");
    },
    onError: (error: any) => {
      toast.error("Gagal memperbarui", { description: error.message });
    }
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) =>
      updateProject(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", data.id] });
      toast.success("Proyek berhasil diperbarui");
    },
    onError: (error: any) => {
      toast.error("Gagal memperbarui proyek", {
        description: error.message,
      });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete project");
    },
  });
}