// src/pages/ReservationLookupPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  lookupReservation,
  type ReservationLookupDto,
} from "../api/reservationsApi";
import { FaSearch, FaChevronLeft } from "react-icons/fa";

type LookupResult = ReservationLookupDto;

function getStatusBadgeStyle(status: string) {
  if (status.includes("取消")) {
    return {
      background: "#fef2f2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
    };
  }

  if (status.includes("確認") || status.includes("已預約")) {
    return {
      background: "#ecfeff",
      color: "#155e75",
      border: "1px solid #a5f3fc",
    };
  }

  return {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
  };
}

function ReservationLookupPage() {
  const navigate = useNavigate();

  const [idNumber, setIdNumber] = useState("");
  const [lookupCode, setLookupCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setResult(null);

    if (idNumber.trim().length !== 10) {
      setError("請輸入完整 10 碼身分證字號。");
      return;
    }

    if (!lookupCode.trim()) {
      setError("請輸入查詢驗證碼。");
      return;
    }

    setLoading(true);

    try {
      const data = await lookupReservation(
        idNumber.trim().toUpperCase(),
        lookupCode.trim().toUpperCase()
      );
      setResult(data);
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") {
        setError("查無符合條件的預約資料，請確認輸入是否正確。");
      } else {
        setError("查詢失敗，請稍後再試。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f8fbff 0%, #f3f7fb 45%, #eef3f8 100%)",
        padding: "48px 16px 72px",
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "6px 14px",
              borderRadius: 999,
              background: "#eaf4ff",
              color: "#1d4ed8",
              fontSize: "0.9rem",
              fontWeight: 700,
              marginBottom: 14,
              letterSpacing: "0.02em",
            }}
          >
            線上預約服務
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "2rem",
              color: "#0f172a",
              fontWeight: 800,
              letterSpacing: "0.02em",
            }}
          >
            預約查詢
          </h1>

          <p
            style={{
              margin: "12px auto 0",
              maxWidth: 560,
              fontSize: "1rem",
              lineHeight: 1.7,
              color: "#475569",
            }}
          >
            請輸入身分證字號與查詢驗證碼，系統將查詢您在本院的團體健檢預約資料。
          </p>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: 24,
            border: "1px solid #e2e8f0",
            boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "28px 28px 20px",
              borderBottom: "1px solid #edf2f7",
              background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "1.35rem",
                color: "#0f172a",
                fontWeight: 800,
              }}
            >
              查詢條件
            </h2>
            <p
              style={{
                margin: "8px 0 0",
                color: "#64748b",
                fontSize: "0.95rem",
              }}
            >
              為保障個人資料安全，請輸入正確資料後再進行查詢。
            </p>
          </div>

          <div style={{ padding: 28 }}>
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gap: 18,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    身分證字號
                  </label>
                  <input
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
                    maxLength={10}
                    placeholder="請輸入 10 碼身分證字號"
                    required
                    style={{
                      width: "100%",
                      height: 52,
                      boxSizing: "border-box",
                      borderRadius: 14,
                      border: "1px solid #cbd5e1",
                      padding: "0 16px",
                      fontSize: "1rem",
                      color: "#0f172a",
                      background: "#ffffff",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    查詢驗證碼
                  </label>

                  <input
                    type="text"
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
                    placeholder="請輸入預約確認信中的查詢驗證碼"
                    required
                    style={{
                      width: "100%",
                      height: 52,
                      boxSizing: "border-box",
                      borderRadius: 14,
                      border: "1px solid #cbd5e1",
                      padding: "0 16px",
                      fontSize: "1rem",
                      color: "#0f172a",
                      background: "#ffffff",
                      outline: "none",
                    }}
                  />

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: "0.86rem",
                      color: "#94a3b8",
                    }}
                  >
                    查詢驗證碼可於預約確認信中查看。
                  </div>
                </div>
              </div>

              {error && (
                <div
                  style={{
                    marginTop: 18,
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                  }}
                >
                  {error}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 24,
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  style={{
                    height: 48,
                    padding: "0 18px",
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#334155",
                    fontSize: "0.96rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <FaChevronLeft />
                  回首頁
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    minWidth: 152,
                    height: 50,
                    padding: "0 22px",
                    borderRadius: 14,
                    border: "none",
                    background: loading
                      ? "#93c5fd"
                      : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    color: "#ffffff",
                    fontSize: "0.98rem",
                    fontWeight: 800,
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: loading
                      ? "none"
                      : "0 10px 20px rgba(37, 99, 235, 0.22)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  <FaSearch />
                  {loading ? "查詢中…" : "開始查詢"}
                </button>
              </div>
            </form>

            {result && (
              <div
                style={{
                  marginTop: 30,
                  borderRadius: 20,
                  border: "1px solid #dbeafe",
                  background:
                    "linear-gradient(180deg, #f8fbff 0%, #fdfefe 100%)",
                  padding: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                    marginBottom: 18,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.2rem",
                        color: "#0f172a",
                        fontWeight: 800,
                      }}
                    >
                      預約結果
                    </h3>
                    <p
                      style={{
                        margin: "6px 0 0",
                        fontSize: "0.92rem",
                        color: "#64748b",
                      }}
                    >
                      以下為目前查詢到的預約資訊
                    </p>
                  </div>

                  <span
                    style={{
                      ...getStatusBadgeStyle(result.status),
                      padding: "8px 14px",
                      borderRadius: 999,
                      fontSize: "0.9rem",
                      fontWeight: 800,
                    }}
                  >
                    {result.status}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 14,
                  }}
                >
                  {[
                    { label: "姓名", value: result.name },
                    { label: "團體名稱", value: result.groupName },
                    { label: "院區", value: result.branchName },
                    { label: "健檢套餐", value: result.packageName },
                    { label: "預約日期", value: result.date },
                    { label: "預約時段", value: result.slot },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        padding: "14px 16px",
                        borderRadius: 14,
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.84rem",
                          color: "#64748b",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: "1rem",
                          color: "#0f172a",
                          fontWeight: 700,
                          lineHeight: 1.6,
                          wordBreak: "break-word",
                        }}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReservationLookupPage;