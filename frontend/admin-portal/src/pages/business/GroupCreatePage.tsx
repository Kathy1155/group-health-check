import React, { useEffect, useRef, useState } from "react";
import { useUnsavedChangesWarning } from "../../hooks/useUnsavedChangesWarning";
import {
  createGroup,
  fetchPackages,
  type PackageItem,
} from "../../api/groupsApi";

const GroupCreatePage: React.FC = () => {
  const [groupName, setGroupName] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [availablePackageIds, setAvailablePackageIds] = useState<number[]>([]);
  const [reservationStartDate, setReservationStartDate] = useState("");
  const [reservationEndDate, setReservationEndDate] = useState("");

  const [errors, setErrors] = useState({
    groupCode: "",
    contactPhone: "",
    contactEmail: "",
    availablePackageIds: "",
    reservationStartDate: "",
    reservationEndDate: "",
    reservationDateOrder: "",
  });

  const [submitError, setSubmitError] = useState("");
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [saving, setSaving] = useState(false);

  const submitErrorRef = useRef<HTMLParagraphElement | null>(null);
  const groupCodeErrorRef = useRef<HTMLParagraphElement | null>(null);
  const contactPhoneErrorRef = useRef<HTMLParagraphElement | null>(null);
  const contactEmailErrorRef = useRef<HTMLParagraphElement | null>(null);
  const packageErrorRef = useRef<HTMLParagraphElement | null>(null);
  const startDateErrorRef = useRef<HTMLParagraphElement | null>(null);
  const endDateErrorRef = useRef<HTMLParagraphElement | null>(null);
  const dateOrderErrorRef = useRef<HTMLParagraphElement | null>(null);

  const isDirty =
    groupName !== "" ||
    groupCode !== "" ||
    contactName !== "" ||
    contactPhone !== "" ||
    contactEmail !== "" ||
    status !== "active" ||
    availablePackageIds.length > 0 ||
    reservationStartDate !== "" ||
    reservationEndDate !== "";

  useUnsavedChangesWarning(isDirty);

  useEffect(() => {
    let alive = true;

    const loadPackages = async () => {
      try {
        setLoadingPackages(true);
        const data = await fetchPackages();
        if (!alive) return;
        setPackages(data);
      } catch (err) {
        console.error(err);
        alert("套餐資料載入失敗");
      } finally {
        if (alive) setLoadingPackages(false);
      }
    };

    loadPackages();

    return () => {
      alive = false;
    };
  }, []);

  const togglePackage = (packageId: number) => {
    setAvailablePackageIds((prev) =>
      prev.includes(packageId)
        ? prev.filter((id) => id !== packageId)
        : [...prev, packageId],
    );
  };

  const buildValidationErrors = () => {
    const newErrors = {
      groupCode: "",
      contactPhone: "",
      contactEmail: "",
      availablePackageIds: "",
      reservationStartDate: "",
      reservationEndDate: "",
      reservationDateOrder: "",
    };

    const groupCodeRegex = /^[A-Z]{2}\d{8}$/;
    if (!groupCodeRegex.test(groupCode)) {
      newErrors.groupCode =
        "團體代碼格式錯誤，需為前兩碼大寫英文字母、後八碼數字，例如：AB12345678";
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(contactPhone)) {
      newErrors.contactPhone = "聯絡電話格式錯誤，請輸入 10 碼數字。";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      newErrors.contactEmail = "電子郵件格式錯誤，請輸入正確的 Email。";
    }

    if (!reservationStartDate) {
      newErrors.reservationStartDate = "請選擇開放預約開始日";
    }

    if (!reservationEndDate) {
      newErrors.reservationEndDate = "請選擇開放預約截止日";
    }

    if (
      reservationStartDate &&
      reservationEndDate &&
      reservationEndDate < reservationStartDate
    ) {
      newErrors.reservationDateOrder = "開放預約截止日不可早於開始日";
    }

    if (availablePackageIds.length === 0) {
      newErrors.availablePackageIds = "請至少勾選一個可預約套餐";
    }

    return newErrors;
  };

  const validateForm = () => {
    const newErrors = buildValidationErrors();
    setErrors(newErrors);

    return (
      !newErrors.groupCode &&
      !newErrors.contactPhone &&
      !newErrors.contactEmail &&
      !newErrors.availablePackageIds &&
      !newErrors.reservationStartDate &&
      !newErrors.reservationEndDate &&
      !newErrors.reservationDateOrder
    );
  };

  const scrollToFirstError = (
    nextErrors: typeof errors,
    hasSubmitError = false,
  ) => {
    if (hasSubmitError && submitErrorRef.current) {
      submitErrorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    if (nextErrors.groupCode && groupCodeErrorRef.current) {
      groupCodeErrorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    if (nextErrors.contactPhone && contactPhoneErrorRef.current) {
      contactPhoneErrorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    if (nextErrors.contactEmail && contactEmailErrorRef.current) {
      contactEmailErrorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    if (nextErrors.reservationStartDate && startDateErrorRef.current) {
      startDateErrorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    if (nextErrors.reservationEndDate && endDateErrorRef.current) {
      endDateErrorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    if (nextErrors.reservationDateOrder && dateOrderErrorRef.current) {
      dateOrderErrorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    if (nextErrors.availablePackageIds && packageErrorRef.current) {
      packageErrorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const resetForm = () => {
    setGroupName("");
    setGroupCode("");
    setContactName("");
    setContactPhone("");
    setContactEmail("");
    setStatus("active");
    setAvailablePackageIds([]);
    setReservationStartDate("");
    setReservationEndDate("");
    setSubmitError("");
    setErrors({
      groupCode: "",
      contactPhone: "",
      contactEmail: "",
      availablePackageIds: "",
      reservationStartDate: "",
      reservationEndDate: "",
      reservationDateOrder: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitError("");

    const isValid = validateForm();
    if (!isValid) {
      const nextErrors = buildValidationErrors();
      scrollToFirstError(nextErrors);
      return;
    }

    const payload = {
      groupName,
      groupCode,
      contactName,
      contactPhone: `+886${contactPhone}`,
      contactEmail,
      status,
      availablePackageIds,
      reservationStartDate,
      reservationEndDate,
    };

    try {
      setSaving(true);

      const result = await createGroup(payload);
      console.log("新增成功", result);

      alert("新增成功");
      resetForm();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("新增失敗：", err);

      if (err instanceof Error && err.message.includes("團體代碼已存在")) {
        const nextErrors = {
          ...buildValidationErrors(),
          groupCode: "此團體代碼已被使用，請重新輸入。",
        };

        setErrors(nextErrors);

        setTimeout(() => {
          scrollToFirstError(nextErrors);
        }, 50);
        return;
      }

      setSubmitError(err instanceof Error ? err.message : "新增失敗，請稍後再試");

      setTimeout(() => {
        if (submitErrorRef.current) {
          submitErrorRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 50);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container business-scope">
      <div className="page-card">
        <h2 className="page-title">新增團體資料界面</h2>

        <form className="page-form" onSubmit={handleSubmit}>
          {submitError && (
            <p
              ref={submitErrorRef}
              style={{
                color: "red",
                marginBottom: "12px",
                fontSize: "14px",
              }}
            >
              {submitError}
            </p>
          )}

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
                    .replace(/[^A-Z0-9]/g, "");
                  setGroupCode(value);
                }}
                placeholder="例如：AB12345678"
                maxLength={10}
                required
              />

              {errors.groupCode && (
                <p
                  ref={groupCodeErrorRef}
                  style={{ color: "red", marginTop: 4, fontSize: "14px" }}
                >
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
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ whiteSpace: "nowrap" }}>+886</span>
                <input
                  id="contactPhone"
                  className="form-input"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="請輸入 10 碼數字"
                  maxLength={10}
                  required
                />
              </div>
              {errors.contactPhone && (
                <p
                  ref={contactPhoneErrorRef}
                  style={{ color: "red", marginTop: "4px", fontSize: "14px" }}
                >
                  {errors.contactPhone}
                </p>
              )}
            </div>
          </div>

          <div className="form-row single">
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
                <p
                  ref={contactEmailErrorRef}
                  style={{ color: "red", marginTop: "4px", fontSize: "14px" }}
                >
                  {errors.contactEmail}
                </p>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="reservationStartDate">
                開放預約開始日：
              </label>
              <input
                id="reservationStartDate"
                type="date"
                className="form-input"
                value={reservationStartDate}
                onChange={(e) => setReservationStartDate(e.target.value)}
              />
              {errors.reservationStartDate && (
                <p
                  ref={startDateErrorRef}
                  style={{ color: "red", marginTop: "4px", fontSize: "14px" }}
                >
                  {errors.reservationStartDate}
                </p>
              )}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="reservationEndDate">
                開放預約截止日：
              </label>
              <input
                id="reservationEndDate"
                type="date"
                className="form-input"
                value={reservationEndDate}
                onChange={(e) => setReservationEndDate(e.target.value)}
              />
              {errors.reservationEndDate && (
                <p
                  ref={endDateErrorRef}
                  style={{ color: "red", marginTop: "4px", fontSize: "14px" }}
                >
                  {errors.reservationEndDate}
                </p>
              )}
            </div>
          </div>

          {errors.reservationDateOrder && (
            <p
              ref={dateOrderErrorRef}
              style={{ color: "red", marginTop: "4px", fontSize: "14px" }}
            >
              {errors.reservationDateOrder}
            </p>
          )}

          <div className="form-row single">
            <div className="form-field">
              <span className="form-label">可預約套餐：</span>

              {loadingPackages ? (
                <p>套餐資料載入中...</p>
              ) : (
                <div className="branch-grid">
                  {packages.map((pkg) => (
                    <label key={pkg.packageId} className="branch-checkbox">
                      <input
                        type="checkbox"
                        checked={availablePackageIds.includes(pkg.packageId)}
                        onChange={() => togglePackage(pkg.packageId)}
                      />
                      <span>{pkg.packageName}</span>
                    </label>
                  ))}
                </div>
              )}

              {errors.availablePackageIds && (
                <p
                  ref={packageErrorRef}
                  style={{ color: "red", marginTop: "8px", fontSize: "14px" }}
                >
                  {errors.availablePackageIds}
                </p>
              )}
            </div>
          </div>

          <div className="form-row single">
            <div className="form-field">
              <span className="form-label">團體狀態：</span>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="active"
                    checked={status === "active"}
                    onChange={() => setStatus("active")}
                  />
                  啟用
                </label>
                <label>
                  <input
                    type="radio"
                    value="inactive"
                    checked={status === "inactive"}
                    onChange={() => setStatus("inactive")}
                  />
                  停用
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions-center">
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "儲存中..." : "儲存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupCreatePage;