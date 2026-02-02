import {
  multiConditionSearch,
  compareValue,
  formatDate,
  handleDownloadFile,
  sortValues,
  globalFilter,
  createId,
  isEmptyObject,
  addCheckedProperty,
  filterBeCheckedData,
  buildCombineData,
  getCurrentDate,
  getPastDate,
  nvl,
  getAccessToken,
  getRefreshToken,
  setNewRowId,
  getMaxRowId,
  getNearRowId,
  handleGoBack,
  validationRules,
  buildDetailData,
  buildTabsDetailData,
  getDataIndex,
  getNewData,
  handlePreview,
} from './func';

import { expect, test, describe, it, vi, beforeAll, afterAll } from 'vitest';

describe('multiConditionSearch', () => {
  const data = [
    { name: 'Alice', age: 25, city: 'Taipei' },
    { name: 'Bob', age: 30, city: 'Kaohsiung' },
    { name: 'Charlie', age: 35, city: 'Taipei' },
  ];
  it('應該根據多個條件正確篩選', () => {
    const result = multiConditionSearch(data, { city: 'Taipei', age: 25 });
    expect(result).toEqual([{ name: 'Alice', age: 25, city: 'Taipei' }]);
  });
  it('應該忽略空值條件', () => {
    const result = multiConditionSearch(data, { city: '', age: 30 });
    expect(result).toEqual([{ name: 'Bob', age: 30, city: 'Kaohsiung' }]);
  });
  it('應該回傳所有資料，當條件全為空', () => {
    const result = multiConditionSearch(data, { city: '', age: null });
    expect(result).toEqual(data);
  });
  it('應該支援部分條件比對', () => {
    const result = multiConditionSearch(data, { name: 'char' });
    expect(result).toEqual([{ name: 'Charlie', age: 35, city: 'Taipei' }]);
  });
});
describe('compareValue', () => {
  it('應該呼叫 notEqualCallback 當值不相等時', () => {
    const value = [{ a: 1 }];
    const tempValue = [{ a: 2 }];
    const notEqualCallback = vi.fn();
    const equalCallback = vi.fn();
    compareValue(value, tempValue, notEqualCallback, equalCallback);
    expect(notEqualCallback).toHaveBeenCalledTimes(1);
    expect(equalCallback).not.toHaveBeenCalled();
  });
  it('應該呼叫 equalCallback 當值相等時', () => {
    const value = [{ a: 1 }];
    const tempValue = [{ a: 1 }];
    const notEqualCallback = vi.fn();
    const equalCallback = vi.fn();
    compareValue(value, tempValue, notEqualCallback, equalCallback);
    expect(equalCallback).toHaveBeenCalledTimes(1);
    expect(notEqualCallback).not.toHaveBeenCalled();
  });
});
describe('formatDate', () => {
  it('應該正確格式化日期', () => {
    const date = new Date('2024-11-06T17:17:21');
    expect(formatDate(date)).toBe('2024-11-06 17:17:21');
  });
  it('應該補零', () => {
    const date = new Date('2024-01-02T03:04:05');
    expect(formatDate(date)).toBe('2024-01-02 03:04:05');
  });
});
describe('handleDownloadFile', () => {
  beforeAll(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'mockedUrl'), revokeObjectURL: vi.fn() });
    vi.stubGlobal('document', {
      createElement: vi.fn(() => ({ click: vi.fn(), remove: vi.fn() })),
      body: { appendChild: vi.fn() },
    });
    vi.stubGlobal('window', {
      URL: { createObjectURL: vi.fn(() => 'mockedUrl'), revokeObjectURL: vi.fn() },
    });
  });
  afterAll(() => {
    vi.unstubAllGlobals();
  });
  it('應該正確下載檔案', async () => {
    fetch.mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob(['test'])) });
    const alert = vi.fn();
    await handleDownloadFile('fileUrl', 'fileTitle', alert);
    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });
  it('應該呼叫 alert 當下載失敗時', async () => {
    fetch.mockResolvedValue({ ok: false });
    const alert = vi.fn();
    await handleDownloadFile('fileUrl', 'fileTitle', alert);
    expect(alert).toHaveBeenCalled();
  });
});

