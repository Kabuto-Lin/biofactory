import Swal from 'sweetalert2';
/**Sweet alart error Msg */
const swalErrorMsg = () => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3500,
    icon: 'warning',
    title: '資料異常，請聯絡系統管理員處理。',
  });
};

const swalFailedMsg = () => {
  Swal.fire({
    title: '操作失敗',
    text: '請稍後再試，或請網站管理員處理',
    icon: 'error',
    confirmButtonText: '確定',
    confirmButtonColor: '#3b82f6',
  });
};

const swalSuccessMsg = () => {
  Swal.fire({
    title: '操作成功',
    icon: 'success',
    timer: 2500,
    confirmButtonText: '確定',
    confirmButtonColor: '#3b82f6',
  });
};

export { swalErrorMsg, swalFailedMsg, swalSuccessMsg };
