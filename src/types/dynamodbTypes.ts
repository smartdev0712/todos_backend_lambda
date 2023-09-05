export interface CreateBodyType {
  title: string;
  details: string;
  created_date: number;
  due_date: number;
  priority: string;
}

export interface UpdateBodyType {
  title: string;
  details: string;
  due_date: number;
  priority: string;
}
