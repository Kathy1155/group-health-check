import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const mockDates = ['2025-01-10', '2025-01-11', '2025-01-12'];
const mockSlots = ['08:00', '09:00', '10:00'];

function SelectTimeSlotPage() {
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const navigate = useNavigate();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/fill-profile');
  };

  return (
    <form onSubmit={handleNext}>
      <h2>步驟 3：選擇日期與時段</h2>

      <div>
        <label>
          日期：
          <select value={date} onChange={(e) => setDate(e.target.value)} required>
            <option value="">請選擇日期</option>
            {mockDates.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <label>
          時段：
          <select value={slot} onChange={(e) => setSlot(e.target.value)} required>
            <option value="">請選擇時段</option>
            {mockSlots.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <button type="submit">下一步</button>
    </form>
  );
}

export default SelectTimeSlotPage;