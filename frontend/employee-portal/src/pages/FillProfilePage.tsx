<h2 style={{ color: "red" }}>我是 FillProfilePage</h2>
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchRosterProfile } from "../api/rosterApi";
import { createReservation } from "../api/reservationsApi";

type FromSlotPageState = {
  group: {
    id: number;
    code: string;
    name: string;
    contactName: string;
    idNumber: string;
  };
  idNumber: string;
  branchId: number;
  packageId: number;
  branchName: string;
  packageName: string;
  date: string;
  slotId: number;
  slot: string;
};

const mockParticipant = {
  groupCode: "FB12345678",
  name: "王小明",
  idNumber: "A123456789",
  phone: "0912345678",
  birthday: "1998-07-03",
};

function FillProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const fromSlot = location.state as FromSlotPageState | undefined;

  if (
    !fromSlot ||
    !fromSlot.group ||
    !fromSlot.branchId ||
    !fromSlot.packageId ||
    !fromSlot.branchName ||
    !fromSlot.packageName ||
    !fromSlot.date ||
    fromSlot.slotId == null ||
    !fromSlot.slot
  ) {
    return (
      <div className="page-form">
        <h2>預約流程中斷</h2>
        <p>預約資訊遺失，請從首頁重新開始預約。</p>
        <button type="button" onClick={() => navigate("/")}>
          回首頁
        </button>
      </div>
    );
  }

  const {
    group,
    idNumber,
    branchId,
    packageId,
    branchName,
    packageName,
    date,
    slotId,
    slot,
  } = fromSlot;

  const [personalInfo, setPersonalInfo] = useState({
    groupCode: group.code ?? mockParticipant.groupCode,
    name: "",
    idNumber: idNumber ?? mockParticipant.idNumber,
    phone: "",
    birthday: "",
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [medicalHistory, setMedicalHistory] = useState({
    bloodType: "",
    allergy: "",
    familyHistory: "",
    chronicDisease: "",
    medication: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingProfile(true);
        setProfileError(null);

        const data = await fetchRosterProfile(group.code, idNumber);

        if (!alive) return;

        if (!data) {
          setPersonalInfo({
            groupCode: group.code ?? mockParticipant.groupCode,
            name: mockParticipant.name,
            idNumber: idNumber ?? mockParticipant.idNumber,
            phone: mockParticipant.phone,
            birthday: mockParticipant.birthday,
          });
          setProfileError("查無名冊資料，請確認團體代碼與身分證字號是否正確。");
          return;
        }

        setPersonalInfo({
          groupCode: data.groupCode ?? group.code,
          name: data.name ?? "",
          idNumber: data.idNumber ?? idNumber,
          phone: data.phone ?? "",
          birthday: data.birthday ?? "",
        });
      } catch (e) {
        if (!alive) return;

        setPersonalInfo({
          groupCode: group.code ?? mockParticipant.groupCode,
          name: mockParticipant.name,
          idNumber: idNumber ?? mockParticipant.idNumber,
          phone: mockParticipant.phone,
          birthday: mockParticipant.birthday,
        });
        setProfileError("名冊資料載入失敗，請稍後再試或洽團體聯絡人。");
      } finally {
        if (!alive) return;
        setLoadingProfile(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [group.code, idNumber]);

  const handlePrev = () => {
    navigate(-1);
  };

  const handleHistoryChange = (
    field: keyof typeof medicalHistory,
    value: string
  ) => {
    setMedicalHistory((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setSubmitError(null);

      const result = await createReservation({
        groupCode: personalInfo.groupCode,
        idNumber: personalInfo.idNumber,
        packageId,
        slotId,
        medicalProfile: {
          bloodType: medicalHistory.bloodType,
          allergies: medicalHistory.allergy,
          familyHistory: medicalHistory.familyHistory,
          chronicDiseases: medicalHistory.chronicDisease,
          medications: medicalHistory.medication,
        },
      });

      navigate("/done", {
        state: {
          reservationId: result.reservationId,
          reservationNo: result.reservationNo ?? `R${result.reservationId}`,
          groupName: group.name,
          branchId,
          packageId,
          branchName,
          packageName,
          date,
          slot,
          personalInfo,
          medicalHistory,
        },
      });
    } catch (error) {
      console.error(error);
      setSubmitError("預約送出失敗，請稍後再試。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="page-form">
      <h2>步驟 4：確認基本資料與填寫病史</h2>
      <p>預約院區：{branchName}</p>
      <p>健檢套餐：{packageName}</p>

      <section className="form-section">
        <h3>一、個人基本資料</h3>

        <p className="form-hint">
          以下資料由團體名冊帶入，無法於線上修改。若資料有誤，請告知團體聯絡人或至現場櫃檯協助更正。
        </p>

        {loadingProfile && <p className="form-hint">名冊資料載入中…</p>}

        {profileError && (
          <p className="form-hint" style={{ color: "#b00020" }}>
            {profileError}
          </p>
        )}

        <div className="form-grid">
          <label>團體代碼</label>
          <input value={personalInfo.groupCode} disabled />

          <label>姓名</label>
          <input value={personalInfo.name} disabled required />

          <label>身分證字號</label>
          <input value={personalInfo.idNumber} disabled />

          <label>聯絡電話</label>
          <input value={personalInfo.phone} disabled required />

          <label>生日</label>
          <input type="date" value={personalInfo.birthday} disabled required />
        </div>
      </section>

      <section className="form-section">
        <h3>二、個人病史</h3>
        <div className="form-stack">
          <div className="form-row">
            <label>血型</label>
            <select
              value={medicalHistory.bloodType}
              onChange={(e) => handleHistoryChange("bloodType", e.target.value)}
            >
              <option value="">請選擇</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="O">O</option>
              <option value="AB">AB</option>
              <option value="unknown">不清楚</option>
            </select>
          </div>

          <div className="form-row">
            <label>過敏史</label>
            <input
              value={medicalHistory.allergy}
              onChange={(e) => handleHistoryChange("allergy", e.target.value)}
              placeholder="例：海鮮、花生、藥物（無則免填）"
            />
          </div>

          <div className="form-row">
            <label>家族病史</label>
            <input
              value={medicalHistory.familyHistory}
              onChange={(e) =>
                handleHistoryChange("familyHistory", e.target.value)
              }
              placeholder="例：父親高血壓、母親糖尿病（無則免填）"
            />
          </div>

          <div className="form-row">
            <label>慢性疾病</label>
            <input
              value={medicalHistory.chronicDisease}
              onChange={(e) =>
                handleHistoryChange("chronicDisease", e.target.value)
              }
              placeholder="例：高血壓、糖尿病、氣喘（無則免填）"
            />
          </div>

          <div className="form-row">
            <label>服用藥物</label>
            <textarea
              value={medicalHistory.medication}
              onChange={(e) => handleHistoryChange("medication", e.target.value)}
              placeholder="例：血壓藥、胰島素、長期用藥（無則免填）"
            />
          </div>
        </div>
      </section>

      {submitError && (
        <p className="form-hint" style={{ color: "#b00020" }}>
          {submitError}
        </p>
      )}

      <div className="form-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handlePrev}
        >
          上一步
        </button>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loadingProfile || submitting || !!profileError}
        >
          {submitting ? "送出中..." : "送出預約"}
        </button>
      </div>
    </form>
  );
}

export default FillProfilePage;