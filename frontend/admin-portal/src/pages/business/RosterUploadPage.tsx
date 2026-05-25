import { useState } from "react";
import { useUnsavedChangesWarning } from "../../hooks/useUnsavedChangesWarning";
import { UploadCloud } from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

interface GroupInfo {
  code: string;
  name: string;
}

interface RosterMember {
  id: number;
  name: string;
  idNumber: string;
  gender: "Male" | "Female";
  birthDate: string;
  phone: string;
  email: string;
  address: string;
}

const RosterUploadPage: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [groupCodeInput, setGroupCodeInput] = useState("");
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const [rosterList, setRosterList] = useState<RosterMember[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [rosterError, setRosterError] = useState("");

  const isDirty = step === 2 && !!file;
  useUnsavedChangesWarning(isDirty);

  const fetchRosterList = async (groupCode: string) => {
    try {
      setLoadingRoster(true);
      setRosterError("");

      const params = new URLSearchParams({ groupCode });
      const res = await fetch(`${API_BASE_URL}/roster?${params.toString()}`);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "讀取名冊列表失敗");
      }

      const data = await res.json();

      setRosterList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("讀取名冊列表失敗：", err);
      setRosterError("無法讀取名冊列表，請確認後端與資料庫是否正常。");
      setRosterList([]);
    } finally {
      setLoadingRoster(false);
    }
  };

  const handleConfirmCode = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = groupCodeInput.trim().toUpperCase();

    if (!trimmed) {
      alert("請先輸入團體代碼");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/groups/code/${encodeURIComponent(trimmed)}`,
      );

      if (res.status === 404) {
        alert("查無此團體代碼");
        setGroupInfo(null);
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        console.error("查詢失敗：", res.status, text);
        alert("查詢失敗，請稍後再試");
        return;
      }

      const data = await res.json();

      const nextGroupInfo = {
        code: data.groupCode ?? trimmed,
        name: data.groupName ?? data.name ?? "",
      };

      setGroupInfo(nextGroupInfo);
      setStep(2);
      await fetchRosterList(nextGroupInfo.code);
    } catch (err) {
      console.error("呼叫後端失敗：", err);
      alert("無法連線到伺服器，請確認後端是否有啟動");
    }
  };

  const handleBack = () => {
    setStep(1);
    setFile(null);
    setRosterList([]);
    setRosterError("");
    setFileInputKey((k) => k + 1);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupInfo) {
      alert("請先輸入並確認團體代碼");
      return;
    }

    if (!file) {
      alert("請選擇要上傳的名冊檔案");
      return;
    }

    const lowerName = file.name.toLowerCase();

    if (!lowerName.endsWith(".csv")) {
      alert("目前僅接受 CSV 檔（副檔名必須是 .csv）");
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("groupCode", groupInfo.code);
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/roster/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("上傳失敗：", res.status, data);

        if (data?.details && Array.isArray(data.details)) {
          alert(`${data.message}\n\n${data.details.join("\n")}`);
        } else {
          alert(data?.message ?? "上傳失敗，請稍後再試");
        }

        return;
      }

      alert(`上傳並匯入成功，共 ${data.count} 筆`);

      setFile(null);
      setFileInputKey((k) => k + 1);

      await fetchRosterList(groupInfo.code);
    } catch (err) {
      console.error("呼叫後端失敗：", err);
      alert("無法連線到伺服器，請確認後端是否有啟動");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-container business-scope roster-upload-page">
      <div className="page-card">
        <form className="roster-code-form" onSubmit={handleConfirmCode}>
          <label className="form-label" htmlFor="groupCodeInput">
            請輸入欲上傳之團體代碼：
          </label>

          <div className="roster-code-row">
            <input
              id="groupCodeInput"
              className="form-input"
              value={groupCodeInput}
              onChange={(e) => setGroupCodeInput(e.target.value.toUpperCase())}
              placeholder="前兩碼大寫英文字母＋後八碼數字"
            />

            <button type="submit" className="primary-button">
              確定
            </button>
          </div>
        </form>

        {step === 2 && groupInfo && (
          <form className="roster-upload-content" onSubmit={handleSave}>
            <section className="roster-combined-card">
  <div className="roster-company-info">
    <div className="roster-card-icon">▦</div>

    <div>
      <p className="roster-card-label">公司</p>
      <h3 className="roster-card-title">{groupInfo.name}</h3>
      <p className="roster-card-code">團體代碼：{groupInfo.code}</p>
    </div>
  </div>

  <div className="roster-upload-card">
    <label htmlFor="rosterFile" className="roster-upload-dropzone">
      <div className="roster-upload-icon">
        <UploadCloud size={44} strokeWidth={1.8} />
      </div>
      <p className="roster-upload-title">
        拖曳 CSV 檔案至此或點擊選取
      </p>
      <p className="roster-upload-hint">
        可支援多筆或單筆名冊資料上傳
      </p>
      <p className="roster-file-name">
        {file ? file.name : "尚未選擇檔案"}
      </p>
    </label>

    <input
      key={fileInputKey}
      id="rosterFile"
      className="roster-file-input"
      type="file"
      accept=".csv,text/csv"
      onChange={(e) => {
        const f = e.target.files?.[0] ?? null;

        if (!f) {
          setFile(null);
          return;
        }

        const lower = f.name.toLowerCase();

        if (!lower.endsWith(".csv")) {
          alert("目前僅接受 CSV 檔（副檔名必須是 .csv）");
          e.target.value = "";
          setFile(null);
          return;
        }

        setFile(f);
      }}
    />
  </div>
</section>

            <div className="roster-upload-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleBack}
                disabled={isSaving}
              >
                重新選擇團體
              </button>

              <button type="submit" className="primary-button" disabled={isSaving}>
                {isSaving ? "上傳中..." : "上傳"}
              </button>
            </div>

            <section className="roster-list-section">
              <div className="group-list-section-title">團體現有名冊列表</div>

              {loadingRoster && (
                <div className="group-list-message">名冊資料載入中...</div>
              )}

              {rosterError && !loadingRoster && (
                <div className="group-list-message error">{rosterError}</div>
              )}

              {!loadingRoster && !rosterError && (
                <div className="roster-table-card">
                  <table className="roster-table">
                    <thead>
                      <tr>
                        <th>姓名</th>
                        <th>身分證字號</th>
                        <th>性別</th>
                        <th>生日</th>
                        <th>手機</th>
                        <th>電子郵件</th>
                        <th>地址</th>
                      </tr>
                    </thead>

                    <tbody>
                      {rosterList.length === 0 ? (
                        <tr>
                          <td colSpan={7}>
                            <div className="group-list-empty">
                              目前尚無名冊資料
                            </div>
                          </td>
                        </tr>
                      ) : (
                        rosterList.map((person) => (
                          <tr key={person.id}>
                            <td className="roster-name-cell">{person.name}</td>
                            <td className="roster-id-cell">{person.idNumber}</td>
                            <td>{person.gender === "Female" ? "女" : "男"}</td>
                            <td>{person.birthDate}</td>
                            <td>{person.phone}</td>
                            <td>{person.email}</td>
                            <td className="roster-address-cell">
                              {person.address}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </form>
        )}
      </div>
    </div>
  );
};

export default RosterUploadPage;
