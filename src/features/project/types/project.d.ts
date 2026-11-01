export type ProjectStatus = 'pending' | 'in_progress' | 'revision' | 'completed' | 'cancelled';

export interface IProject {
  id: string;
  user_id: string;
  invoice_id: string | null;
  title: string;
  description: string | null;
  status: ProjectStatus;
  start_date: string | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  invoices?: {
    invoice_number: string;
    title: string;
    status: string;
    total: number;
    customers: {
      name: string;
      email: string;
    };
  };
}

export interface IProjectUpdate {
  id: string;
  project_id: string;
  status_at_time: ProjectStatus;
  note: string | null;
  created_by: string;
  created_at: string;
  users?: {
    name: string;
    email: string;
  };
  creator?: {
    name: string;
    email: string;
  };
}

export type CreateProjectInput = Omit<IProject, 'id' | 'created_at' | 'updated_at' | 'user_id'>;
export type UpdateProjectInput = Partial<CreateProjectInput>;
export type CreateProjectUpdateInput = Omit<IProjectUpdate, 'id' | 'created_at' | 'created_by'>;