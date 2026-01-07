export type Adventure = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
};
