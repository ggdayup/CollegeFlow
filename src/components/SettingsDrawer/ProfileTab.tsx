import { useState } from 'react';
import { Save, Check, AlertCircle } from 'lucide-react';
import { type SessionUser } from '../../utils/useSession';

interface ProfileTabProps {
  user: SessionUser;
  language: 'zh' | 'zht' | 'en';
  onUserUpdate: () => void;
}

export default function ProfileTab({ user, language, onUserUpdate }: ProfileTabProps) {
  const [name, setName] = useState(user.name || '');
  const [schoolName, setSchoolName] = useState(user.schoolName || '');
  const [gradYear, setGradYear] = useState(user.gradYear?.toString() || '');
  const [customNote, setCustomNote] = useState(user.customNote || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const t = (zh: string, en: string) => language === 'en' ? en : zh;

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim() || undefined,
          schoolName: schoolName.trim() || null,
          gradYear: gradYear ? parseInt(gradYear, 10) : null,
          customNote: customNote.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      setSaved(true);
      onUserUpdate();
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all';
  const labelClass = 'block text-xs font-semibold text-slate-600 mb-1.5';

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">{t('基本信息', 'Basic Information')}</h3>
        <p className="text-xs text-slate-500">{t('更新您的个人资料显示', 'Update your personal profile information')}</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
          <Check className="w-4 h-4 shrink-0" />
          {t('保存成功', 'Saved successfully')}
        </div>
      )}

      <div>
        <label className={labelClass}>{t('姓名', 'Name')}</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t('您的姓名', 'Your name')}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>{t('学校名称', 'School Name')}</label>
        <input
          type="text"
          value={schoolName}
          onChange={e => setSchoolName(e.target.value)}
          placeholder={t('您所在的学校', 'Your school name')}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>{t('毕业年份', 'Graduation Year')}</label>
        <input
          type="number"
          value={gradYear}
          onChange={e => setGradYear(e.target.value)}
          placeholder="2026"
          className={inputClass}
          min={2000}
          max={2035}
        />
      </div>

      <div>
        <label className={labelClass}>{t('备注', 'Notes')}</label>
        <textarea
          value={customNote}
          onChange={e => setCustomNote(e.target.value)}
          placeholder={t('任何您想记录的备注...', 'Any notes you want to record...')}
          className={`${inputClass} min-h-[80px] resize-y`}
          rows={3}
        />
      </div>

      <div>
        <label className={labelClass}>{t('邮箱', 'Email')}</label>
        <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500">
          {user.email}
        </div>
        <p className="text-[10px] text-slate-400 mt-1">{t('邮箱地址不可修改', 'Email address cannot be changed')}</p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-sm font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
      >
        {saving ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {saving ? t('保存中...', 'Saving...') : t('保存修改', 'Save Changes')}
      </button>
    </div>
  );
}
