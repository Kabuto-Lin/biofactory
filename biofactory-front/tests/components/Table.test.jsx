import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';
import React from 'react';
import Table from '../../src/components/Table';
import { useForm } from 'react-hook-form';

describe('Table 元件', () => {
  // 建立一個簡單的 Wrapper 以便測試 React Hook Form 整合
  function Wrapper(props) {
    const methods = useForm({
      defaultValues: {
        testTable: [
          { id: 1, name: 'A', amount: 100, type: 'T1' },
          { id: 2, name: 'B', amount: 200, type: 'T2' },
        ],
      },
    });
    return <Table methods={methods} name="testTable" {...props} />;
  }

  const emptyRow = { id: null, name: null, amount: null, type: null };

  const columns = [
    { field: 'select', header: '', template: 'checkbox' },
    { field: 'name', header: '名稱', template: 'input' },
    { field: 'amount', header: '金額', template: 'money' },
    {
      field: 'type',
      header: '類型',
      template: 'select',
      options: [
        { KEY: 'T1', DESC: '類型1' },
        { KEY: 'T2', DESC: '類型2' },
      ],
    },
    { field: 'actions', header: '操作', template: 'actions', actions: ['onDelete'] },
  ];

  it('應正確渲染表頭', () => {
    render(
      <Wrapper
        columns={columns}
        emptyRow={emptyRow}
        itemsPerPage={10}
        currentPage={1}
        setColumns={() => {}}
        handlePageChange={() => {}}
      />,
    );
    expect(screen.getByText('名稱')).toBeInTheDocument();
    expect(screen.getByText('金額')).toBeInTheDocument();
    expect(screen.getByText('類型')).toBeInTheDocument();
    expect(screen.getByText('操作')).toBeInTheDocument();
  });

  it('應正確渲染資料列', () => {
    render(
      <Wrapper
        columns={columns}
        emptyRow={emptyRow}
        itemsPerPage={10}
        currentPage={1}
        setColumns={() => {}}
        handlePageChange={() => {}}
      />,
    );
    expect(screen.getByDisplayValue('A')).toBeInTheDocument();
    expect(screen.getByDisplayValue('B')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('200')).toBeInTheDocument();
  });

  it('select 欄位應正確渲染 options', () => {
    render(
      <Wrapper
        columns={columns}
        emptyRow={emptyRow}
        itemsPerPage={10}
        currentPage={1}
        setColumns={() => {}}
        handlePageChange={() => {}}
      />,
    );
    expect(screen.getAllByText('類型1')[0]).toBeInTheDocument();
    expect(screen.getAllByText('類型2')[0]).toBeInTheDocument();
  });

  it('未勾選 row 時點擊刪除應顯示提示', async () => {
    const fireSpy = vi.spyOn(Swal, 'fire');
    const handlePageChange = vi.fn();
    render(
      <Wrapper
        columns={columns}
        emptyRow={emptyRow}
        itemsPerPage={10}
        currentPage={1}
        setColumns={() => {}}
        handlePageChange={handlePageChange}
      />,
    );
    const deleteButton = screen.getAllByRole('button', { name: /刪除/i })[0];
    fireEvent.click(deleteButton);
    await waitFor(() => {
      expect(fireSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '請先勾選要刪除的資料列',
        }),
      );
    });
    fireSpy.mockRestore();
  });

  it('勾選 row 並點擊刪除應刪除該列', async () => {
    const handlePageChange = vi.fn();
    render(
      <Wrapper
        columns={columns}
        emptyRow={emptyRow}
        itemsPerPage={10}
        currentPage={1}
        setColumns={() => {}}
        handlePageChange={handlePageChange}
      />,
    );
    // 勾選第一列的 checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // 0 是全選，1 是第一列
    const deleteButton = screen.getAllByRole('button', { name: /刪除/i })[0];
    fireEvent.click(deleteButton);
    // 等待 DOM 更新
    await waitFor(() => {
      expect(screen.queryByDisplayValue('A')).not.toBeInTheDocument();
    });
  });

  it('無資料時應顯示查無資料', () => {
    function EmptyWrapper(props) {
      const methods = useForm({ defaultValues: { testTable: [] } });
      return <Table methods={methods} name="testTable" {...props} />;
    }
    render(
      <EmptyWrapper
        columns={columns}
        emptyRow={emptyRow}
        itemsPerPage={10}
        currentPage={1}
        setColumns={() => {}}
        handlePageChange={() => {}}
      />,
    );
    expect(screen.getByText('查無資料')).toBeInTheDocument();
  });

  it('可自訂每頁筆數與分頁', () => {
    render(
      <Wrapper
        columns={columns}
        emptyRow={emptyRow}
        itemsPerPage={1}
        currentPage={1}
        setColumns={() => {}}
        handlePageChange={() => {}}
      />,
    );
    // 第一頁只會有一筆
    expect(screen.getByDisplayValue('A')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('B')).not.toBeInTheDocument();
  });

  it('點擊新增按鈕應新增一列', () => {
    render(
      <Wrapper
        columns={columns}
        emptyRow={{ name: '', amount: '', type: '' }}
        itemsPerPage={10}
        currentPage={1}
        setColumns={() => {}}
        handlePageChange={() => {}}
      />,
    );
    // 先取得所有 input
    const beforeInputs = screen.getAllByRole('textbox');
    // 點擊新增按鈕
    const addButton = screen.getByRole('button', { name: /新增/i });
    fireEvent.click(addButton);
    // 新增後 input 數量應增加
    const afterInputs = screen.getAllByRole('textbox');
    expect(afterInputs.length).toBeGreaterThan(beforeInputs.length);
  });
});
