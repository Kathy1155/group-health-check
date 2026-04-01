import { useSearchParams, useNavigate } from 'react-router-dom';

function ReservationActionResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const result = searchParams.get('result');

  let title = '處理結果';
  let message = '系統已完成處理。';

  if (result === 'confirmed') {
    title = '預約確認成功';
    message = '您的預約已成功確認。';
  } else if (result === 'cancelled') {
    title = '預約取消成功';
    message = '您的預約已成功取消。';
  } else if (result === 'already-confirmed') {
    title = '預約已確認';
    message = '這筆預約先前已確認過，無需重複操作。';
  } else if (result === 'already-cancelled') {
    title = '預約已取消';
    message = '這筆預約先前已取消，無需重複操作。';
  } else if (result === 'invalid') {
    title = '連結無效';
    message = '此連結可能已失效、錯誤或不存在。';
  } else if (result === 'error') {
    title = '處理失敗';
    message = '系統處理時發生錯誤，請稍後再試或聯絡窗口。';
  }

  return (
    <div className="page-form">
      <h2>{title}</h2>
      <p>{message}</p>

      <div className="form-footer">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/')}
        >
          回首頁
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/reservation-lookup')}
        >
          查詢預約
        </button>
      </div>
    </div>
  );
}

export default ReservationActionResultPage;