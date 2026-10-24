/* يرفع مرة واحدة بجانب ملفات الاختبار (نفس المجلد). يحفظ أي اختبار يُفتح ليعمل بدون إنترنت */
const C='exam-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(clients.claim()));
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith((async()=>{
    const c=await caches.open(C);
    const hit=await c.match(r,{ignoreSearch:true});
    const net=fetch(r).then(n=>{if(n.ok)c.put(r,n.clone());return n});
    if(!hit)return net;
    return Promise.race([net.catch(()=>hit),new Promise(res=>setTimeout(()=>res(hit),3000))]);
  })());
});
self.addEventListener('message',e=>{
  const u=e.data&&e.data.u;if(!u)return;
  e.waitUntil((async()=>{
    const c=await caches.open(C);
    try{await c.add(u)}catch(_){}
    const ok=await c.match(u,{ignoreSearch:true});
    (await clients.matchAll({includeUncontrolled:true})).forEach(x=>x.postMessage({ok:!!ok}));
  })());
});
