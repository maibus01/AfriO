export const setSession = (token: string, user: any) => {
  localStorage.setItem("token", token);
  localStorage.setItem("userInfo", JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userInfo");

  // hard reset to kill stale React state everywhere
  window.location.href = "/auth";
};

export const getToken = () => localStorage.getItem("token");

export const getUser = () => {
  const user = localStorage.getItem("userInfo");
  return user ? JSON.parse(user) : null;
};