import React, { useState } from 'react';
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning';
import { createGroup } from '../../api/groupsApi';

const GroupCreatePage: React.FC = () => {
  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [errors, setErrors] = useState({
  groupCode: '',
  contactPhone: '',
  contactEmail: '',
});

  // 有沒有被修改但還沒儲存
  const isDirty =
    groupName !== '' ||
    groupCode !== '' ||
    contactName !== '' ||
    contactPhone !== '' ||
    contactEmail !== '' ||
    status !== 'active';

  // 套用離開提醒
  useUnsavedChangesWarning(isDirty);

  const validateForm = () => {
  const newErrors = {
    groupCode: '',
    contactPhone: '',
    contactEmail: '',
  };

  // 團體代碼：前兩碼英文字母 + 後八碼數字
  const groupCodeRegex = /^[A-Z]{2}\d{8}$/;
  if (!groupCodeRegex.test(groupCode)) {
    newErrors.groupCode =
  '團體代碼格式錯誤，需為前兩碼大寫英文字母、後八碼數字，例如：AB12345678';
  }

  // 聯絡電話：10 碼數字
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(contactPhone)) {
    newErrors.contactPhone = '聯絡電話格式錯誤，請輸入 10 碼數字。';
  }

  // 電子郵件格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contactEmail)) {
    newErrors.contactEmail = '電子郵件格式錯誤，請輸入正確的 Email。';
  }

  setErrors(newErrors);

  return !newErrors.groupCode && !newErrors.contactPhone && !newErrors.contactEmail;
};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const isValid = validateForm();
  if (!isValid) return;

  const payload = {
    groupName,
    groupCode,
    contactName,
    contactPhone: `+886${contactPhone}`,
    contactEmail,
    status,
  };

  try {
    const result = await createGroup(payload);
    console.log('新增成功', result);
    alert('新增成功');

    setGroupName('');
    setGroupCode('');
    setContactName('');
    setContactPhone('');
    setContactEmail('');
    setStatus('active');
    setErrors({
      groupCode: '',
      contactPhone: '',
      contactEmail: '',
    });
  } catch (err: any) {
    console.error('新增失敗：', err);

    if (err instanceof Error) {
      alert(err.message);
    } else {
      alert('新增失敗，請稍後再試');
    }
    if (err instanceof Error && err.message.includes('團體代碼已存在')) {
      setErrors((prev) => ({
        ...prev,
        groupCode: '此團體代碼已被使用，請重新輸入。',
      }));
      return;
    }
  }
};

  return (
    <div className="page-container business-scope">
      <div className="page-card">
        <h2 className="page-title">新增團體資料界面</h2>

        <form className="page-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="groupName">
                團體名稱：
              </label>
              <input
                id="groupName"
                className="form-input"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="groupCode">
                團體代碼：
              </label>

              <input
                id="groupCode"
                className="form-input"
                value={groupCode}
                onChange={(e) => {
                  const value = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, '');
                  setGroupCode(value);
                }}
                placeholder="例如：AB12345678"
                maxLength={10}
                required
              />

              {errors.groupCode && (
                <p style={{ color: 'red', marginTop: 4, fontSize: '14px' }}>
                  {errors.groupCode}
                </p>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="contactName">
                聯絡人姓名：
              </label>
              <input
                id="contactName"
                className="form-input"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="contactPhone">
                聯絡人電話：
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ whiteSpace: 'nowrap' }}>+886</span>
                <input
                  id="contactPhone"
                  className="form-input"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="請輸入 10 碼數字"
                  maxLength={10}
                  required
                />
              </div>
              {errors.contactPhone && (
                <p style={{ color: 'red', marginTop: '4px', fontSize: '14px' }}>
                  {errors.contactPhone}
                </p>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="contactEmail">
                聯絡人郵件：
              </label>
              <input
                id="contactEmail"
                type="email"
                className="form-input"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="例如：example@gmail.com"
                required
              />
              {errors.contactEmail && (
                <p style={{ color: 'red', marginTop: '4px', fontSize: '14px' }}>
                  {errors.contactEmail}
                </p>
              )}
            </div>

            <div className="form-field">
              <span className="form-label">團體狀態：</span>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="active"
                    checked={status === 'active'}
                    onChange={() => setStatus('active')}
                  />
                  啟用
                </label>
                <label>
                  <input
                    type="radio"
                    value="inactive"
                    checked={status === 'inactive'}
                    onChange={() => setStatus('inactive')}
                  />
                  停用
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions-center">
            <button type="submit" className="primary-button">
              儲存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupCreatePage;