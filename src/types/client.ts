export interface Client {
  id: string;
  client_name: string;
  contact_method: string | null;
  notes: string | null;
  birthday: string | null; 
  created_at: string;
  deleted_at: string | null;
}

export interface ClientSummary {
  id: string;
  client_name: string;
  contact_method: string | null;
}