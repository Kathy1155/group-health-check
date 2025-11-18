const mockReservations = [
  {
    id: 101,
    name: '林小安',
    idNumber: 'A123456789',
    date: '2025-01-12',
    time: '09:00',
    branch: '台北院區',
    package: '一般健檢',
  },
  {
    id: 102,
    name: '張育庭',
    idNumber: 'B987654321',
    date: '2025-01-12',
    time: '10:00',
    branch: '新莊院區',
    package: '心血管套餐',
  },
];

function ReservationOverviewPage() {
  return (
    <div>
      <h2>預約總覽</h2>

      <table border={1} cellPadding={6} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>預約編號</th>
            <th>姓名</th>
            <th>身分證</th>
            <th>日期</th>
            <th>時段</th>
            <th>院區</th>
            <th>套餐</th>
          </tr>
        </thead>

        <tbody>
          {mockReservations.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.name}</td>
              <td>{r.idNumber}</td>
              <td>{r.date}</td>
              <td>{r.time}</td>
              <td>{r.branch}</td>
              <td>{r.package}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReservationOverviewPage;