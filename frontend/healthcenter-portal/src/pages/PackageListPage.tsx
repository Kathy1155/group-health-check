const mockPackages = [
  { id: 1, name: '一般健檢', price: 2800, desc: '基本身體檢查' },
  { id: 2, name: '高階健檢', price: 5000, desc: '含超音波、X光等項目' },
  { id: 3, name: '心血管套餐', price: 3500, desc: '專注心血管項目' },
];

function PackageListPage() {
  return (
    <div>
      <h2>套餐管理</h2>

      <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>套餐名稱</th>
            <th>價格</th>
            <th>說明</th>
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          {mockPackages.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.price}</td>
              <td>{p.desc}</td>
              <td>
                <button>編輯</button>
                <button style={{ marginLeft: 8 }}>刪除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button style={{ marginTop: 20 }}>新增套餐</button>
    </div>
  );
}

export default PackageListPage;