describe('sortValues', () => {
  it('應該根據第一個鍵值的值對物件陣列進行排序', () => {
    const data = [{ b: 2 }, { a: 1 }, { c: 3 }];
    const sorted = sortValues(data);
    expect(sorted).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
  });

  it('不應該修改原始陣列', () => {
    const data = [{ b: 2 }, { a: 1 }, { c: 3 }];
    const dataCopy = [...data];
    sortValues(data);
    expect(data).toEqual(dataCopy);
  });

  it('應該處理空陣列', () => {
    const data = [];
    const sorted = sortValues(data);
    expect(sorted).toEqual([]);
  });
});

describe('globalFilter', () => {
  it('應該篩選出包含篩選文字的物件', () => {
    const data = [
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 30 },
      { name: 'Charlie', age: 35 },
    ];
    const filtered = globalFilter(data, 'bob');
    expect(filtered).toEqual([{ name: 'Bob', age: 30 }]);
  });

  it('當沒有值符合篩選文字時，應該回傳空陣列', () => {
    const data = [
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 30 },
      { name: 'Charlie', age: 35 },
    ];
    const filtered = globalFilter(data, 'z');
    expect(filtered).toEqual([]);
  });

  it('應該能處理空陣列', () => {
    const data = [];
    const filtered = globalFilter(data, 'Alice');
    expect(filtered).toEqual([]);
  });
});

describe('createId', () => {
  it('應該生成一個長度為5的隨機ID', () => {
    const id = createId();
    expect(id).toHaveLength(5);
    expect(/^[A-Za-z0-9]{5}$/.test(id)).toBe(true);
  });

  it('應該生成不同的ID', () => {
    const id1 = createId();
    const id2 = createId();
    expect(id1).not.toBe(id2);
  });

  it('應該生成有效的字元', () => {
    const id = createId();
    expect(/^[A-Za-z0-9]+$/.test(id)).toBe(true);
  });
});

describe('isEmptyObject', () => {
  it('應該返回true，當物件為空時', () => {
    expect(isEmptyObject({})).toBe(true);
  });

  it('應該返回false，當物件不為空時', () => {
    expect(isEmptyObject({ key: 'value' })).toBe(false);
  });

  it('應該返回true，當輸入為null或undefined時', () => {
    expect(isEmptyObject(null)).toBe(true);
    expect(isEmptyObject(undefined)).toBe(true);
  });
});

describe('addCheckedProperty', () => {
  it('應該為每個陣列項目添加checked屬性', () => {
    const data = { items: [{ id: 1 }, { id: 2 }] };
    const result = addCheckedProperty(data);
    expect(result.items.every((item) => item.checked === false)).toBe(true);
  });

  it('應該處理空的items陣列', () => {
    const data = { items: [] };
    const result = addCheckedProperty(data);
    expect(result.items).toEqual([]);
  });

  it('應該不修改原始物件', () => {
    const data = { items: [{ id: 1 }] };
    const dataCopy = JSON.parse(JSON.stringify(data));
    addCheckedProperty(data);
    expect(data).toEqual(dataCopy);
  });
});

describe('filterBeCheckedData', () => {
  it('應該篩選出被勾選的資料', () => {
    const checkedData = [
      { isChecked: true, ROWSEQ_O: 1 },
      { isChecked: false, ROWSEQ_O: 2 },
    ];
    const allData = [
      { ROWSEQ_O: 1, name: 'Alice' },
      { ROWSEQ_O: 2, name: 'Bob' },
    ];
    const result = filterBeCheckedData(checkedData, allData);
    expect(result).toEqual([{ oldRow: { ROWSEQ_O: 1, name: 'Alice' }, newRow: null }]);
  });

  it('應該返回空陣列，當沒有資料被勾選時', () => {
    const checkedData = [
      { isChecked: false, ROWSEQ_O: 1 },
      { isChecked: false, ROWSEQ_O: 2 },
    ];
    const allData = [
      { ROWSEQ_O: 1, name: 'Alice' },
      { ROWSEQ_O: 2, name: 'Bob' },
    ];
    const result = filterBeCheckedData(checkedData, allData);
    expect(result).toEqual([]);
  });

  it('應該處理空的checkedData陣列', () => {
    const checkedData = [];
    const allData = [
      { ROWSEQ_O: 1, name: 'Alice' },
      { ROWSEQ_O: 2, name: 'Bob' },
    ];
    const result = filterBeCheckedData(checkedData, allData);
    expect(result).toEqual([]);
  });
});

describe('buildCombineData', () => {
  it('應該正確組合資料', () => {
    const data = {
      editedMData: { key: 'value' },
      masterData: { rowId: { key: 'oldValue' } },
    };
    const initData = { emptyRow: {}, searchData: [] };
    const result = buildCombineData(data, initData, 'Edit', 'rowId');
    expect(result.masterRow.newRow).toEqual({ key: 'value' });
    expect(result.masterRow.oldRow).toEqual({ key: 'oldValue' });
  });
});

