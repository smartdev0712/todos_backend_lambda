export interface TaskType {
  id: { S: string };
  title: { S: string };
  details: { S: string };
  created_date: { N: string };
  due_date: { N: string };
  priority: { S: string };
}

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
