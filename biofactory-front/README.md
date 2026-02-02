# KSI Frontend 新手工程師使用說明書

## 📖 目錄

- [專案簡介](#專案簡介)
- [專案架構](#專案架構)
- [技術堆棧與套件清單](#技術堆棧與套件清單)
- [開發環境設置](#開發環境設置)
- [核心元件清單與使用方法](#核心元件清單與使用方法)
- [Redux Store 狀態管理](#redux-store-狀態管理)
- [DEMO 資料夾檔案結構說明](#demo-資料夾檔案結構說明)
- [最佳實踐與開發規範](#最佳實踐與開發規範)
- [常見問題與故障排除](#常見問題與故障排除)

## 🎯 專案簡介

KSI Frontend 是一個基於 React 18 + Vite 的現代化前端元件庫，採用 JavaScript 開發，整合了 Redux Toolkit 進行狀態管理，使用 Tailwind CSS 進行樣式設計，並配備完整的表單處理和測試框架。

### 主要特色

- 🚀 **現代化技術棧**：React 18 + Vite + Redux Toolkit
- 📱 **響應式設計**：支援多裝置適配
- 🎨 **統一設計系統**：Tailwind CSS + 自訂元件庫
- 🔧 **完整工具鏈**：ESLint + Prettier + Husky 代碼品質保證
- 🧪 **測試覆蓋**：Vitest + Testing Library 單元測試
- 🌐 **國際化支援**：i18next 多語言系統

## 🏗️ 專案架構

```
KSI/
├── public/                # 靜態資源
│   ├── vite.svg           # 應用圖示
│   └── locales/           # 多語言檔案
│       ├── en/translation.json
│       └── zh/translation.json
├── src/
│   ├── assets/            # 動態資源
│   │   ├── logo.png
│   │   └── logo1.svg
│   │
│   ├── components/        # 元件
│   │   ├── Button.jsx     # 按鈕元件
│   │   ├── Table.jsx      # 表格元件
│   │   ├── Input.jsx      # 輸入框元件
│   │   ├── Layout.jsx     # 版面配置
│   │   └── ...
│   ├── pages/             # 頁面
│   │   ├── Home.jsx       # 首頁
│   │   ├── Login.jsx      # 登入頁
│   │   ├── DEMO/          # 範本頁面
│   │   └── SYS/           # 系統管理相關頁面
│   ├── services/          # API 服務層
│   │   ├── api.js         # 基礎 API 配置
│   │   └── quOther.js     # 其他 API 服務
│   ├── store/             # Redux 狀態管理
│   │   ├── index.js       # Store 設定
│   │   └── mdLayoutSlice.js # MD Layout 專用 slice (開發中)
│   ├── utils/             # 工具函數
│   │   ├── func.js        # 通用函數
│   │   ├── alert.js       # 提醒工具
│   │   ├── Excel.js       # Excel 處理
│   │   ├── CSV.js         # CSV 處理
│   │   └── i18n.js        # 國際化設定
│   ├── App.jsx            # 根元件
│   └── main.jsx           # 應用程式入口
├── tests/                 # 測試檔案
├── package.json           # 依賴管理
├── vite.config.js         # Vite 配置
├── tailwind.config.js     # Tailwind 配置
└── 前端開發規範.md         # 開發規範文件
```

## 📦 技術堆棧與套件清單

### 核心框架

- **React** ^18.2.0 - 使用者介面框架
- **React DOM** ^18.2.0 - React DOM 渲染
- **Vite** ^6.2.6 - 建置工具

### 狀態管理

- **@reduxjs/toolkit** ^2.2.3 - Redux 現代化工具
- **react-redux** ^9.1.0 - React Redux 綁定

### 表單處理

- **react-hook-form** ^7.53.0 - 高效能表單處理
- **react-router-dom** ^6.22.3 - 路由管理

### UI 元件庫

- **@fortawesome/react-fontawesome** ^0.2.0 - FontAwesome 圖示
- **@fortawesome/free-solid-svg-icons** ^6.5.1

### 樣式處理

- **tailwindcss** ^3.4.3 - CSS 框架
- **tailwind-merge** ^2.2.2 - Tailwind 類別合併
- **autoprefixer** ^10.4.19 - CSS 自動前綴
- **postcss** ^8.4.38 - CSS 後處理器

### 國際化

- **i18next** ^23.10.1 - 國際化框架
- **react-i18next** ^14.1.0 - React i18next 綁定
- **i18next-browser-languagedetector** ^7.2.1 - 語言偵測

### 工具庫

- **exceljs** ^4.4.0 - Excel 處理
- **sweetalert2** ^11.6.13 - 提醒對話框

### 開發工具

- **eslint** ^8.57.1 - 代碼檢查
- **prettier** ^3.4.2 - 代碼格式化
- **husky** ^9.1.7 - Git hooks
- **lint-staged** ^15.3.0 - 分階段檢查
- **json-server** ^1.0.0-alpha.23 - 開發API伺服器

### 測試框架

- **vitest** ^3.1.2 - 測試執行器
- **@testing-library/react** ^16.3.0 - React 測試工具
- **@testing-library/jest-dom** ^6.6.3 - DOM 測試擴展
- **jsdom** ^26.1.0 - DOM 模擬

## ⚡ 開發環境設置

### 1. 環境要求

- Node.js 18+
- npm 或 yarn
- Git

### 2. 安裝步驟

```bash
# 克隆專案
git clone https://gitlab.ksi.com.tw/grace/ksi_frontend.git
cd KSI

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

```

### 3. 可用指令

```bash
npm run dev        # 啟動開發伺服器
npm run build      # 建置生產版本
npm run preview    # 預覽建置結果
npm run lint       # 執行 ESLint 檢查
npm run format     # 執行 Prettier 格式化
npm run test       # 執行測試
```

## 📋 React Hook Form 表單管理

### 基本概念

React Hook Form 是專案中主要的表單管理工具，提供高效能、靈活且易於使用的表單處理方案。

### 1. useForm 基本用法與狀態管理

```jsx
import { useForm } from 'react-hook-form';

const MyComponent = () => {
  const methods = useForm({
    mode: 'onTouched', // 驗證觸發模式：onSubmit, onTouched
    defaultValues: { username: '', email: '' },
  });

  const {
    control,
    setValue,
    getValues,
    watch,
    reset,
    handleSubmit,
    formState: { isDirty, dirtyFields, errors },
  } = methods;

  // 監聽特定欄位變化
  const username = watch('username');

  // 監聽所有欄位變化
  const allValues = watch();

  // 程式設定欄位值
  const updateUsername = () => {
    setValue('username', 'newValue', { shouldDirty: true });
  };

  // 取得特定欄位值
  const getCurrentEmail = () => {
    const email = getValues('email');
    console.log('當前 Email:', email);
  };

  // 重置表單
  const resetForm = () => {
    reset(); // 重置為初始值
    // 或重置為新值
    reset({ username: 'admin', email: 'admin@example.com' });
  };

  // 檢查表單狀態
  useEffect(() => {
    console.log('表單是否已修改:', isDirty);
    console.log('修改的欄位:', dirtyFields);
    console.log('驗證錯誤:', errors);
    console.log('表單是否有效:', isValid);
  }, [isDirty, dirtyFields, errors, isValid]);

  return <form onSubmit={handleSubmit(onSubmit)}>{/* 表單內容 */}</form>;
};
```

### 2. Controller 元件整合

`<Controller>` 是連接第三方 UI 元件與 React Hook Form 的橋樑：

```jsx
import { Controller } from 'react-hook-form';
import Input from '../components/Input';
import Dropdown from '../components/Dropdown';

// 基本用法，搭配自訂元件
<Controller
  name="category"
  control={control}
  render={({ field, fieldState: { error } }) => (
    <Input {...field} placeholder="請輸入使用者名稱" error={error?.message} />
  )}
/>;
```

### 3. 表單驗證規則

專案提供 `validationRules` 工具函數來建立驗證規則：

```jsx
import { validationRules } from '../utils/func';

// 基本驗證
<Controller
  name="username"
  control={control}
  rules={validationRules({ min: 3, max: 10, req: true })}
  render={({ field }) => <Input {...field} />}
/>

// 密碼驗證
<Controller
  name="password"
  control={control}
  rules={validationRules({ min: 8, max: 16, req: true, psw: true })}
  render={({ field }) => <Input {...field} type="password" />}
/>

// Email 驗證
<Controller
  name="email"
  control={control}
  rules={validationRules({ min: 10, max: 50, req: true, mail: true })}
  render={({ field }) => <Input {...field} type="email" />}
/>
```

#### validationRules 參數說明

| 參數     | 類型     | 說明                        |
| -------- | ------- | ----------------------------|
| `min`    | number  | 最小長度                     |
| `max`    | number  | 最大長度                     |
| `req`    | boolean | 是否必填                     |
| `psw`    | boolean | 密碼格式（英文、數字、符號）   |
| `mail`   | boolean | Email 格式驗證               |
| `id`     | boolean | 身分證字號格式（A123456789）  |
| `num`    | boolean | 純數字格式                   |
| `eng`    | boolean | 純英文格式                   |
| `engNum` | boolean | 英文+數字格式                |

### 4. 錯誤處理與顯示

```jsx
const MyComponent = () => {
  const methods = useForm({
    mode: 'onTouched',
    defaultValues: {
      editedMData: {
        username: '',
      },
    },
  });

  const {
    control,
    formState: { errors },
  } = methods;

  // 統一顯示錯誤訊息
  useEffect(() => {
    const allErrorMessages = [];

    Object.keys(errors).forEach((key) => {
      if (errors[key]) {
        // 收集錯誤
        const keyErrors = collectErrors(errors[key], key);
        allErrorMessages.push(...keyErrors);
      }
    });

    // 統一顯示所有錯誤
    if (allErrorMessages.length > 0) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: allErrorMessages.join('<br>'),
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
      });
    }
  }, [JSON.stringify(errors)]);

  return (
    <form>
      <Controller
        name="editedMData.username"
        control={control}
        rules={validationRules({ req: true })}
        render={({ field, fieldState: { error } }) => (
          <Input
            id="username"
            field={field}
            type="text"
            className={`col-span-4 w-1/2 ${errors?.editedMData.username ? 'border-red-500' : ''}`}
          />
        )}
      />
    </form>
  );
};
```

### 5. 與專案元件整合範例

```jsx
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import Input from '../components/Input';
import Dropdown from '../components/Dropdown';
import RadioGroup from '../components/Radio';
import { DateTimePicker } from '../components/Calendar';
import Table from '../components/Table';

const CompleteExample = () => {
  const methods = useForm({
    mode: 'onTouched',
    defaultValues: {
      editedMData: {
        PASS_NO: '',
        PASS_NA: '',
        PASS_CODE: '0',
        START_DATE: '',
      },
      programTableData: [],
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  const detailDataHook = useFieldArray({
    control,
    name: 'programTableData',
  });

  const onSubmit = (data) => {
    console.log('提交資料:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 單選按鈕 */}
      <Controller
        name="editedMData.PASS_CODE"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <RadioGroup
            items={[
              { DESC: '使用者', KEY: '0' },
              { DESC: '群組', KEY: '1' },
            ]}
            field={field}
          />
        )}
      />

      {/* 輸入框 */}
      <Controller
        name="editedMData.PASS_NO"
        control={control}
        rules={validationRules({ min: 3, max: 10, req: true, psw: true })}
        render={({ field }) => (
          <Input
            {...field}
            placeholder="請輸入帳號"
            className={errors?.editedMData?.PASS_NO ? 'border-red-500' : ''}
          />
        )}
      />

      {/* 日期選擇器 */}
      <Controller
        name="editedMData.START_DATE"
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <DateTimePicker value={value ?? ''} setValue={onChange} placeholder="請選擇時間" />
        )}
      />

      {/* 動態表格 */}
      <Table
        name="programTableData"
        columns={programColumns}
        methods={methods}
        useFieldArrayMethods={detailDataHook}
        emptyRow={{ PROG_NO: '', PROG_NA: '' }}
      />

      <button type="submit">提交</button>
    </form>
  );
};
```

### 6. 最佳實踐

#### ✅ 推薦做法

```jsx
// 1. 使用 Controller 包裝自訂元件
<Controller
  name="fieldName"
  control={control}
  render={({ field }) => <CustomComponent {...field} />}
/>

// 2. 善用 validationRules 進行驗證
rules={validationRules({ min: 5, max: 10, req: true })}

// 3. 監聽表單狀態變化
const isDirty = watch('isDirty');
useEffect(() => {
  if (isDirty) {
    setNotification(true);
  }
}, [isDirty]);

// 4. 合理使用 useFieldArray
const { fields, append, remove } = useFieldArray({
  control,
  name: 'arrayFieldName',
});
```

#### ❌ 避免做法

```jsx
// 1. 不要在 render 函數中直接使用 useState
<Controller
  render={() => {
    const [localState, setLocalState] = useState(); // ❌ 錯誤
    return <Input />;
  }}
/>

// 2. 不要忘記設定 control
<Controller name="field" render={...} /> // ❌ 缺少 control

// 3. 不要直接修改 field 物件
<Controller
  render={({ field }) => {
    field.value = 'newValue'; // ❌ 錯誤
    return <Input {...field} />;
  }}
/>
```

## 🧩 核心元件清單與使用方法

### 1. Layout 元件

頁面主結構元件，組合 header、aside、main、footer。

```jsx
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import Tree from '../components/Tree';

<Layout
  header={<Navbar label="系統名稱" />}
  aside={<Tree value={treeData} filterable />}
  main={<MainContent />}
  footer={<Footer />}
/>;
```

### 2. Table 元件

高度可定制的數據表格，支援排序、分頁、編輯等功能。

```jsx
import Table from '../components/Table';

const columns = [
  { header: 'checkbox', template: 'checkbox' },
  { header: '姓名', field: 'name', template: 'input' },
  { header: '金額', field: 'amount', template: 'money' },
  {
    header: '類型',
    field: 'type',
    template: 'select',
    options: [
      { KEY: 'A', DESC: '類型A' },
      { KEY: 'B', DESC: '類型B' },
    ],
  },
];

<Table
  name="tableData"
  columns={columns}
  emptyRow={{ name: '', amount: 0, type: '' }}
  isShowDefaultButton={true}
  customButtons={[
    {
      label: '自訂按鈕',
      icon: faPlus,
      onClick: (rowData) => console.log(rowData),
    },
  ]}
/>;
```

### 3. Input 元件

多功能輸入框元件，支援驗證和格式化。

```jsx
import Input from '../components/Input';

<Input
  field={field} //搭配 React Hook Form使用
  id="username"
  type="text"
  className="col-span-4"
  placeholder="請輸入使用者名稱"
  maxLength={50}
/>;
```

### 4. Button 元件

統一樣式的按鈕元件。

```jsx
import Button from '../components/Button';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

<Button
  label="新增"
  leftIcon={faPlus}
  className="bg-primary text-white"
  onClick={() => console.log('clicked')}
  disabled={false}
/>;
```

### 5. Dropdown 元件

下拉選單元件。

```jsx
import Dropdown from '../components/Dropdown';

const options = [
  { KEY: '1', DESC: '選項一' },
  { KEY: '2', DESC: '選項二' },
];

<Dropdown
  title="請選擇"
  data={options}
  onSelect={(key) => console.log('Selected:', key)}
  selectedId={getValues('editedMData.key')} // 綁定選擇的值
  disabled={false}
  addInputWithFilter // 兩種形式，按需選用
/>;
```

### 6. Modal 元件

彈窗元件。

```jsx
import Modal from '../components/Modal';

<Modal
  show={showModal}
  setShow={setShowModal}
  title="標題"
  footer={false} // true 才會顯示確認/取消按鈕
>
  <div>彈窗內容</div>
</Modal>;
```

### 7. Tab 元件

標籤頁元件。

```jsx
import { Tab, TabContent } from '../components/Tab';
import { useState } from 'react';

const [activeTab, setActiveTab] = useState(0);

<Tab activeIndex={activeTab} setActiveIndex={setActiveTab}>
  <TabContent title="頁籤一">
    <div>內容一</div>
  </TabContent>
  <TabContent title="頁籤二">
    <div>內容二</div>
  </TabContent>
</Tab>;
```

### 8. Radio 元件

單選按鈕元件，支援群組選擇。

```jsx
import RadioGroup from '../components/Radio';

const options = [
  { KEY: '1', DESC: '選項一' },
  { KEY: '2', DESC: '選項二' },
  { KEY: '3', DESC: '選項三' },
];

<RadioGroup
  items={options}
  selectedValue="1"
  onSelectedValue={(value) => console.log(value)}
  disabled={false}
/>;
```

### 9. Search 元件

搜尋元件，支援條件搜尋和結果篩選。

```jsx
import Search from '../components/Search';
import { useForm } from 'react-hook-form';

const methods = useForm();

<Search
  isShowSearchModal={showSearchModal}
  setIsShowSearchModal={setShowSearchModal}
  progApi="apiSYSCOMMI"
  methods={methods}
  handleSubmit={methods.handleSubmit}
  initFilterConditions={initFilterConditions}
  setTempValue={setTempValue}
  searchedEvent={() => setCurrentPage('master', 1)}
>
  搜尋表單畫面內容
</Search>;
```

### 10. InputWithModel 元件

帶彈窗選擇功能的輸入框元件。

```jsx
import InputWithModel from '../components/InputWithModel';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

<InputWithModel
  field={field} // 搭配RHF時用
  id="searchField"
  type="text"
  placeholder="點擊選擇"
  handleClick={() => setShowModal(true)}
  disabled={false}
/>;
```

### 11. QuBtn 元件

快速彈窗按鈕元件，用於觸發彈窗並支援自訂內容。

```jsx
import { QuBtn } from '../components/QuModal';
import Button from '../components/Button';
import { faUserFriends } from '@fortawesome/free-solid-svg-icons';

<QuBtn
  sender="btn_example"
  quModalingEvent={(arg) => {
    // 彈窗顯示前的處理
    arg.oldRow = { name: '預設值' };
  }}
  quModalCallbackedEvent={(result) => {
    console.log('彈窗回傳結果:', result);
  }}
  isMultiSelect={false}
  btnElement={<Button leftIcon={faUserFriends} label="開啟彈窗" onClick={() => {}} />}
>
  <div>彈窗內容</div>
</QuBtn>;
```

### 12. Label 元件

標籤元件，支援必填標示和樣式客製化。

```jsx
import Label from '../components/Label';

<Label
  id="name"
  label="使用者姓名"
  className="font-bold text-gray-700"
  required={true}
  value={name} // 必填時才需要
  text="內容不可空白" // 必填時才需要
>
  <Input />
</Label>;
```

### 13. Calendar 元件

日期時間選擇器元件，支援多種格式。

```jsx
import { DatePicker, DateTimePicker, TimePicker, DateRangePicker } from '../components/Calendar';

// 日期選擇器
<DatePicker
  value={selectedDate}
  setValue={setSelectedDate}
  placeholder="請選擇日期"
  min="2020-01-01"
  max="2030-12-31"
  onChange={(date) => console.log('選擇的日期:', date)}
  disabled={true}
/>;

// 日期時間選擇器
<DateTimePicker
  value={selectedDateTime}
  setValue={setSelectedDateTime}
  min="2020-01-01"
  max="2030-12-31"
  placeholder="請選擇日期時間"
  onChange={(dateTime) => console.log('選擇的日期時間:', dateTime)}
/>;

// 日期範圍選擇器
<DateRangePicker
  value={[startDate, endDate]}
  setValue={setDateRange}
  min="2020-01-01"
  max="2030-12-31"
  placeholder="請選擇日期範圍"
  onChange={(range) => console.log('選擇的日期範圍:', range)}
/>;
```

### 14. Checkbox 元件

複選框元件，支援單個或群組選擇。

```jsx
import CheckboxGroup, { Checkbox } from '../components/Checkbox';

// 單個複選框
<Checkbox
  text="同意條款"
  value="agree"
  checked={isAgreed}
  onChange={(e) => setIsAgreed(e.target.checked)}
  disabled={false}
/>;

// 複選框群組
const checkboxOptions = [
  { text: '選項一', value: 'option1', disabled: false, selected: false },
  { text: '選項二', value: 'option2', disabled: false, selected: true },
  { text: '選項三', value: 'option3', disabled: false, selected: false },
];

<CheckboxGroup items={checkboxOptions} onSetItems={setCheckboxOptions} disabled={false} />;
```

## 🗄️ Redux Store 狀態管理

### Store 結構

```javascript
{
  aSide: { value: boolean },        // 側邊欄開關狀態
  loading: { value: boolean },      // 載入狀態
  page: {                           // 顯示頁面狀態
    currentPage: { url, url_path },
    reloadKey: number
  },
  mdLayout: {                      // MD Layout 專用狀態(開發中)
    initData: object,
    tempValue: array,
    selectedRowId: number,
    isShowSearchModal: boolean,
    changePage: boolean,
    isEdit: boolean,
    currentPageMap: object,
    itemsPerPageMap: object
  }
}
```

### 使用方法

#### 1. 讀取狀態

```jsx
import { useSelector } from 'react-redux';

const MyComponent = () => {
  const isLoading = useSelector((state) => state.loading.value);
  const aSideIsOpen = useSelector((state) => state.aSide.value);
  const currentPage = useSelector((state) => state.page.currentPage);

  return <div>{isLoading ? 'Loading...' : 'Content'}</div>;
};
```

#### 2. 更新狀態

```jsx
import { useDispatch } from 'react-redux';
import { setLoading, aSideOpen, setPage } from '../store';

const MyComponent = () => {
  const dispatch = useDispatch();

  const handleLoading = () => {
    dispatch(setLoading(true)); // 開啟載入狀態
  };

  const toggleSidebar = () => {
    dispatch(aSideOpen()); // 切換側邊欄
  };

  const changePage = () => {
    dispatch(setPage({ url: 'NewPage', url_path: 'DEMO' }));
  };
};
```

## 📁 DEMO 資料夾檔案結構說明

DEMO 資料夾包含五種核心檔案類型，每種都有特定的用途和結構：

### 1. **MD 檔 (Master-Detail)** - 主明細檔案

MD 檔是最複雜的檔案類型，用於處理主檔與明細檔的關聯操作。

#### 檔案結構：

- **用途**：處理一對多的資料關係（如訂單與訂單明細）
- **特色**：支援主檔選擇、明細編輯、批次操作
- **核心功能**：CRUD 操作、分頁、搜尋、Tab 切換

#### 核心程式結構：

```jsx
// MD.jsx 基本結構
const MD = () => {
  // 1. 初始化資料結構
  const initMDataValue = {
    COMM_NO: '',
    COMM_NA: '',
  };

  // 2. 定義主檔表格欄位
  const masterColumns = [
    { header: 'checkbox', template: 'checkbox' },
    { header: '功能', template: 'actions', actions: ['onDelete', 'onCopy'] },
    { header: 'NO', field: 'COMM_NO', width: 'w-[120px]' },
    { header: 'NA', field: 'COMM_NA', width: 'min-w-[180px]' },
  ];

  // 3. 狀態管理
  const [initData, setInitData] = useState();
  const [searchData, setSearchData] = useState({});
  const [tempValue, setTempValue] = useState([]);
  const [datailValue, setDatailValue] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);

  // 4. API 整合
  const progApi = 'apiSYSCOMMI';

  // 5. 事件處理函數
  const handleSearch = async () => {
    /* 搜尋邏輯 */
  };
  const handleSave = async () => {
    /* 儲存邏輯 */
  };
  const handleDelete = async () => {
    /* 刪除邏輯 */
  };

  return (
    <MainPage title="主明細檔案">
      {/* 主檔表格 */}
      <Table columns={masterColumns} data={tempValue} />

      {/* Tab 切換明細 */}
      <Tab>
        <TabContent title="明細一">
          <Table columns={detailColumns} data={detailValue} />
        </TabContent>
      </Tab>
    </MainPage>
  );
};
```

#### 新手開發指南：

1. **複製範本**：從現有 MD.jsx 複製基本結構
2. **修改 API 端點**：更改 `progApi` 變數
3. **定義資料結構**：設定 `initMDataValue` 和欄位定義
4. **實作業務邏輯**：根據需求修改 CRUD 函數
5. **測試功能**：確保主檔與明細檔的聯動正常

### 2. **M 檔 (Master)** - 主檔維護

M 檔用於單一資料表的維護作業。

#### 檔案結構：

- **用途**：基本資料維護（如員工資料、商品資料）
- **特色**：單表 CRUD 操作、分頁
- **核心功能**：新增、修改、刪除、查詢

#### 核心程式結構：

```jsx
// M.jsx 基本結構
const M = () => {
  // 1. 資料初始化
  const initMDataValue = {
    COMM_NO: '',
    COMM_NA: '',
  };

  // 2. 表格欄位定義
  const masterColumns = [
    { header: 'checkbox', template: 'checkbox' },
    { header: '功能', template: 'actions', actions: ['onDelete', 'onCopy'] },
    { header: 'NO', field: 'COMM_NO' },
    { header: 'NA', field: 'COMM_NA' },
  ];

  // 3. 狀態與表單
  const methods = useForm({ defaultValues: initMDataValue });
  const [masterData, setMasterData] = useState([]);

  // 4. CRUD 操作
  const handleCreate = async (data) => {
    /* 新增邏輯 */
  };
  const handleUpdate = async (data) => {
    /* 更新邏輯 */
  };
  const handleDelete = async (ids) => {
    /* 刪除邏輯 */
  };

  return (
    <FormProvider {...methods}>
      <MainPage title="主檔維護">
        <Toolbar>
          <Button label="新增" onClick={handleCreate} />
          <Button label="儲存" onClick={methods.handleSubmit(handleUpdate)} />
        </Toolbar>
        <Table columns={masterColumns} data={masterData} />
      </MainPage>
    </FormProvider>
  );
};
```

#### 新手開發指南：

1. **設定基本資料**：定義 `initMDataValue` 和 `masterColumns`
2. **實作 API 呼叫**：連接後端 API 進行 CRUD 操作
3. **表單驗證**：使用 react-hook-form 進行表單驗證
4. **錯誤處理**：加入適當的錯誤處理和提示

### 3. **Q 檔 (Query)** - 查詢檔案

Q 檔專門用於資料查詢和搜尋功能。

#### 檔案結構：

- **用途**：資料查詢、搜尋、選擇
- **特色**：快速搜尋、多條件查詢、結果選擇
- **核心功能**：全域搜尋、條件篩選、資料選取

#### 核心程式結構：

```jsx
// Q.jsx 基本結構
const Q = ({ setShow, className }) => {
  // 1. 查詢欄位定義
  const masterColumns = [
    { header: 'NO', field: 'COMM_NO', width: 'w-[120px]' },
    { header: 'NA', field: 'COMM_NA', width: 'min-w-[180px]' },
    { header: '更新時間', field: 'UPD_DATE' },
    { header: '建立時間', field: 'CRT_DATE' },
  ];

  // 2. 搜尋狀態
  const [searchData, setSearchData] = useState();
  const [tempValue, setTempValue] = useState([]);

  // 3. 搜尋函數
  const handleSearch = (data) => {
    const filteredData = globalFilter(searchData?.masterData, data['PASS_NO']);
    setTempValue(filteredData?.map((item) => ({ ...item, id: crypto.randomUUID() })));
  };

  // 4. 資料選取
  const onClick = (rowData) => {
    localStorage.setItem('checkRow', JSON.stringify(rowData));
    setShow(false); // 關閉彈窗
  };

  return (
    <MainPage title="查詢檔案" className={className}>
      <Toolbar>
        <Input placeholder="搜尋關鍵字" onChange={handleSearch} />
      </Toolbar>
      <Table columns={masterColumns} data={tempValue} onRowClick={onClick} />
    </MainPage>
  );
};
```

#### 新手開發指南：

1. **設計查詢介面**：決定要顯示的欄位和搜尋條件
2. **實作搜尋邏輯**：使用 `globalFilter` 或自訂搜尋函數
3. **處理選取結果**：將選取的資料傳回呼叫方
4. **整合到其他檔案**：在 T 檔或 Modal 中使用

### 4. **T 檔 (Transaction)** - 異動檔案

T 檔用於處理業務交易和複雜的表單操作。

#### 檔案結構：

- **用途**：業務交易處理、複雜表單、工作流程
- **特色**：多步驟操作、表單驗證、資料整合
- **核心功能**：表單處理、資料驗證、業務邏輯

#### 核心程式結構：

```jsx
// T.jsx 基本結構
const T = () => {
  // 1. 表單初始值
  const { setValue, handleSubmit, control } = useForm({
    defaultValues: {
      PASS_NO: '',
      PASS_NA: '',
      opData: '',
      date: '',
    },
  });

  // 2. 狀態管理
  const [showModal, setShowModal] = useState(false);
  const [batchData, setBatchData] = useState();

  // 3. 彈窗開啟 (呼叫 Q 檔)
  const openModal = () => {
    setShowModal(true);
  };

  // 4. 業務邏輯處理
  const submit = async (data) => {
    try {
      const requestData = {
        pageSize: '150',
        currentPage: 1,
        PASS_NO: data.PASS_NO,
        PASS_NA: data.PASS_NA,
        // ... 其他欄位
      };

      const result = await fetchData('apiCOFAA029F/BatchOk', 'POST', requestData);
      setBatchData(result);

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: '處理完成',
        timer: 3000,
      });
    } catch (error) {
      console.error('處理失敗:', error);
    }
  };

  return (
    <MainPage title="異動檔案">
      <form onSubmit={handleSubmit(submit)}>
        <Controller
          name="PASS_NO"
          control={control}
          render={({ field }) => (
            <InputWithModel
              label="代碼"
              field={field}
              onClick={openModal}
              placeholder="請選擇或輸入代碼"
            />
          )}
        />

        <Button label="提交" type="submit" />
      </form>

      <Modal show={showModal} setShow={setShowModal} title="選擇資料">
        <Q setShow={setShowModal} />
      </Modal>
    </MainPage>
  );
};
```

#### 新手開發指南：

1. **設計表單結構**：使用 `useForm` 管理表單狀態
2. **整合 Q 檔**：通過 Modal 呼叫查詢功能
3. **實作業務邏輯**：在 submit 函數中處理業務規則
4. **錯誤處理**：加入完整的錯誤處理和使用者提示

### 5. **R 檔 (Report)** - 報表檔案

R 檔用於報表產生和列印功能。

#### 檔案結構：

- **用途**：報表產生、資料匯出、列印預覽
- **特色**：多格式匯出、預覽功能、參數設定
- **核心功能**：PDF 產生、Excel 匯出、列印設定

#### 核心程式結構：

```jsx
// R.jsx 基本結構
const R = () => {
  // 1. 表單設定
  const { setValue, handleSubmit, control } = useForm({
    defaultValues: {
      FUND: '',
      YEAR: '11306',
      sex: '0',
    },
  });

  // 2. 列印類型定義
  const printType = {
    PREVIEW: 0,
    PDF: 1,
    XLS: 2,
    ODS: 3,
    DOC: 4,
    ODT: 5,
  };

  // 3. 下拉選項
  const [dropDownData, setDropDownData] = useState([]);

  // 4. 列印處理
  const handlePrint = async (data, type) => {
    dispatch(setLoading(true));

    try {
      const printData = {
        ...initSearchData,
        ...data,
        reportKind: printType[type],
      };

      if (type === 'PREVIEW') {
        await handlePreview(progApi, printData);
      } else {
        await handleDownloadFile(progApi, printData, type);
      }
    } catch (error) {
      swalFailedMsg('列印失敗');
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <MainPage title="報表檔案">
      <form>
        <Controller
          name="FUND"
          control={control}
          render={({ field }) => <Dropdown label="基金別" field={field} options={dropDownData} />}
        />

        <div className="flex">
          <Button
            label="預覽"
            leftIcon={faEye}
            onClick={handleSubmit((data) => handlePrint(data, 'PREVIEW'))}
          />
          <Button
            label="另存PDF"
            leftIcon={faFilePdf}
            onClick={handleSubmit((data) => handlePrint(data, 'PDF'))}
          />
        </div>
      </form>
    </MainPage>
  );
};
```

#### 新手開發指南：

1. **設定報表參數**：定義使用者可設定的報表條件
2. **整合列印功能**：使用 `handlePreview` 和 `handleDownloadFile`
3. **多格式支援**：提供 PDF、Excel 等多種格式匯出
4. **使用者體驗**：加入載入狀態和進度提示

## 📝 最佳實踐與開發規範

### 1. 檔案命名規範

- **元件檔案**：使用 PascalCase (如 `Button.jsx`)
- **頁面檔案**：使用 PascalCase (如 `UserProfile.jsx`)
- **工具函數**：使用 camelCase (如 `utils/func.js`)

### 2. 元件開發規範

```jsx
/**
 * @component ComponentName
 * @description 元件描述
 * @param {string} prop1 - 參數說明
 * @param {function} prop2 - 函數參數說明
 * @returns {JSX.Element} 元件
 */
const ComponentName = ({ prop1, prop2 }) => {
  // 邏輯實作
  return <div>{/* JSX */}</div>;
};

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.func,
};

export default ComponentName;
```

### 3. Hook 使用規範

```jsx
// ✅ 正確：明確依賴陣列
useEffect(() => {
  fetchData();
}, [userId]);

// ✅ 正確：清理副作用
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer);
}, []);

// ❌ 錯誤：缺少依賴陣列
useEffect(() => {
  fetchData();
});
```

### 4. API 呼叫規範

```jsx
const handleApiCall = async () => {
  dispatch(setLoading(true));

  try {
    const result = await fetchData('api/endpoint', 'POST', data);
    // 處理成功結果
    swalSuccessMsg('操作成功');
  } catch (error) {
    console.error('API Error:', error);
    swalErrorMsg('操作失敗');
  } finally {
    dispatch(setLoading(false));
  }
};
```

## 🔧 常見問題與故障排除

### 1. 開發環境問題

**Q: 啟動專案時出現 "Module not found" 錯誤**

```bash
# 清除 node_modules 並重新安裝
rm -rf node_modules package-lock.json
npm install
```

**Q: Vite 建置失敗**

```bash
# 檢查 Node.js 版本 (需要 18+)
node --version

# 清除快取
npm run dev -- --force
```

### 2. 元件使用問題

**Q: Table 元件資料不顯示**

```jsx
// ✅ 確保資料結構正確
const data = [
  { id: 1, name: 'John', age: 30 },
  { id: 2, name: 'Jane', age: 25 },
];

// ✅ 確保欄位定義對應
const columns = [
  { header: '姓名', field: 'name' },
  { header: '年齡', field: 'age' },
];
```

**Q: Redux 狀態沒有更新**

```jsx
// ✅ 確保使用正確的 action
import { setLoading } from '../store';

// ✅ 確保在元件內呼叫 dispatch
const dispatch = useDispatch();
dispatch(setLoading(true));
```

### 3. 樣式問題

**Q: Tailwind CSS 樣式不生效**

```jsx
// ✅ 確保類別名稱正確
<div className="bg-blue-500 text-white p-4">

// ❌ 避免動態類別名稱
<div className={`bg-${color}-500`}> // 可能不會被建置

// ✅ 使用完整的類別名稱
<div className={color === 'blue' ? 'bg-blue-500' : 'bg-red-500'}>
```

### 4. 表單問題

**Q: React Hook Form 驗證不觸發**

```jsx
// ✅ 確保正確的驗證設定
<Controller
  name="username"
  control={control}
  rules={{ required: '使用者名稱為必填' }}
  render={({ field, fieldState: { error } }) => <Input {...field} error={error?.message} />}
/>
```

### 5. API 相關問題

**Q: API 請求失敗**

```jsx
// ✅ 檢查環境變數設定
console.log(import.meta.env.VITE_BASEURL);

// ✅ 檢查 token 是否存在
const token = getAccessToken();
if (!token) {
  // 重新導向到登入頁
}

// ✅ 完整的錯誤處理
try {
  const result = await fetchData('api/endpoint', 'POST', data);
} catch (error) {
  if (error.status === 401) {
    // 處理未授權
    logout();
  } else {
    swalErrorMsg(error.message);
  }
}
```

---

## 🎓 學習資源

- [React 官方文件](https://react.dev/)
- [Redux Toolkit 文件](https://redux-toolkit.js.org/)
- [React Hook Form 文件](https://react-hook-form.com/)
- [Tailwind CSS 文件](https://tailwindcss.com/)
- [Vite 文件](https://vitejs.dev/)

---

**版本**：v1.0.0  
**最後更新**：2025-06-26  
**維護者**：KSI 開發團隊

如有任何問題或建議，請聯絡開發團隊或查看專案的 [前端開發規範.md](./前端開發規範.md) 文件。
