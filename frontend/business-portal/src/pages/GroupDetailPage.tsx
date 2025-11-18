import { useParams } from 'react-router-dom';

const mockGroup = {
  id: 1,
  name: '富邦人壽年度健檢',
  contact: '王小明',
  email: 'service@fubon.com',
  people: [
    { id: 'A123456789', name: '林小安', phone: '0911-222-333' },
    { id: 'B987654321', name: '張育庭', phone: '0988-556-123' },
  ],
  branches: ['台北院區', '新莊院區'],
  packages: ['一般健檢', '心血管套餐'],
};

function GroupDetailPage() {
  const { id } = useParams();

  return (
    <div>
      <h2>團體詳細資料</h2>
      <h2>test!!!!!!!!</h2>
      <p>團體 ID：{id}</p>

      <section style={{ marginTop: 20 }}>
        <h3>基本資料</h3>
        <p>團體名稱：{mockGroup.name}</p>
        <p>聯絡人：{mockGroup.contact}</p>
        <p>Email：{mockGroup.email}</p>
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>名冊成員</h3>
        <table border={1} cellPadding={5} style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>身分證</th>
              <th>姓名</th>
              <th>手機</th>
            </tr>
          </thead>
          <tbody>
            {mockGroup.people.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>可預約院區</h3>
        {mockGroup.branches.map((b) => (
          <div key={b}>
            <input type="checkbox" defaultChecked /> {b}
          </div>
        ))}
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>可預約套餐</h3>
        {mockGroup.packages.map((p) => (
          <div key={p}>
            <input type="checkbox" defaultChecked /> {p}
          </div>
        ))}
      </section>
    </div>
  );
}

export default GroupDetailPage;