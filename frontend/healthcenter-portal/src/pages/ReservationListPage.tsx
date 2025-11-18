const mockReservations = [
  {
    id: 1001,
    name: '林小安',
    idNumber: 'A123456789',
    branch: '台北院區',
    date: '2025-01-12',
    time: '09:00',
    package: '一般健檢',
    status: '待報到',
  },
  {
    id: 1002,
    name: '張育庭',
    idNumber: 'B987654321',
    branch: '台北院區',
    date: '2025-01-12',
    time: '10:00',
    package: '心血管套餐',
    status: '已完成',
  },
];

function ReservationListPage() {
  return (
    <div>
      <h2>預約查詢 / 狀態變更</h2>

      <table border={1} cellPadding={6} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>預約編號</th>
            <th>姓名</th>
            <th>身分證</th>
            <th>院區</th>
            <th>日期</th>
            <th>時段</th>
            <th>套餐</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          {mockReservations.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.name}</td>
              <td>{r.idNumber}</td>
              <td>{r.branch}</td>
              <td>{r.date}</td>
              <td>{r.time}</td>
              <td>{r.package}</td>
              <td>{r.status}</td>
              <td>
                <button
                  onClick={() => {
                    alert(`變更預約 ${r.id} 狀態（之後串後端）`);
                  }}
                >
                  修改狀態
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReservationListPage;