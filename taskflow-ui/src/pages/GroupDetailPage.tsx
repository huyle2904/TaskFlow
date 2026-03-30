import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { boardApi, groupApi } from '../api/services';
import type { TaskBoard, GroupDto } from '../types';
import { Plus, Clipboard, Users, Copy, Check, X, Pencil, Trash2, Calendar, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const [boards, setBoards] = useState<TaskBoard[]>([]);
  const [group, setGroup] = useState<GroupDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState<TaskBoard | null>(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');
  const [editBoardName, setEditBoardName] = useState('');
  const [editBoardDesc, setEditBoardDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchGroupDetails = useCallback(async () => {
    if (!groupId) return;
    setIsLoading(true);
    try {
      const [boardsRes, groupsRes] = await Promise.all([
        boardApi.getByGroup(groupId),
        groupApi.getMyGroups()
      ]);
      
      const foundGroup = groupsRes.data.find((g: GroupDto) => g.id === groupId);
      setGroup(foundGroup || null);
      setBoards(boardsRes.data);
    } catch (error: any) {
      console.error('Error fetching group details:', error);
      toast.error(error?.response?.data?.message || 'Không thể tải thông tin nhóm');
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroupDetails();
  }, [fetchGroupDetails]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await boardApi.create({ 
        name: newBoardName, 
        description: newBoardDesc || undefined,
        groupId: groupId 
      });
      toast.success('Tạo board thành công!');
      setShowCreateModal(false);
      setNewBoardName('');
      setNewBoardDesc('');
      fetchGroupDetails();
    } catch {
      toast.error('Tạo board thất bại');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyInviteCode = () => {
    if (group?.inviteCode) {
      navigator.clipboard.writeText(group.inviteCode);
      setCopiedCode(true);
      toast.success('Đã copy mã mời!');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const openEditModal = (board: TaskBoard) => {
    setEditingBoard(board);
    setEditBoardName(board.name);
    setEditBoardDesc(board.description || '');
    setShowEditModal(true);
  };

  const handleUpdateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBoard) return;
    setIsUpdating(true);
    try {
      await boardApi.update(editingBoard.id, { name: editBoardName, description: editBoardDesc || undefined });
      toast.success('Cập nhật board thành công!');
      setShowEditModal(false);
      setEditingBoard(null);
      fetchGroupDetails();
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteBoard = async (boardId: string, boardName: string) => {
    if (!confirm(`Bạn chắc chắn muốn xóa board "${boardName}"?`)) return;
    try {
      await boardApi.delete(boardId);
      toast.success('Đã xóa board');
      fetchGroupDetails();
    } catch {
      toast.error('Xóa board thất bại');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-medium text-gray-900">Không tìm thấy nhóm</h2>
        <p className="text-gray-500 mt-1">Nhóm này không tồn tại hoặc bạn không có quyền truy cập.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
            {group.description && (
              <p className="text-gray-500 mt-1">{group.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Users size={16} />
                <span>{group.memberCount} thành viên</span>
              </div>
              <span>·</span>
              <span>Tạo ngày {new Date(group.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
          <button
            onClick={handleCopyInviteCode}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-sm"
          >
            {copiedCode ? <Check size={16} /> : <Copy size={16} />}
            {copiedCode ? 'Đã copy!' : 'Copy mã mời'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Boards</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <Plus size={20} />
          Tạo Board
        </button>
      </div>

      {boards.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <Clipboard size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Chưa có board nào</h3>
          <p className="text-gray-500 mt-1">Tạo board đầu tiên trong nhóm này!</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Tạo Board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => (
            <div
              key={board.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-indigo-200 transition-all group"
            >
              <div className="flex items-start justify-between">
                <Link to={`/boards/${board.id}`} className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {board.name}
                  </h3>
                  {board.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{board.description}</p>
                  )}
                </Link>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(board)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"
                  >
                    <Pencil size={16} className="text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteBoard(board.id, board.name)}
                    className="p-1.5 hover:bg-red-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Layers size={14} />
                    <span>{board.taskCount} {board.taskCount === 1 ? 'task' : 'tasks'}</span>
                  </div>
                  {board.ownerId && (
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                      Owner
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Calendar size={12} />
                  <span>{new Date(board.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Tạo Board mới</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên board *
                </label>
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  required
                  placeholder="Ví dụ: Sprint 1"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={newBoardDesc}
                  onChange={(e) => setNewBoardDesc(e.target.value)}
                  placeholder="Mô tả board (tùy chọn)"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isCreating ? 'Đang tạo...' : 'Tạo Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingBoard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Chỉnh sửa Board</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateBoard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên board *
                </label>
                <input
                  type="text"
                  value={editBoardName}
                  onChange={(e) => setEditBoardName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={editBoardDesc}
                  onChange={(e) => setEditBoardDesc(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isUpdating ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}