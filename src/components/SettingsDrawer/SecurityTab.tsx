import { useState } from 'react';
import { Lock, Check, AlertCircle } from 'lucide-react';

interface SecurityTabProps {
  language: 'zh' | 'zht' | 'en';
}

export default function SecurityTab({ language }: SecurityTabProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const t = (zh: string, en: string) => language === 'en' ? en : zh;

  const handleSave = async () => {
    setError('');
    setSuccess(false);

    if (newPassword.length < 8) {
      return setError(t('新密码至少需要8个字符', 'New password must be at least 8 characters'));
    }
    if (newPassword !== confirmPassword) {
      return setError(t('两次输入的新密码不一致', 'New passwords do not match'));
    }
    if (!currentPassword) {
      return setError(t('请输入当前密码', 'Please enter your current password'));
    }

    setSaving(true);

    try {
      const res = await fetch('/api/users/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to change password');
      }

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 3000);
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
        <h3 className="text-sm font-bold text-slate-900 mb-1">{t('修改密码', 'Change Password')}</h3>
        <p className="text-xs text-slate-500">{t('为了账号安全，请定期更换密码', 'For security, change your password regularly')}</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
          <Check className="w-4 h-4 shrink-0" />
          {t('密码修改成功', 'Password changed successfully')}
        </div>
      )}

      <div>
        <label className={labelClass}>{t('当前密码', 'Current Password')}</label>
        <input
          type="password"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          className={inputClass}
          placeholder={t('输入当前密码', 'Enter current password')}
        />
      </div>

      <div>
        <label className={labelClass}>{t('新密码', 'New Password')}</label>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className={inputClass}
          placeholder={t('至少8个字符', 'At least 8 characters')}
        />
        <p className="text-[10px] text-slate-400 mt-1">
          {newPassword.length > 0 && newPassword.length < 8
            ? t(`还需要 ${8 - newPassword.length} 个字符`, `Need ${8 - newPassword.length} more characters`)
            : newPassword.length >= 8
              ? t('密码长度符合要求', 'Password length meets requirements')
              : ''}
        </p>
      </div>

      <div>
        <label className={labelClass}>{t('确认新密码', 'Confirm New Password')}</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className={inputClass}
          placeholder={t('再次输入新密码', 'Re-enter new password')}
        />
        {confirmPassword && newPassword !== confirmPassword && (
          <p className="text-[10px] text-rose-500 mt-1">{t('两次密码输入不一致', 'Passwords do not match')}</p>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-sm font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
      >
        {saving ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Lock className="w-4 h-4" />
        )}
        {saving ? t('修改中...', 'Updating...') : t('修改密码', 'Change Password')}
      </button>
    </div>
  );
}
