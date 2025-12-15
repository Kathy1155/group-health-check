import React from "react";
import { useNavigate } from "react-router-dom";

const BusinessHomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="page-card">
        <h2 className="page-title">功能選擇界面</h2>

        <div className="action-stack">
          <button
            type="button"
            className="primary-button full-width-button"
            onClick={() => navigate("/admin/business/groups/new")}
          >
            新增團體資料
          </button>

          <button
            type="button"
            className="primary-button full-width-button"
            onClick={() => navigate("/admin/business/package-branches")}
          >
            指定套餐院區
          </button>

          <button
            type="button"
            className="primary-button full-width-button"
            onClick={() => navigate("/admin/business/roster/upload")}
          >
            上傳團體名冊
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessHomePage;
