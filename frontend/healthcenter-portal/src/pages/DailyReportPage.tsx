const mockReport = [
  {
    name: '林小安',
    idNumber: 'A123456789',
    package: '一般健檢',
    time: '09:00',
  },
  {
    name: '張育庭',
    idNumber: 'B987654321',
    package: '心血管套餐',
    time: '10:00',
  },
];

function DailyReportPage() {
  return (
    <div>
      <h2>每日受檢報表</h2>

      <p>日期：2025-01-12（之後可以加日期選擇器）</p>

      <table border={1} cellPadding={6} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>姓名</th>
            <th>身分證</th>
            <th>套餐</th>
            <th>時段</th>
          </tr>
        </thead>

        <tbody>
          {mockReport.map((r, idx) => (
            <tr key={idx}>
              <td>{r.name}</td>
              <td>{r.idNumber}</td>
              <td>{r.package}</td>
              <td>{r.time}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button style={{ marginTop: 20 }}>匯出 CSV</button>
    </div>
  );
}

export default DailyReportPage;