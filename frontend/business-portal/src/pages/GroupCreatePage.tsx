import React, { useState } from 'react';
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning.ts';

const GroupCreatePage: React.FC = () => {
  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

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

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

    const payload = {
      groupName,
      groupCode,
      contactName,
      contactPhone,
      contactEmail,
      status,
    };

    const res = await fetch('http://localhost:3000/groups', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await res.json();
  console.log("新增成功", result);
  alert('新增成功（目前為後端假資料）');

    console.log('暫存送出的資料（新增團體）', payload);
    alert('儲存成功（目前為前端假資料）');

    // 儲存成功後清空表單 → isDirty 變回 false，就不再跳警告
    setGroupName('');
    setGroupCode('');
    setContactName('');
    setContactPhone('');
    setContactEmail('');
    setStatus('active');
  };

  return (
    <div className="page-container">
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
                onChange={(e) => setGroupCode(e.target.value)}
                required
              />
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
              <input
                id="contactPhone"
                className="form-input"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
              />
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
                required
              />
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
