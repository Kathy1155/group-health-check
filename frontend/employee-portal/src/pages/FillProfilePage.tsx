import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

// 從 Step3 帶過來的型別
type FromSlotPageState = {
  group: {
    id: number;
    code: string;
    name: string;
    contactName: string;
    idNumber: string;
  };
  branchId: number;
  packageId: number;
  date: string;
  slot: string;
};

// 假的團體名冊資料：之後可以改成從後端撈資料
const mockParticipant = {
  groupCode: "FB12345678",   // 比較像團體代碼
  name: "王小明",
  idNumber: "A123456789",    // 比較像身分證
  phone: "0912345678",
  birthday: "1998-07-03",
};


function FillProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const fromSlot = location.state as FromSlotPageState | null;

  // 如果完全沒有上一頁資料（使用者直接打網址進來）
  if (!fromSlot) {
    return <p>預約流程資訊遺失，請從首頁重新開始預約。</p>;
  }

  const { group, branchId, packageId, date, slot } = fromSlot;

  // 個人基本資料（優先用上一頁帶來的團體資訊／名冊資料）
  const [personalInfo, setPersonalInfo] = useState({
    // 團體代碼：用 group.code，找不到才用假的
    groupCode: group.code ?? mockParticipant.groupCode,

    // 下面幾個暫時先用假名冊資料，之後會改成從後端帶
    name: mockParticipant.name,
    idNumber: mockParticipant.idNumber,
    phone: mockParticipant.phone,
    birthday: mockParticipant.birthday,
  });


  // 是否正在編輯個人資料
  const [isEditing, setIsEditing] = useState(false);

  // 個人病史表單
  const [medicalHistory, setMedicalHistory] = useState({
    bloodType: "",
    allergy: "",
    familyHistory: "",
    chronicDisease: "",
    medication: "",
  });

  const handlePrev = () => {
    navigate(-1);
  };

  const handlePersonalChange = (
    field: keyof typeof personalInfo,
    value: string
  ) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleHistoryChange = (
    field: keyof typeof medicalHistory,
    value: string
  ) => {
    setMedicalHistory((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleEdit = () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    const confirmed = window.confirm("是否確認儲存並完成修改？");
    if (confirmed) {
      setIsEditing(false);
      console.log("已確認修改個人資料：", personalInfo);
      // 之後如果要接後端，也可以在這邊呼叫「更新個人資料」API
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 之後這裡可以改成送到後端建立 Reservation + MedicalProfile
    console.log("送出個人資料：", personalInfo);
    console.log("送出個人病史：", medicalHistory);
    console.log("預約資訊：", { group, branchId, packageId, date, slot });

    // 目前用「假預約編號」，之後接後端就從 response 拿
    const fakeReservationNo = "R20251224001";

    navigate("/done", {
      state: {
        reservationNo: fakeReservationNo,
        groupName: group.name,
        branchId,
        packageId,
        date,
        slot,
        personalInfo,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="page-form">
      <h2>步驟 4：填寫基本資料與病史</h2>

      {/* 區塊一：個人基本資料 */}
            <section style={{ marginTop: "1rem" }}>
        <h3>一、個人基本資料</h3>
        <p style={{ fontSize: "0.9rem", color: "#666" }}>
          以下資料為團體聯絡人提供，如有需要可按「修改資料」進行更新。
        </p>

        <div style={{ marginTop: "0.75rem" }}>
          {/* 團體代碼 */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              團體代碼：
              <input
                value={personalInfo.groupCode}
                onChange={(e) =>
                  handlePersonalChange("groupCode", e.target.value)
                }
                disabled={!isEditing}
                style={{ marginLeft: "0.5rem", padding: "0.3rem" }}
              />
            </label>
          </div>

          {/* 姓名 */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              姓名：
              <input
                value={personalInfo.name}
                onChange={(e) => handlePersonalChange("name", e.target.value)}
                disabled={!isEditing}
                style={{ marginLeft: "0.5rem", padding: "0.3rem" }}
                required
              />
            </label>
          </div>

          {/* 身分證字號 */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              身分證字號：
              <input
                value={personalInfo.idNumber}
                onChange={(e) =>
                  handlePersonalChange("idNumber", e.target.value.toUpperCase())
                }
                disabled={!isEditing}
                style={{ marginLeft: "0.5rem", padding: "0.3rem" }}
                maxLength={10}
                required
              />
            </label>
          </div>

          {/* 聯絡電話 */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              聯絡電話：
              <input
                value={personalInfo.phone}
                onChange={(e) =>
                  handlePersonalChange("phone", e.target.value)
                }
                disabled={!isEditing}
                style={{ marginLeft: "0.5rem", padding: "0.3rem" }}
                required
              />
            </label>
          </div>

          {/* 生日（新增） */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              生日：
              <input
                type="date"
                value={personalInfo.birthday}
                onChange={(e) =>
                  handlePersonalChange("birthday", e.target.value)
                }
                disabled={!isEditing}
                style={{ marginLeft: "0.5rem", padding: "0.3rem" }}
                required
              />
            </label>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginTop: "0.5rem" }}
            onClick={handleToggleEdit}
          >
            {isEditing ? "完成修改" : "修改資料"}
          </button>
        </div>
      </section>

      {/* 區塊二：個人病史表單 */}
      <section style={{ marginTop: "1.5rem" }}>
        <h3>二、個人病史</h3>
        <p style={{ fontSize: "0.9rem", color: "#666" }}>
          請依實際狀況填寫，供醫師於檢查前評估參考。
        </p>

        <div style={{ marginTop: "0.75rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              血型：
              <select
                value={medicalHistory.bloodType}
                onChange={(e) =>
                  handleHistoryChange("bloodType", e.target.value)
                }
                style={{ marginLeft: "0.5rem", padding: "0.3rem" }}
              >
                <option value="">請選擇血型</option>
                <option value="A">A 型</option>
                <option value="B">B 型</option>
                <option value="O">O 型</option>
                <option value="AB">AB 型</option>
                <option value="unknown">不清楚</option>
              </select>
            </label>
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              過敏史：
              <input
                value={medicalHistory.allergy}
                onChange={(e) =>
                  handleHistoryChange("allergy", e.target.value)
                }
                style={{ marginLeft: "0.5rem", padding: "0.3rem", width: "60%" }}
                placeholder="例如：藥物、食物、環境等"
              />
            </label>
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              家族病史：
              <input
                value={medicalHistory.familyHistory}
                onChange={(e) =>
                  handleHistoryChange("familyHistory", e.target.value)
                }
                style={{ marginLeft: "0.5rem", padding: "0.3rem", width: "60%" }}
                placeholder="例如：父母或兄弟姐妹有心臟病、糖尿病等"
              />
            </label>
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              慢性疾病：
              <input
                value={medicalHistory.chronicDisease}
                onChange={(e) =>
                  handleHistoryChange("chronicDisease", e.target.value)
                }
                style={{ marginLeft: "0.5rem", padding: "0.3rem", width: "60%" }}
                placeholder="例如：高血壓、糖尿病、氣喘等"
              />
            </label>
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              服用藥物：
              <textarea
                value={medicalHistory.medication}
                onChange={(e) =>
                  handleHistoryChange("medication", e.target.value)
                }
                rows={3}
                style={{
                  marginLeft: "0.5rem",
                  padding: "0.3rem",
                  width: "60%",
                  verticalAlign: "top",
                }}
                placeholder="請填寫目前規律或長期服用的藥物名稱、劑量等"
              />
            </label>
          </div>
        </div>
      </section>

      {/* 底部按鈕列 */}
      <div className="form-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handlePrev}
        >
          上一步
        </button>
        <button type="submit" className="btn btn-primary">
          送出預約
        </button>
      </div>
    </form>
  );
}

export default FillProfilePage;