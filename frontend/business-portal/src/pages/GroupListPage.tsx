import { Link } from 'react-router-dom';

const mockGroups = [
  { id: 1, name: '富邦人壽年度健檢', contact: '王小明', people: 120 },
  { id: 2, name: '台積電員工健檢案', contact: '張雅惠', people: 65 },
  { id: 3, name: '科技公司 A', contact: '林美玉', people: 40 },
];

function GroupListPage() {
  return (
    <div>
      <h2>團體管理</h2>

      <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>團體名稱</th>
            <th>聯絡人</th>
            <th>成員數量</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {mockGroups.map((g) => (
            <tr key={g.id}>
              <td>{g.name}</td>
              <td>{g.contact}</td>
              <td>{g.people}</td>
              <td>
                <Link to={`/groups/${g.id}`}>查看</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GroupListPage;
