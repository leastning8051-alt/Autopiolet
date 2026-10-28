export const BASE=(import.meta.env.VITE_API_BASE_URL||'http://localhost:10000').replace(/\/$/,'');
export async function api(route,options={}){const res=await fetch(`${BASE}/api${route}`,{credentials:'include',headers:{'Content-Type':'application/json'},...options});const body=await res.json().catch(()=>({}));if(!res.ok)throw Error(body.error||`HTTP ${res.status}`);return body;}
export const post=(route,body={})=>api(route,{method:'POST',body:JSON.stringify(body)});
