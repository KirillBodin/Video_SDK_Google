let hasShownTokenExpiredToast = false;

export const authorizedFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (res.status === 401 && !hasShownTokenExpiredToast) {
    hasShownTokenExpiredToast = true;
    import("react-toastify").then(({ toast }) => {
      toast.error("Your session has expired. Please log in again.");
    });

    setTimeout(() => {
      window.location.href = `${window.location.origin}/unauthorized`;
    }, 3000);
  }

  return res;
};
