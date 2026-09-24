const CACHE='gcal-test-250d5c2d7b6d5b0c';
const BASE=new URL('./',self.location.href);
const FILES=["./","index.html","assets/member-CfmWsUZ_.js","assets/announcement-manager-B8EGzqIz.js","assets/data-by-emoji-0GIA0LCY.js","assets/drafts-CFTX1E_u.js","assets/event-dialog-ZQb0Fbpn.js","assets/heic-decode-Q4ck0edy.js","assets/local-events-BLZsE98n.js","assets/main-BsDCBK_Q.js","assets/push-bfs80FQd.js","assets/rolldown-runtime-Dd_uD5pT.js","assets/event-dialog-BOLS-TE2.css","assets/image-convert-heic.worker-jmpIFXYy.js","assets/image-convert.worker-DBl1V2ZH.js","assets/main-BpE0Ou_B.css","assets/member-DJ_SIHWS.css","b/180.png","b/32.png","b/512.png","b/logo.png"].map(path=>new URL(path,BASE).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('gcal-test-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||!FILES.includes(event.request.url))return;
  event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request).then(cached=>cached||fetch(event.request))));
});
self.addEventListener('push',event=>{
  event.waitUntil((async()=>{
    let data;try{data=event.data?.json();}catch{return;}
    if(!data||!['alarm','event-change','event-response','test','chat','board'].includes(data.kind)||!Number.isFinite(data.expiresMs)||data.expiresMs<=Date.now())return;
    const eventId=typeof data.eventId==='string'&&/^[a-f0-9-]{36}$/.test(data.eventId)?data.eventId:null;
    const roomId=['chat','board'].includes(data.kind)&&typeof data.roomId==='string'&&/^[a-f0-9-]{36}$/.test(data.roomId)?data.roomId:null;
    const postId=roomId&&typeof data.postId==='string'&&/^[a-f0-9-]{36}$/.test(data.postId)?data.postId:null;
    const roomTitle=typeof data.roomTitle==='string'&&data.roomTitle.trim()?data.roomTitle.trim().slice(0,100):data.kind==='chat'?'チャット':'掲示板';
    const postText=typeof data.postText==='string'&&data.postText.trim()?data.postText.trim().slice(0,120):'新しい投稿があります';
    const eventTitle=typeof data.eventTitle==='string'&&data.eventTitle.trim()?data.eventTitle.trim().slice(0,100):'予定';
    const attendance=typeof data.attendance==='string'&&data.attendance.trim()?data.attendance.trim().slice(0,100):'回答待ち';
    const dateText=(typeof data.dateText==='string'&&/^\d{4}\/\d{2}\/\d{2}(?: \d{2}:\d{2})?$/.test(data.dateText))||data.dateText==='日時未指定'?data.dateText:'日時未指定';
    const reason=data.kind==='alarm'?'開催時刻が近づいています':data.kind==='event-response'?'参加表明が変更されました':'内容が変更されました';
    const body=data.kind==='test'?'通知のテストです。':data.kind==='chat'||data.kind==='board'?`「${roomTitle}」：${postText}`:`${attendance}｜${dateText}｜「${eventTitle}」｜${reason}`;
    await self.registration.showNotification("くまたんグループ",{body,icon:new URL('b/180.png',self.registration.scope).href,tag:typeof data.tag==='string'?data.tag:'gcal',renotify:false,data:{eventId,roomId,postId,roomKind:data.kind==='board'?'board':'chat'}});
  })());
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();event.waitUntil((async()=>{
    const url=new URL(self.registration.scope),id=event.notification.data?.eventId;if(typeof id==='string'&&/^[a-f0-9-]{36}$/.test(id))url.hash='alarm='+id;
    const roomId=event.notification.data?.roomId,roomKind=event.notification.data?.roomKind==='board'?'board':'chat',postId=event.notification.data?.postId;if(typeof roomId==='string'&&/^[a-f0-9-]{36}$/.test(roomId))url.hash=roomKind+'='+roomId+(typeof postId==='string'&&/^[a-f0-9-]{36}$/.test(postId)?'&post='+postId:'');
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    const target=windows.find(client=>client.url===url.href)||windows.find(client=>client.url.startsWith(self.registration.scope));
    if(target){
      // A browser can reject navigate() while still allowing the existing tab to focus.
      let navigated=false;
      try{if(target.url!==url.href){await target.navigate(url.href);navigated=true;}}catch{/* Keep the existing app tab. */}
      if(!navigated)target.postMessage?.({kind:'gcal-push-target',eventId:id,roomId,postId,roomKind});
      await target.focus();
    }else await self.clients.openWindow(url.href);
  })());
});
