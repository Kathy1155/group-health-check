import React from 'react';
import { useState } from 'react';
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning';

interface GroupInfo {
  code: string;
  name: string;
}

const RosterUploadPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [groupCodeInput, setGroupCodeInput] = useState('');
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  // 只有在 Step 2 且已選檔案時，才視為有未儲存變更
  const isDirty = step === 2 && !!file;
  useUnsavedChangesWarning(isDirty);

  // Step1：確認團體代碼 → 向後端查詢
  const handleConfirmCode = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = groupCodeInput.trim();
    if (!trimmed) {
      alert('請先輸入團體代碼');
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/groups/code/${encodeURIComponent(trimmed)}`
      );

      if (res.status === 404) {
        alert('查無此團體代碼');
        setGroupInfo(null);
        return;
      }

      if (!res.ok) {
        throw new Error('後端回傳錯誤');
      }

      const data = await res.json();

      setGroupInfo({
        code: data.groupCode ?? trimmed,
        name: data.name ?? '',
      });

      setStep(2);
    } catch (err) {
      console.error('查詢團體資料失敗', err);
      alert('查詢團體資料失敗，請稍後再試');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const handleBack = () => {
    setStep(1);
    setFile(null);
    setFileInputKey((k) => k + 1);
  };

  // Step2：儲存（假上傳：只送 groupCode + fileName 給後端）
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupInfo) {
      alert('請先輸入並確認團體代碼');
      return;
    }
    if (!file) {
      alert('請選擇要上傳的名冊檔案');
      return;
    }

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.csv')) {
      alert('目前僅接受 CSV 檔（副檔名必須是 .csv）');
      return;
    }

    const payload = {
      groupCode: groupInfo.code,
      fileName: file.name,
    };

    console.log('暫存送出的資料（上傳團體名冊）', payload);

    try {
      const res = await fetch('http://localhost:3000/roster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 400) {
        const text = await res.text();
        console.error('後端 400：', text);
        alert('上傳失敗：目前僅接受 CSV 檔案');
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        console.error('後端錯誤：', res.status, text);
        alert('上傳失敗，請稍後再試');
        return;
      }

      const result = await res.json();
      console.log('上傳成功（後端回傳）', result);
      alert('上傳並儲存成功（目前為後端假資料）');

      // 成功後：回到 Step1 並清空所有欄位
      setStep(1);
      setGroupCodeInput('');
      setGroupInfo(null);
      setFile(null);
      setFileInputKey((k) => k + 1);
    } catch (error) {
      console.error('呼叫後端失敗（可能是後端沒跑或網路錯誤）', error);
      alert('無法連線到伺服器，請確認後端是否有啟動');
    }
  };

  return (
    <div className="page-container">
      <div className="page-card">
        <h2 className="page-title">上傳團體名冊界面</h2>

        {/* Step 1：輸入團體代碼 */}
        {step === 1 && (
          <form className="page-form" onSubmit={handleConfirmCode}>
            <div className="form-row single">
              <div className="form-field form-field-narrow">
                <label className="form-label" htmlFor="groupCodeInput">
                  請輸入欲上傳之團體代碼：
                </label>
                <input
                  id="groupCodeInput"
                  className="form-input"
                  value={groupCodeInput}
                  onChange={(e) => setGroupCodeInput(e.target.value)}
                  placeholder="例如 A0001"
                />
              </div>
            </div>

            <div className="form-actions-center">
              <button
                type="submit"
                className="primary-button full-width-button"
              >
                確定
              </button>
            </div>
          </form>
        )}

        {/* Step 2：顯示團體名稱 + 上傳檔案 */}
        {step === 2 && groupInfo && (
          <form className="page-form" onSubmit={handleSave}>
            <div className="form-row single">
              <div className="form-field">
                <div className="form-label">
                  團體名稱：{groupInfo.name} - {groupInfo.code}
                </div>
              </div>
            </div>

            <div className="form-row single">
              <div className="form-field form-field-narrow">
                <label className="form-label" htmlFor="rosterFile">
                  上傳團體名冊：
                </label>
                <input
                  key={fileInputKey}
                  id="rosterFile"
                  type="file"
                  className="form-input"
                  accept=".csv"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="form-actions-center gap">
              <button
                type="button"
                className="secondary-button"
                onClick={handleBack}
              >
                上一步
              </button>
              <button type="submit" className="primary-button">
                儲存
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RosterUploadPage;
