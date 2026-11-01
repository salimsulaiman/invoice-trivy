import { apiClient } from "@/lib/api-client";
import type {
  CreateProjectInput,
  CreateProjectUpdateInput,
  IProject,
  IProjectUpdate,
  ProjectStatus,
  UpdateProjectInput,
} from "../types/project";

function normalizeProject(project: any): IProject {
  if (!project) return project;
  const normalized = { ...project };
  if (normalized.invoice && !normalized.invoices) {
    normalized.invoices = { ...normalized.invoice };
  }
  if (normalized.invoices) {
    if (normalized.invoices.customer && !normalized.invoices.customers) {
      normalized.invoices.customers = normalized.invoices.customer;
    }
  }
  return normalized as IProject;
}

function normalizeProjectUpdate(update: any): IProjectUpdate {
  if (!update) return update;
  const normalized = { ...update };
  if (normalized.user && !normalized.users) {
    normalized.users = normalized.user;
  }
  if (normalized.creator && !normalized.users) {
    normalized.users = normalized.creator;
  }
  return normalized as IProjectUpdate;
}

export async function getProjects() {
  const data = await apiClient.get<any[]>("/projects");
  return (data || []).map(normalizeProject);
}

export async function getProjectById(id: string) {
  const data = await apiClient.get<any>(`/projects/${id}`);
  return normalizeProject(data);
}

export async function createProject(input: CreateProjectInput) {
  const data = await apiClient.post<any>("/projects", input);
  return normalizeProject(data);
}

export async function updateProject(id: string, updates: UpdateProjectInput) {
  const data = await apiClient.put<any>(`/projects/${id}`, updates);
  return normalizeProject(data);
}

export async function deleteProject(id: string) {
  await apiClient.delete(`/projects/${id}`);
  return true;
}

export async function updateProjectStatus(id: string, status: ProjectStatus) {
  const data = await apiClient.put<any>(`/projects/${id}`, { status });
  return normalizeProject(data);
}

export async function getProjectUpdates(projectId: string) {
  const data = await apiClient.get<any[]>("/project-updates");
  const updates = data || [];
  return updates
    .filter((u) => String(u.project_id) === String(projectId))
    .map(normalizeProjectUpdate);
}

export async function createProjectUpdate(input: CreateProjectUpdateInput) {
  const data = await apiClient.post<any>("/project-updates", input);
  return normalizeProjectUpdate(data);
}

export async function updateProjectUpdateStatus(updateId: string, status: ProjectStatus) {
  const data = await apiClient.put<any>(`/project-updates/${updateId}`, { status_at_time: status });
  return normalizeProjectUpdate(data);
}

export async function updateProjectUpdate(
  id: string, 
  input: { note: string; status_at_time: ProjectStatus }
) {
  const data = await apiClient.put<any>(`/project-updates/${id}`, input);
  return normalizeProjectUpdate(data);
}

export async function deleteProjectUpdate(id: string) {
  await apiClient.delete(`/project-updates/${id}`);
  return true;
}