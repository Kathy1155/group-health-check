import { useSearchParams, useNavigate } from "react-router-dom";

function ReservationActionResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const result = searchParams.get("result");
  const reason = searchParams.get("reason");

  let title = "處理結果";
  let message = "系統已完成處理。";
  let statusType: "success" | "warning" | "error" = "success";
  let badgeText = "處理完成";

  if (result === "confirmed") {
    title = "預約確認成功";
    message = "您的預約已成功確認，請依照預約日期與時段前往健檢中心。";
    statusType = "success";
    badgeText = "確認成功";
  } else if (result === "cancelled") {
    title = "預約取消成功";
    message = "您的預約已成功取消，該時段名額已釋放。";
    statusType = "warning";
    badgeText = "取消成功";
  } else if (result === "invalid") {
    title = "連結無效";
    message = "此連結可能已失效、錯誤或不存在。";
    statusType = "error";
    badgeText = "連結無效";
  } else if (result === "error") {
    statusType = "error";
    badgeText = "處理失敗";

    if (reason === "cancel-deadline") {
      title = "已超過取消期限";
      message = "已超過線上取消期限，請聯絡健檢中心或團體窗口協助處理。";
      statusType = "warning";
      badgeText = "超過期限";
    } else if (reason === "expired") {
      title = "連結已失效";
      message =
        "因逾時未完成確認，此連結已失效，系統已自動釋放名額。如仍需預約，請重新操作或聯絡團體窗口。";
    } else if (reason === "already-confirmed") {
      title = "預約已確認";
      message = "這筆預約先前已確認過，無需重複操作。";
      statusType = "success";
      badgeText = "已確認";
    } else if (reason === "already-cancelled") {
      title = "預約已取消";
      message = "這筆預約先前已取消，無需重複操作。";
      statusType = "warning";
      badgeText = "已取消";
    } else if (reason === "invalid") {
      title = "連結無效";
      message = "此連結可能已失效、錯誤或不存在。";
    } else {
      title = "處理失敗";
      message = "系統處理時發生錯誤，請稍後再試或聯絡窗口。";
    }
  }

  const icon = statusType === "success" ? "✓" : statusType === "warning" ? "!" : "×";

  return (
    <div className="reservation-page action-result-page">
      <div className={`action-result-hero action-result-${statusType}`}>
        <span className="action-result-icon">{icon}</span>
        <span className="page-badge">{badgeText}</span>
        <h1>{title}</h1>
        <p>{message}</p>
      </div>

      <div className="reservation-card action-result-card">
        <div className="reservation-card-header">
          <h2>後續操作</h2>
          <p>
            您可以回到首頁重新進入系統，或使用預約查詢功能確認目前預約狀態。
          </p>
        </div>

        <div className="action-result-content">
          <div className="action-result-tip">
            若您對預約狀態有疑問，請聯絡團體窗口或健檢中心協助確認。
          </div>
        </div>

        <div className="done-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate("/")}
          >
            回首頁
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/reservation-lookup")}
          >
            查詢預約
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReservationActionResultPage;