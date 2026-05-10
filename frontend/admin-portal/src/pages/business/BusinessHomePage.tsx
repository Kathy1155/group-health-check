import React, { useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const BusinessHomePage: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  const [statusText, setStatusText] = useState("系統連線檢查中...");

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      /**
       * 先用現有 API 測試後端是否正常
       * 之後如果你們有 /health endpoint 可以再換掉
       */
      const response = await fetch(`${API_BASE_URL}/groups`);

      if (!response.ok) {
        throw new Error("API Error");
      }

      setSystemStatus("success");
      setStatusText("請點選左側選單開始作業。");
    } catch (error) {
      console.error(error);

      setSystemStatus("error");
      setStatusText("目前無法連線至後端或資料庫。");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "早安";
    if (hour < 18) return "午安";
    return "晚安";
  };

  return (
    <div className="admin-home">
      <section className="admin-home-hero simple">
        <div>
          <p className="admin-home-greeting">{getGreeting()}</p>

          <h1 className="admin-home-title">
            業務中心專員，歡迎回到系統
          </h1>
        </div>
      </section>

      <section className="admin-status-line">
        <span className="admin-status-line-icon">
          {systemStatus === "success" ? "✓" : "!"}
        </span>

        <span>
          {systemStatus === "success"
            ? "系統連線正常，請點選左側選單開始作業。"
            : systemStatus === "loading"
            ? "系統檢查中，請稍候。"
            : "系統連線異常，目前無法連線至後端或資料庫。"}
        </span>
      </section>
    </div>
  );
};

export default BusinessHomePage;