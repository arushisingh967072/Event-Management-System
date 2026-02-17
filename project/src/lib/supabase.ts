import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  created_at: string;
};

export type Membership = {
  id: string;
  membership_number: string;
  full_name: string;
  email: string;
  phone: string;
  duration: '6m' | '1y' | '2y';
  start_date: string;
  end_date: string;
  status: 'active' | 'cancelled' | 'expired';
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  membership_id: string | null;
  transaction_type: 'payment' | 'refund' | 'extension';
  amount: number;
  description: string;
  transaction_date: string;
  created_by: string;
  created_at: string;
};

export type Event = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string;
  capacity: number;
  created_by: string;
  created_at: string;
};