describe('getCurrentDate', () => {
  it('應該返回當前日期，格式為YYYY/MM/DD', () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const expectedDate = `${year}/${month}/${day}`;
    expect(getCurrentDate()).toBe(expectedDate);
  });
});

describe('getPastDate', () => {
  it('應該返回過去指定天數的日期', () => {
    const days = 5;
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - days);
    const year = pastDate.getFullYear();
    const month = (pastDate.getMonth() + 1).toString().padStart(2, '0');
    const day = pastDate.getDate().toString().padStart(2, '0');
    const expectedDate = `${year}/${month}/${day}`;
    expect(getPastDate(days)).toBe(expectedDate);
  });
});

describe('nvl', () => {
  it('應該返回預設值，當輸入為null或undefined時', () => {
    expect(nvl(null, 'default')).toBe('default');
    expect(nvl(undefined, 'default')).toBe('default');
  });

  it('應該返回原值，當輸入不為null或undefined時', () => {
    expect(nvl('value', 'default')).toBe('value');
  });
});

describe('getAccessToken', () => {
  it('應該返回accessToken，當userData存在時', () => {
    localStorage.setItem('userData', JSON.stringify({ accessToken: 'abc123' }));
    expect(getAccessToken()).toBe('abc123');
  });

  it('應該返回undefined，當userData不存在時', () => {
    localStorage.removeItem('userData');
    expect(getAccessToken()).toBeUndefined();
  });
});

describe('getRefreshToken', () => {
  it('應該返回refreshToken，當userData存在時', () => {
    localStorage.setItem('userData', JSON.stringify({ refreshToken: 'xyz789' }));
    expect(getRefreshToken()).toBe('xyz789');
  });

  it('應該返回undefined，當userData不存在時', () => {
    localStorage.removeItem('userData');
    expect(getRefreshToken()).toBeUndefined();
  });
});

describe('setNewRowId', () => {
  it('應該返回0，當a_row為null時', () => {
    expect(setNewRowId(null, [{ ROWSEQ: 1 }, { ROWSEQ: 2 }])).toBe(0);
  });

  it('應該返回0，當a_srcRows為null時', () => {
    expect(setNewRowId({ ROWSEQ: 3 }, null)).toBe(0);
  });

  it('應該返回最大ROWSEQ加1，當a_row和a_srcRows都存在時', () => {
    const a_srcRows = [
      { id: 1, ROWSEQ: 1 },
      { id: 2, ROWSEQ: 2 },
    ];
    expect(setNewRowId({ id: 3 }, a_srcRows)).toBe(3);
  });
});

describe('getMaxRowId', () => {
  it('應該返回0，當a_srcRows為null時', () => {
    expect(getMaxRowId(null)).toBe(0);
  });

  it('應該返回0，當a_srcRows為空陣列時', () => {
    expect(getMaxRowId([])).toBe(0);
  });

  it('應該返回最大ROWSEQ值，當a_srcRows有有效ROWSEQ時', () => {
    const a_srcRows = [{ ROWSEQ: 1 }, { ROWSEQ: 3 }, { ROWSEQ: 2 }];
    expect(getMaxRowId(a_srcRows)).toBe(3);
  });

  it('應該返回-1，當a_srcRows有undefined的ROWSEQ時', () => {
    const a_srcRows = [{ ROWSEQ: 1 }, { ROWSEQ: undefined }];
    expect(getMaxRowId(a_srcRows)).toBe(-1);
  });

  it('應該返回-1，當a_srcRows有null的ROWSEQ時', () => {
    const a_srcRows = [{ ROWSEQ: 1 }, { ROWSEQ: null }];
    expect(getMaxRowId(a_srcRows)).toBe(-1);
  });
});

