export function useConfirm() {
  const confirm = (title, message = '') => {
    return new Promise((resolve) => {
      const confirmText = message ? `${title}\n\n${message}` : title;
      const result = window.confirm(confirmText);
      resolve(result);
    });
  };

  return {
    confirm
  };
}