import { useState } from 'react';
import { Check, Save, Users, AlertCircle } from 'lucide-react';
import { type SessionUser } from '../../utils/useSession';

interface UserTypeTabProps {
  user: SessionUser;
  language: 'zh' | 'zht' | 'en';
  onUserUpdate: () => void;
}

const userTypes = ['STUDENT', 'TEACHER', 'COUNSELOR', 'PARENT', 'OTHER'] as const;

export default function UserTypeTab({ user, language, onUserUpdate }: UserTypeTabProps) {
  const [userType, setUserType] = useState(user.userType || 'STUDENT');
  const [teacherSubject, setTeacherSubject] = useState(user.teacherSubject || '');
  const [counselorSpecialty, setCounselorSpecialty] = useState(user.counselorSpecialty || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const t = (zh: string, en: string) => language === 'en' ? en : zh;

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userType,
          teacherSubject: teacherSubject.trim() || null,
          counselorSpecialty: counselorSpecialty.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update user type');
      }
      setSaved(true);
      onUserUpdate();
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">{t('用户类型', 'User Type')}</h3>
        <p className="text-xs text-slate-500">{t('选择最符合您使用场景的身份', 'Choose the role that best matches your use case')}</p>
      </div>

      {error && <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700"><AlertCircle className="w-4 h-4" />{error}</div>}
      {saved && <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700"><Check className="w-4 h-4" />{t('保存成功', 'Saved successfully')}</div>}

      <div className="grid grid-cols-1 gap-2">
        {userTypes.map(type => (
          <button
            key={type}
            onClick={() => setUserType(type)}
            className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
              userType === type ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2"><Users className="w-4 h-4" />{type}</span>
            {userType === type && <Check className="w-4 h-4" />}
          </button>
        ))}
      </div>

      {userType === 'TEACHER' && (
        <input value={teacherSubject} onChange={e => setTeacherSubject(e.target.value)} placeholder={t('教授科目', 'Teaching subject')} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" />
      )}
      {userType === 'COUNSELOR' && (
        <input value={counselorSpecialty} onChange={e => setCounselorSpecialty(e.target.value)} placeholder={t('辅导方向', 'Counselor specialty')} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" />
      )}

      <button onClick={save} disabled={saving} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-sm font-bold">
        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? t('保存中...', 'Saving...') : t('保存修改', 'Save Changes')}
      </button>
    </div>
  );
}