describe('getNearRowId', () => {
  it('應該返回null，當a_row不存在於a_srcRows時', () => {
    const a_srcRows = [{ ROWSEQ: 1 }, { ROWSEQ: 2 }];
    expect(getNearRowId({ ROWSEQ: 3 }, a_srcRows)).toBeNull();
  });

  it('應該返回下一筆ROWSEQ，當刪除的是第一筆且有其他資料時', () => {
    const a_srcRows = [{ ROWSEQ: 1 }, { ROWSEQ: 2 }];
    expect(getNearRowId({ ROWSEQ: 1 }, a_srcRows)).toBe(2);
  });

  it('應該返回上一筆ROWSEQ，當刪除的是中間或最後一筆時', () => {
    const a_srcRows = [{ ROWSEQ: 1 }, { ROWSEQ: 2 }, { ROWSEQ: 3 }];
    expect(getNearRowId({ ROWSEQ: 3 }, a_srcRows)).toBe(2);
  });

  it('應該返回null，當資料列只有一筆時', () => {
    const a_srcRows = [{ ROWSEQ: 1 }];
    expect(getNearRowId({ ROWSEQ: 1 }, a_srcRows)).toBeNull();
  });
});

describe('handleGoBack', () => {
  it('應該執行goFunction，當notification為false時', () => {
    const goFunction = vi.fn();
    handleGoBack(goFunction, false);
    expect(goFunction).toHaveBeenCalled();
  });

  it('應該顯示警告，當notification為true時', async () => {
    const goFunction = vi.fn();
    const fireSpy = vi.spyOn(Swal, 'fire').mockResolvedValue({ isConfirmed: true });
    await handleGoBack(goFunction, true);
    expect(fireSpy).toHaveBeenCalled();
    expect(goFunction).toHaveBeenCalled();
    fireSpy.mockRestore();
  });

  it('不應該執行goFunction，當notification為true且用戶取消時', async () => {
    const goFunction = vi.fn();
    const fireSpy = vi.spyOn(Swal, 'fire').mockResolvedValue({ isConfirmed: false });
    await handleGoBack(goFunction, true);
    expect(fireSpy).toHaveBeenCalled();
    expect(goFunction).not.toHaveBeenCalled();
    fireSpy.mockRestore();
  });
});

describe('validationRules', () => {
  it('應該返回必填規則，當required為true時', () => {
    const rules = validationRules(0, Infinity, false, false, false, false, false, true);
    expect(rules.required).toEqual({ value: true, message: '此欄位為必填' });
  });

  it('應該返回長度規則，當minLength和maxLength被設置時', () => {
    const rules = validationRules(5, 10);
    expect(rules.minLength).toEqual({ value: 5, message: '長度必須至少為 5 位' });
    expect(rules.maxLength).toEqual({ value: 10, message: '長度必須小於等於 10 位' });
  });

  it('應該返回數字格式規則，當onlyNumbers為true時', () => {
    const rules = validationRules(5, 10, false, false, true);
    expect(rules.pattern).toEqual({
      value: /^[0-9]{5,10}$/,
      message: '只能包含數字，且長度必須在 5 到 10 位之間',
    });
  });

  it('應該返回Email格式規則，當email為true時', () => {
    const rules = validationRules(0, Infinity, false, false, false, false, true);
    expect(rules.pattern).toEqual({
      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: '請輸入有效的 Email 格式',
    });
  });
});

describe('buildDetailData', () => {
  it('應該正確構建詳細資料', () => {
    const data = { editedDetail: [{ ROWSEQ_O: 1 }] };
    const initData = { details: [{ emptyRow: {} }] };
    const result = buildDetailData(data, initData);
    expect(result).toEqual([{ oldRow: null, newRow: { ROWSEQ_O: 1 } }]);
  });

  it('應該處理空的 editedDetail', () => {
    const data = { editedDetail: [] };
    const initData = { details: [{ emptyRow: {} }] };
    const result = buildDetailData(data, initData);
    expect(result).toEqual([]);
  });

  it('應該處理 isEdit 為 true 的情況', () => {
    const data = { editedDetail: [{ ROWSEQ_O: 1 }] };
    const initData = { details: [{ emptyRow: {} }] };
    const oldDetailValue = [{ ROWSEQ_O: 2 }];
    const result = buildDetailData(data, initData, oldDetailValue, true);
    expect(result).toEqual([
      { oldRow: null, newRow: { ROWSEQ_O: 1 } },
      { oldRow: { ROWSEQ_O: 2 }, newRow: null },
    ]);
  });
});

