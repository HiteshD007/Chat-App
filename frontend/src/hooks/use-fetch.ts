import { useAuthStore } from '../store/zustand.store';

interface FetchProps{
  url: string,
  method?: "GET" | "POST" | "DELETE" | "PATCH",
  token?: string,
  data?: any,
}

const useFetch = () => {

  const { accessToken } = useAuthStore();

  async function request({url,method = "GET", token, data}:FetchProps) {
    try {
      const t = accessToken || token;
      const res = await fetch(url,{
        method,
        headers: {
            'content-type': 'application/json',
            authorization : `Bearer ${t}`
        },
        body: method !== "GET" ?  JSON.stringify(data) : undefined
      });
      
      return await res.json();
    } catch (error) {
      console.error(error);
    }
  }
  return { request };
};

export default useFetch;
