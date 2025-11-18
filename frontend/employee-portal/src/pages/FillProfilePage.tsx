import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function FillProfilePage() {
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [history, setHistory] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 之後這裡會送到後端建立 Reservation + MedicalProfile
    navigate('/done');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>步驟 4：填寫基本資料與病史</h2>

      <div>
        <label>
          姓名：
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
      </div>

      <div>
        <label>
          身分證字號：
          <input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required />
        </label>
      </div>

      <div>
        <label>
          聯絡電話：
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </label>
      </div>

      <div>
        <label>
          個人病史 / 用藥：
          <textarea
            value={history}
            onChange={(e) => setHistory(e.target.value)}
            rows={4}
          />
        </label>
      </div>

      <button type="submit">送出預約</button>
    </form>
  );
}

export default FillProfilePage;