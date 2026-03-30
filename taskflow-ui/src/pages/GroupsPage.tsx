import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { groupApi } from '../api/services';
import { useGroup } from '../contexts/GroupContext';
import { Plus, Users, Copy, Check, X, ArrowRight, Pencil, Trash2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GroupsPage() {
  const { groups, isLoading, refreshGroups } = useGroup();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<{ id: string; name: string; description: string | null; ownerId: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDesc, setEditGroupDesc] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await groupApi.create({ name: newGroupName, description: newGroupDesc || undefined });
      toast.success('Tạo nhóm thành công!');
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDesc('');
      await refreshGroups();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Tạo nhóm thất bại');
    } finally {
      setIsCreating(false);
    }
  };

  const openEditModal = (group: { id: string; name: string; description: string | null; ownerId: string }) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);
      } catch {}
    }
    
    if (group.ownerId !== currentUserId) {
      toast.error('Bạn không có quyền chỉnh sửa nhóm này');
      return;
    }
    setEditingGroup(group);
    setEditGroupName(group.name);
    setEditGroupDesc(group.description || '');
    setShowEditModal(true);
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;
    setIsUpdating(true);
    try {
      await groupApi.update(editingGroup.id, { name: editGroupName, description: editGroupDesc || undefined });
      toast.success('Cập nhật nhóm thành công!');
      setShowEditModal(false);
      setEditingGroup(null);
      await refreshGroups();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    const token = localStorage.getItem('accessToken');
    let isOwner = false;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const ownerId = groups.find(g => g.id === groupId)?.ownerId;
        if (ownerId === payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']) {
          isOwner = true;
        }
      } catch {}
    }

    if (!isOwner) {
      toast.error('Bạn không có quyền xóa nhóm này');
      return;
    }

    if (!confirm(`Bạn chắc chắn muốn xóa nhóm "${groupName}"? Tất cả boards và tasks trong nhóm này cũng sẽ bị xóa.`)) return;

    try {
      await groupApi.delete(groupId);
      toast.success('Đã xóa nhóm');
      await refreshGroups();
      navigate('/');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Xóa nhóm thất bại');
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${code}`);
    setCopiedCode(code);
    toast.success('Đã copy link mời!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nhóm của tôi</h1>
          <p className="text-gray-500 mt-1">Quản lý các nhóm và mời thành viên</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <Plus size={20} />
          Tạo Nhóm
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Chưa có nhóm nào</h3>
          <p className="text-gray-500 mt-1">Tạo nhóm để mời thành viên cùng làm việc!</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Tạo Nhóm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => {
            const token = localStorage.getItem('accessToken');
            let isOwner = false;
            if (token) {
              try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (group.ownerId === payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']) {
                  isOwner = true;
                }
              } catch {}
            }

            return (
              <div
                key={group.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-indigo-200 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link to={`/groups/${group.id}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-indigo-600">{group.name}</h3>
                    </Link>
                    {group.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{group.description}</p>
                    )}
                  </div>
                  {isOwner && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(group)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"
                      >
                        <Pencil size={16} className="text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id, group.name)}
                        className="p-1.5 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <Users size={16} />
                  <span>{group.memberCount} thành viên</span>
                  <span>·</span>
                  <Calendar size={14} />
                  <span>{new Date(group.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Link
                    to={`/groups/${group.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors cursor-pointer text-sm"
                  >
                    <ArrowRight size={16} />
                    Xem nhóm
                  </Link>
                  <button
                    onClick={() => copyInviteCode(group.inviteCode)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-sm"
                  >
                    {copiedCode === group.inviteCode ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Tạo Nhóm mới</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên nhóm *
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required
                  placeholder="Ví dụ: Team Dự án"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Mô tả nhóm (tùy chọn)"
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
                  {isCreating ? 'Đang tạo...' : 'Tạo Nhóm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Chỉnh sửa Nhóm</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên nhóm *
                </label>
                <input
                  type="text"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
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
                  value={editGroupDesc}
                  onChange={(e) => setEditGroupDesc(e.target.value)}
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