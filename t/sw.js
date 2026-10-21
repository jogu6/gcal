// Retire the old cached application. This worker serves only the static entry.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 await self.clients.claim();
 const entry=new URL('./',self.location.href).href;
 for(const client of await self.clients.matchAll({type:'window'})){
  if(client.url.startsWith(entry))void client.navigate(entry).catch(()=>{});
 }
})()));
self.addEventListener('fetch',event=>{
 if(event.request.mode==='navigate'&&event.request.method==='GET'){
  event.respondWith(fetch(new Request(new URL('./index.html',self.location.href),{cache:'no-store'})));
 }
});