describe('buildTabsDetailData', () => {
  it('應該正確構建多個 Tab 的詳細資料(編輯, 新增, 刪除)', () => {
    const data = {
      details: {
        0: [{ ROWSEQ_O: 1 }, { ROWSEQ_O: 2 }],
      },
    };
    const params = [[{ ROWSEQ_O: 1 }, { ROWSEQ_O: 3 }]];
    const result = buildTabsDetailData(data, ...params);

    expect(result).toEqual([
      {
        id: '0',
        rows: [
          { oldRow: { ROWSEQ_O: 1 }, newRow: { ROWSEQ_O: 1 } }, // 編輯
          { oldRow: { ROWSEQ_O: 2 }, newRow: null }, // 刪除
          { oldRow: null, newRow: { ROWSEQ_O: 3 } }, // 新增
        ],
      },
    ]);
  });

  it('應該處理空的 details 和空的 params', () => {
    const data = { details: { 0: [], 1: [] } };
    const params = [[], []];
    const result = buildTabsDetailData(data, ...params);
    expect(result).toEqual([
      { id: '0', rows: [] },
      { id: '1', rows: [] },
    ]);
  });

  it('應該在 details 不存在時報錯', () => {
    const data = {}; // 無 details
    expect(() => buildTabsDetailData(data, [], [])).toThrow('data.details');
  });

  it('應該在 details 為 null 時報錯', () => {
    const data = { details: null };
    expect(() => buildTabsDetailData(data, [], [])).toThrow('data.details');
  });

  it('應該在 details 為 Array 時報錯', () => {
    const data = { details: [] };
    expect(() => buildTabsDetailData(data, [], [])).toThrow('data.details');
  });

  it('應該處理 params 中某一筆為非陣列物件', () => {
    const data = { details: { 0: [] } };
    const result = buildTabsDetailData(data, { ROWSEQ_O: 1 }); // 傳入單一物件
    expect(result).toEqual([
      {
        id: '0',
        rows: [{ oldRow: null, newRow: { ROWSEQ_O: 1 } }],
      },
    ]);
  });

  it('應該處理 params 中某個為 null', () => {
    const data = {
      details: { 0: [{ ROWSEQ_O: 5 }] },
    };
    const result = buildTabsDetailData(data, null); // 第 0 筆是 null
    expect(result).toEqual([
      {
        id: '0',
        rows: [{ oldRow: { ROWSEQ_O: 5 }, newRow: null }],
      },
    ]);
  });

  it('應該處理 params 中某個為 undefined', () => {
    const data = {
      details: { 0: [{ ROWSEQ_O: 6 }] },
    };
    const result = buildTabsDetailData(data, undefined);
    expect(result).toEqual([
      {
        id: '0',
        rows: [{ oldRow: { ROWSEQ_O: 6 }, newRow: null }],
      },
    ]);
  });

  it('應該處理單一物件 newRow，自動包裝成陣列', () => {
    const data = {
      details: {
        0: [],
      },
    };
    const result = buildTabsDetailData(data, { ROWSEQ_O: 99 }); // 單一物件
    expect(result).toEqual([
      {
        id: '0',
        rows: [{ oldRow: null, newRow: { ROWSEQ_O: 99 } }],
      },
    ]);
  });
});

describe('getDataIndex', () => {
  it('應該返回下一筆的索引', () => {
    const result = getDataIndex(0, 5, 'next');
    expect(result).toBe(1);
  });

  it('應該返回上一筆的索引', () => {
    const result = getDataIndex(1, 5, 'back');
    expect(result).toBe(0);
  });

  it('應該返回第一筆的索引', () => {
    const result = getDataIndex(3, 5, 'first');
    expect(result).toBe(0);
  });
});

describe('getNewData', () => {
  it('應該返回最後一筆資料', () => {
    const tempValue = [{ id: 1 }, { id: 2 }];
    const result = getNewData(-1, tempValue);
    expect(result).toEqual({ id: 2 });
  });

  it('應該返回指定索引的資料', () => {
    const tempValue = [{ id: 1 }, { id: 2 }];
    const result = getNewData(0, tempValue);
    expect(result).toEqual({ id: 1 });
  });

  it('應該處理空的 tempValue', () => {
    const tempValue = [];
    const result = getNewData(0, tempValue);
    expect(result).toBeUndefined();
  });
});

describe('handlePreview', () => {
  beforeAll(() => {
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'mockedObjectURL'),
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('應該拋出錯誤當網路回應不正確時', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: false })),
    );
    await expect(handlePreview('url')).rejects.toThrow('Network response was not ok');
  });

  it('應該正確處理成功的回應', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(new Blob(['test content'], { type: 'application/pdf' })),
        }),
      ),
    );
    const openSpy = vi
      .spyOn(window, 'open')
      .mockImplementation(() => ({ focus: vi.fn(), closed: false }));
    await handlePreview('url');
    expect(openSpy).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
  });
});
