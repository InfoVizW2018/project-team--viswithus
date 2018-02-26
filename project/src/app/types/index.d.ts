// All custom interfaces and the like are here

export interface Person {
  alias?: string;
  created_at: string;
  dates?: string;
  first_name?: string;
  full_name?: string;
  honorific: string;
  id: number;
  last_name?: string;
  pseudonym: string;
  societaire_pensionnaire: string;
  updated_at: string;
  url?: string;
}

export interface PerformanceTotal {
  date: string;
  id?: number;
  title?: string;
  total?: number;
}

export interface PlaySales {
  author: string;
  date: string;
  genre: string;
  name: string;
  play_performance_id: number;
  seating_capacity: number;
  title: string;
  total_sold?: number;
}

export interface PlayTotal {
  id: number;
  title: string;
  total: number;
}

export interface Play {
  _packed_id: number;
  acts?: number;
  alternative_title?: string;
  author?: string;
  created_at?: string;
  date_de_creation?: string;
  expert_validated?: boolean;
  genre?: string;
  id: number;
  musique_danse_machine?: boolean;
  prologue?: boolean;
  prose_vers?: string;
  title: string;
  updated_at?: string;
  url?: string;
}