import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DangerZoneTabProps {
  language: 'zh' | 'zht' | 'en';
}

export default function DangerZoneTab({ language }: DangerZoneTabProps) {
  const [confirm, setConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const t = (zh: string, en: string) => language === 'en' ? en : zh;

  const deleteAccount = async () => {
    if (confirm !== 'DELETE') return;
    setDeleting(true);
    setError('');
    try {
      const res = await fetch('/api/users/me', { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete account');
      }
      window.location.href = '/';
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-rose-700 mb-1">{t('危险操作', 'Danger Zone')}</h3>
        <p className="text-xs text-slate-500">{t('删除账号后无法恢复', 'Account deletion cannot be undone')}</p>
      </div>
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-rose-700"><AlertTriangle className="w-4 h-4" />{t('删除账号', 'Delete account')}</div>
        {error && <div className="text-xs text-rose-700">{error}</div>}
        <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="DELETE" className="w-full px-3 py-2.5 bg-white border border-rose-200 rounded-xl text-sm" />
        <button onClick={deleteAccount} disabled={confirm !== 'DELETE' || deleting} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white rounded-xl text-sm font-bold">
          <Trash2 className="w-4 h-4" />
          {deleting ? t('删除中...', 'Deleting...') : t('永久删除账号', 'Permanently Delete Account')}
        </button>
      </div>
    </div>
  );
}
