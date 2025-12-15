import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning';
import { useState } from 'react';

interface GroupInfo {
  code: string;
  name: string;
}


const RosterUploadPage: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [groupCodeInput, setGroupCodeInput] = useState('');
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  // 有沒有未儲存的變更：
  // 只有在 Step 2 且已經選了檔案時，才提醒離開
  const isDirty = step === 2 && !!file;

  // 套用關閉/重整提醒
  useUnsavedChangesWarning(isDirty);


  const handleConfirmCode = async (e: React.FormEvent) => {
  e.preventDefault();

  const trimmed = groupCodeInput.trim();
  if (!trimmed) {
    alert('請先輸入團體代碼');
    return;
  }

  try {
    const res = await fetch(`/api/groups/code/${encodeURIComponent(trimmed)}`);

    if (res.status === 404) {
      alert('查無此團體代碼');
      setGroupInfo(null);
      return;
    }

    if (!res.ok) {
      const text = await res.text();
      console.error('查詢失敗：', res.status, text);
      alert('查詢失敗，請稍後再試');
      return;
    }

    const data = await res.json();
    setGroupInfo({
      code: data.groupCode ?? trimmed,
      name: data.name ?? '',
    });
    setStep(2);
  } catch (err) {
    console.error('呼叫後端失敗：', err);
    alert('無法連線到伺服器，請確認後端是否有啟動');
  }
};

  const handleBack = () => {
    setStep(1);
    setFile(null);
    setFileInputKey((k) => k + 1);
  };

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

  // 儲存前再擋一次（保險）
  const lowerName = file.name.toLowerCase();
  if (!lowerName.endsWith('.csv')) {
    alert('目前僅接受 CSV 檔（副檔名必須是 .csv）');
    return;
  }

  setIsSaving(true);
  try {
    // 目前先做「假上傳」：只送 groupCode + fileName
    // 之後要真的傳檔再改成 FormData
    const payload = {
      groupCode: groupInfo.code,
      fileName: file.name,
    };

    const res = await fetch('/api/roster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('上傳失敗：', res.status, text);
      alert('上傳失敗，請稍後再試');
      return;
    }

    alert('上傳並儲存成功（已呼叫後端 API）');

    // 成功後清空檔案選擇，但留在 Step2，方便重新上傳
    setFile(null);
    setFileInputKey((k) => k + 1);
  } catch (err) {
    console.error('呼叫後端失敗：', err);
    alert('無法連線到伺服器，請確認後端是否有啟動');
  } finally {
    setIsSaving(false);
  }
};


  return (
    <div className="page-container">
      <div className="page-card">
        <h2 className="page-title">上傳團體名冊界面</h2>

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
                />
              </div>
            </div>

            {/* 確定按鈕寬度與輸入欄位一致 */}
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
                  accept=".csv,text/csv"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    if (!f) {
                      setFile(null);
                      return;
                    }

                    const lower = f.name.toLowerCase();
                    if (!lower.endsWith('.csv')) {
                      alert('目前僅接受 CSV 檔（副檔名必須是 .csv）');
                      e.target.value = '';
                      setFile(null);
                      return;
                    }

                    setFile(f);
                  }}
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
              <button type="submit" className="primary-button" disabled={isSaving}>
                {isSaving ? '儲存中...' : '儲存'}
              </button>

            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RosterUploadPage;
