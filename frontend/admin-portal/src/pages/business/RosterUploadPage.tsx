import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning';
import { useState } from 'react';

interface GroupInfo {
  code: string;
  name: string;
}

// 假資料：模擬依團體代碼查詢團體名稱
const mockGroups: Record<string, GroupInfo> = {
  A0001: { code: 'A0001', name: 'A公司' },
  B0001: { code: 'B0001', name: 'B公司' },
};

const RosterUploadPage: React.FC = () => {
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


  const handleConfirmCode = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = groupCodeInput.trim();
    if (!trimmed) {
      alert('請先輸入團體代碼');
      return;
    }

    const found = mockGroups[trimmed];

    if (!found) {
      alert('查無此團體代碼（目前使用假資料）');
      setGroupInfo(null);
      return;
    }

    setGroupInfo(found);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setFile(null);
    setFileInputKey((k) => k + 1);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupInfo) {
      alert('請先輸入並確認團體代碼');
      return;
    }
    if (!file) {
      alert('請選擇要上傳的名冊檔案');
      return;
    }

    console.log('準備上傳名冊檔案', {
      groupInfo,
      fileName: file.name,
    });

    alert('上傳並儲存成功（目前為前端假資料）');

    // 成功後清空檔案選擇，但留在 Step2，方便重新上傳
    setFile(null);
    setFileInputKey((k) => k + 1);
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
                  onChange={(e) =>
                    setFile(e.target.files ? e.target.files[0] : null)
                  }
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
