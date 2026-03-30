import api from './client';
import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  TaskBoard,
  CreateBoardRequest,
  UpdateBoardRequest,
  TaskItem,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskItemStatus,
  UserDto,
  GroupDto,
  CreateGroupRequest,
  JoinGroupRequest,
} from '../types';

// ===== Auth API =====
export const authApi = {
  login: (data: LoginRequest) =>
    api.post<TokenResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<TokenResponse>('/auth/register', data),
};

// ===== Board API =====
export const boardApi = {
  getAll: () =>
    api.get<TaskBoard[]>('/boards'),

  getById: (id: string) =>
    api.get<TaskBoard>(`/boards/${id}`),

  getByGroup: (groupId: string) =>
    api.get<TaskBoard[]>(`/boards/group/${groupId}`),

  create: (data: CreateBoardRequest) =>
    api.post<TaskBoard>('/boards', data),

  update: (id: string, data: UpdateBoardRequest) =>
    api.put<TaskBoard>(`/boards/${id}`, data),

  delete: (id: string) =>
    api.delete(`/boards/${id}`),
};

// ===== Task API =====
export const taskApi = {
  getByBoard: (boardId: string) =>
    api.get<TaskItem[]>(`/boards/${boardId}/tasks`),

  getById: (boardId: string, taskId: string) =>
    api.get<TaskItem>(`/boards/${boardId}/tasks/${taskId}`),

  create: (boardId: string, data: CreateTaskRequest) =>
    api.post<TaskItem>(`/boards/${boardId}/tasks`, data),

  update: (boardId: string, taskId: string, data: UpdateTaskRequest) =>
    api.put<TaskItem>(`/boards/${boardId}/tasks/${taskId}`, data),

  updateStatus: (boardId: string, taskId: string, status: TaskItemStatus) =>
    api.patch<TaskItem>(`/boards/${boardId}/tasks/${taskId}/status`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' },
    }),

  delete: (boardId: string, taskId: string) =>
    api.delete(`/boards/${boardId}/tasks/${taskId}`),
};

// ===== User API =====
export const userApi = {
  getAll: () =>
    api.get<UserDto[]>('/users'),
};

// ===== Group API =====
export const groupApi = {
  getMyGroups: () =>
    api.get<GroupDto[]>('/groups'),

  getMembers: (groupId: string) =>
    api.get<{ id: string; userId: string; userName: string; email: string; joinedAt: string }[]>(`/groups/${groupId}/members`),

  create: (data: CreateGroupRequest) =>
    api.post<GroupDto>('/groups', data),

  join: (data: JoinGroupRequest) =>
    api.post<GroupDto>('/groups/join', data),

  update: (groupId: string, data: { name: string; description?: string }) =>
    api.put<GroupDto>(`/groups/${groupId}`, data),

  delete: (groupId: string) =>
    api.delete(`/groups/${groupId}`),
};
