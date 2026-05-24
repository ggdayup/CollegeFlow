import { useEffect, useState } from 'react';
import { Bookmark, Trash2 } from 'lucide-react';
import { type SavedItem } from '../../types';

interface BookmarksTabProps {
  language: 'zh' | 'zht' | 'en';
}

export default function BookmarksTab({ language }: BookmarksTabProps) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const t = (zh: string, en: string) => language === 'en' ? en : zh;

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users/me/saved-items', { credentials: 'include' });
      setItems(res.ok ? await res.json() : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    await fetch(`/api/users/me/saved-items/${id}`, { method: 'DELETE', credentials: 'include' });
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">{t('我的收藏', 'Bookmarks')}</h3>
        <p className="text-xs text-slate-500">{t('管理已保存的大学和专业', 'Manage saved universities and majors')}</p>
      </div>
      {loading ? <div className="text-sm text-slate-400">{t('加载中...', 'Loading...')}</div> : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400"><Bookmark className="w-5 h-5 mx-auto mb-2" />{t('暂无收藏', 'No bookmarks yet')}</div>
      ) : items.map(item => (
        <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">{item.majorNameEn || item.universityNameEn || item.itemId}</div>
            <div className="text-xs text-slate-400">{item.itemType}</div>
          </div>
          <button onClick={() => remove(item.id)} className="p-2 rounded-lg text-rose-500 hover:bg-rose-50" aria-label={t('删除', 'Delete')}><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );
}
