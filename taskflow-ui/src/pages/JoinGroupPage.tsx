import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupApi } from '../api/services';
import { LogIn, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JoinGroupPage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (inviteCode) {
      setIsLoading(false);
    }
  }, [inviteCode]);

  const handleJoin = async () => {
    if (!inviteCode) return;
    setIsJoining(true);
    try {
      await groupApi.join({ inviteCode });
      setResult('success');
      toast.success('Tham gia nhóm thành công!');
      setTimeout(() => navigate('/groups'), 2000);
    } catch (err: unknown) {
      setResult('error');
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Không thể tham gia nhóm');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
          <LogIn size={32} className="text-indigo-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tham gia nhóm</h1>
        <p className="text-gray-500 mb-6">
          Bạn được mời tham gia một nhóm làm việc. Nhấn nút bên dưới để xác nhận.
        </p>

        {result === 'success' && (
          <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
            <CheckCircle size={20} />
            <span>Tham gia thành công! Đang chuyển...</span>
          </div>
        )}

        {result === 'error' && (
          <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
            <XCircle size={20} />
            <span>Không thể tham gia nhóm</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleJoin}
            disabled={isJoining || result === 'success'}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isJoining ? 'Đang xử lý...' : 'Tham gia ngay'}
          </button>
        </div>
      </div>
    </div>
  );
}
