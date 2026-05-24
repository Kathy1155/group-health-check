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
  reservationId: number;
  expiresAt: string;
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
    !fromSlot.slot ||
    fromSlot.reservationId == null
  ) {
    return (
      <div className="reservation-page">
        <div className="reservation-page-header">
          <span className="page-badge">流程中斷</span>
          <h1>預約流程中斷</h1>
          <p>預約資訊遺失，請從首頁重新開始預約。</p>
        </div>

        <div className="reservation-card">
          <div className="reservation-card-header">
            <h2>無法繼續預約</h2>
            <p>系統沒有取得完整的預約資料。</p>
          </div>

          <div className="form-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/")}
            >
              回首頁
            </button>
          </div>
        </div>
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
    reservationId,
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
    dietaryPreference: "",
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
        reservationId,
        groupCode: personalInfo.groupCode,
        idNumber: personalInfo.idNumber,
        packageId,
        slotId,
        medicalProfile: {
          bloodType:
            medicalHistory.bloodType === "unknown"
              ? ""
              : medicalHistory.bloodType,
          allergies: medicalHistory.allergy,
          familyHistory: medicalHistory.familyHistory,
          chronicDiseases: medicalHistory.chronicDisease,
          medications: medicalHistory.medication,
          dietaryPreference: medicalHistory.dietaryPreference,
        },
      });

      navigate("/done", {
        state: {
          reservationId: result.reservationId,
          reservationNo: result.reservationNo ?? `R${result.reservationId}`,
          emailSent: result.emailSent,
          emailConfirmExpiresAt: result.emailConfirmExpiresAt,
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
    } catch (error: any) {
      console.error(error);
      setSubmitError(error?.message || "預約送出失敗，請稍後再試。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reservation-page">
      <div className="reservation-page-header">
        <span className="page-badge">Step 4</span>
        <h1>
          確認基本資料與<span className="mobile-title-line">填寫病史</span>
        </h1>
        <p>
          請確認個人基本資料與預約資訊，
          <br />
          並補充必要的個人病史後送出預約。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="reservation-card profile-card">
        <div className="reservation-card-header">
          <h2>預約送出前確認</h2>
          <p>名額已暫時保留 10 分鐘，請於導覽列倒數結束前完成資料填寫並送出預約。</p>
        </div>

        <div className="profile-content">
          <section className="profile-panel">
            <h3>目前預約資訊</h3>

            <div className="summary-list">
              <div className="summary-item">
                <span>預約院區</span>
                <strong>{branchName}</strong>
              </div>

              <div className="summary-item">
                <span>健檢套餐</span>
                <strong>{packageName}</strong>
              </div>

              <div className="summary-item">
                <span>健檢日期</span>
                <strong>{date}</strong>
              </div>

              <div className="summary-item">
                <span>健檢時段</span>
                <strong>{slot}</strong>
              </div>
            </div>

            <h3 className="profile-section-title">個人基本資料</h3>

            {loadingProfile && <p className="form-hint">名冊資料載入中…</p>}

            {profileError && <p className="form-error">{profileError}</p>}

            <div className="profile-readonly-list">
              <div className="readonly-item">
                <span>團體代碼</span>
                <strong>{personalInfo.groupCode}</strong>
              </div>

              <div className="readonly-item">
                <span>姓名</span>
                <strong>{personalInfo.name}</strong>
              </div>

              <div className="readonly-item">
                <span>身分證字號</span>
                <strong>{personalInfo.idNumber}</strong>
              </div>

              <div className="readonly-item">
                <span>聯絡電話</span>
                <strong>{personalInfo.phone}</strong>
              </div>

              <div className="readonly-item">
                <span>生日</span>
                <strong>{personalInfo.birthday}</strong>
              </div>
            </div>
          </section>

          <section className="profile-panel">
            <h3>個人病史</h3>

            <div className="form-stack profile-form-stack">
              <div className="form-row">
                <label htmlFor="bloodType">血型</label>
                <select
                  id="bloodType"
                  value={medicalHistory.bloodType}
                  onChange={(e) =>
                    handleHistoryChange("bloodType", e.target.value)
                  }
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
                <label htmlFor="dietaryPreference">飲食習慣</label>
                <select
                  id="dietaryPreference"
                  value={medicalHistory.dietaryPreference}
                  onChange={(e) =>
                    handleHistoryChange("dietaryPreference", e.target.value)
                  }
                >
                  <option value="">請選擇</option>
                  <option value="葷">葷</option>
                  <option value="素">素</option>
                </select>
              </div>

              <div className="form-row">
                <label htmlFor="allergy">過敏史</label>
                <input
                  id="allergy"
                  value={medicalHistory.allergy}
                  onChange={(e) =>
                    handleHistoryChange("allergy", e.target.value)
                  }
                  placeholder="例：海鮮、花生、藥物（無則免填）"
                />
              </div>

              <div className="form-row">
                <label htmlFor="familyHistory">家族病史</label>
                <input
                  id="familyHistory"
                  value={medicalHistory.familyHistory}
                  onChange={(e) =>
                    handleHistoryChange("familyHistory", e.target.value)
                  }
                  placeholder="例：父親高血壓、母親糖尿病（無則免填）"
                />
              </div>

              <div className="form-row">
                <label htmlFor="chronicDisease">慢性疾病</label>
                <input
                  id="chronicDisease"
                  value={medicalHistory.chronicDisease}
                  onChange={(e) =>
                    handleHistoryChange("chronicDisease", e.target.value)
                  }
                  placeholder="例：高血壓、糖尿病、氣喘（無則免填）"
                />
              </div>

              <div className="form-row">
                <label htmlFor="medication">服用藥物</label>
                <textarea
                  id="medication"
                  value={medicalHistory.medication}
                  onChange={(e) =>
                    handleHistoryChange("medication", e.target.value)
                  }
                  placeholder="例：血壓藥、胰島素、長期用藥（無則免填）"
                />
              </div>
            </div>
          </section>
        </div>

        {submitError && <p className="profile-submit-error">{submitError}</p>}

        <div className="form-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrev}
            disabled={submitting}
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
    </div>
  );
}

export default FillProfilePage;
