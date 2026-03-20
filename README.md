# 團體健檢預約系統 (Group Health Check Reservation System)

## 專案定位
這是一個企業級的健檢預約管理平台，旨在解決企業（Business）、員工（Employee）與體檢中心（Health Center）三方在健檢排程、名單核對與預約管理上的作業痛點。

---

## 專案介紹 — Description
本專案透過「多門戶（Multi-portal）」設計，為不同角色提供專屬的操作介面：

### 企業端（Business）
- HR 可建立健檢專案
- 設定分院特約套餐
- 批次上傳員工名冊

### 員工端（Employee）
- 透過簡訊或信件驗證碼（OTP）登入
- 自主選擇健檢分院與時段

### 醫檢端（Health Center）
- 設定每日服務量能（Timeslots）
- 即時檢視預約名單

目前進度已完成核心 API 開發、資料庫 Entity 定義，以及各端門戶的基礎路由與核心預約流程佈局。

---

## 系統架構 — System Architecture
本專案採用典型的模組化單體架構（Modular Monolith Concepts）：

### 後端（Backend - NestJS）
- 架構：控制器（Controllers）、服務（Services）、實體（Entities）三層架構

#### 核心模組
- Auth：基於 JWT 與 OTP 的驗證邏輯
- Groups：企業專案管理
- Reservations：預約狀態機管理
- Roster：名冊上傳與身分比對
- Timeslots：診所量能排程系統

### 前端（Frontend - React + Vite）
包含四個獨立運行的 Portal，共享 TypeScript 類型定義：

- admin-portal：系統後台管理
- business-portal：企業 HR 管理端
- employee-portal：員工預約介面
- healthcenter-portal：診所排班系統

---

## 運行環境需求 — Requirement
- Node.js：v18.0.0 以上（建議使用 v20 LTS）
- npm / pnpm：套件管理工具
- MySQL Server：8.0 或同等級 SQL 資料庫

---

## 環境檔設定 — .env Setting

### 後端（/backend/api/.env）
```env
PORT=3000
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=group_health_check
JWT_SECRET=your_secret_key
```

### 前端（各 /frontend/*/.env）
```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 安裝與運行步驟 — Build Setup

### 後端啟動
```bash
cd backend/api
npm install
npm run start:dev
```

### 前端啟動（以員工端為例）
```bash
cd frontend/employee-portal
npm install
npm run dev
```

---

## 功能地圖 — Function Map

### 企業端功能
- 專案建立：定義專案期間與合作診所
- 名冊管理：支援 CSV / Excel 上傳（RosterUploadPage）
- 套餐配置：設定各分院健檢套餐

### 員工端功能
- 身分驗證：OTP 驗證機制
- 個人化預約：顯示可用診所與時段
- 預約追蹤：查看與取消預約

### 醫檢端功能
- 量能設定：設定時段最大人數
- 報到管理：檢索當日預約清單

---

## 技術亮點 — Technical Highlights
- 類型安全（Type-Safety）：全專案使用 TypeScript，確保前後端資料一致性
- 自定義 Hooks：如 useUnsavedChangesWarning，提升表單操作體驗
- NestJS 模組化設計：模組獨立，具備高可測試性與擴充性
- 門戶隔離：依角色切分專案，降低 Bundle Size 並提升安全性

---

## 開發者與支援 — Support
- 主要開發者：呂欣樺 Kathy
- 學號：412570405
- 學術背景：醫學資訊系 三年級

---

## 注意事項 — Warning
- 進度說明：目前系統仍在開發階段，部分 API 正在優化併發處理邏輯
- 資料庫同步：首次啟動後端時，請確認資料庫已建立並開啟 `synchronize: true` 進行同步
