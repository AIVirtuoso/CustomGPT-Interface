export const token_key = "jwt_token";
require('dotenv').config();


const getFullUrl = (url: string) => { return ("http://localhost:7000/" + url); }


export const setToken = (token: string): void => {
  localStorage.setItem(token_key, token);
}

export const getToken = () => localStorage.getItem(token_key);

// export const clearToken = () => localStorage.clear(token_key)

export const getAuthorized = () => {
  // const token = getToken();
  // if (token !== null && token !== undefined) return true;
  // return false;
  return true;
};

export function sendRequestsWithToken(url: string, config: any) {
  const token = getToken();
  return fetch(getFullUrl(url), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    ...config,
  })
}


export function sendRequestsWithToken_as_JSON(url: string, config: any){
  const token = getToken();
  // console.log(url);
  return fetch(getFullUrl(url), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...config,
  })
}