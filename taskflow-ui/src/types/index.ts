// ===== Types cho Frontend =====
// Giống DTOs bên .NET, nhưng dùng TypeScript interface
// interface = định nghĩa "hình dạng" của data (có những field nào, kiểu gì)

// --- Auth ---
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserDto {
  id: string;
  fullName: string;
  email: string;
}

// --- Board ---
export interface TaskBoard {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  groupId: string | null;
  groupName: string | null;
  createdAt: string;
  taskCount: number;
}

export interface CreateBoardRequest {
  name: string;
  description?: string;
  groupId?: string;
}

export interface UpdateBoardRequest {
  name: string;
  description?: string;
}

// --- Group ---
export interface GroupDto {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  ownerName: string;
  inviteCode: string;
  memberCount: number;
  createdAt: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export interface JoinGroupRequest {
  inviteCode: string;
}

// --- Task ---
// Enum trong TypeScript - tương tự enum trong C#
export type TaskItemStatus = 'Todo' | 'InProgress' | 'Done' | 'Cancelled';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: TaskItemStatus;
  priority: TaskPriority;
  deadline: string | null;
  isOverdue: boolean;
  isPrivate: boolean;
  boardId: string;
  assignedToId: string | null;
  assignedToName: string | null;
  assignedToIds: string[];
  assignedToNames: string[];
  createdAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  deadline?: string;
  assignedToIds?: string[];
  isPrivate?: boolean;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  status: TaskItemStatus;
  priority: TaskPriority;
  deadline?: string;
  assignedToIds?: string[];
  isPrivate?: boolean;
}
