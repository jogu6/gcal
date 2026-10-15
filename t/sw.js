const CACHE='gcal-test-ab4b143b6a1cb2e5';
const VERSION='ab4b143b6a1cb2e5';
const BASE=new URL('./',self.location.href);
const FILES=["./","index.html","auth.html","assets/auth-CsqDxbDB.js","assets/member-Byj0N3WM.js","assets/announcement-manager-D9ZzK-xJ.js","assets/auth-desktop-CnbZEVJC.js","assets/base-C7dEdZzs.js","assets/data-by-emoji-0GIA0LCY.js","assets/encode-Bmhhf_vd.js","assets/event-dialog-Cb7zExXB.js","assets/first-login-BSE3s2i2.js","assets/heic-decode-BNw_g6ss.js","assets/layout-nMHTZ8_w.js","assets/local-events-CKWCR88K.js","assets/main-CtuDLsLW.js","assets/push-BDwE9U4Z.js","assets/shared-input-history-hPQrf32u.js","assets/webp_enc-CoLu8DuH.js","assets/webp_enc_simd-p-n-r6dT.js","assets/auth-BCuc3CiQ.css","assets/auth-desktop-C86aNcEp.css","assets/base-Div2XjJd.css","assets/event-dialog-vTQl-K22.css","assets/first-login-CO3vfOqx.css","assets/image-convert-heic.worker-2ZUNuuRt.js","assets/image-convert.worker-CC4AqGbp.js","assets/layout-Bnqkn3iN.css","assets/main-DDYapwdr.css","assets/member-CSpfFJJN.css","assets/push-BMGjW-Xd.css","b/180.png","b/32.png","b/512.png","b/logo.png"].map(path=>new URL(path,BASE).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(url=>new Request(url,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('gcal-test-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.kind==='gcal-version')event.ports[0]?.postMessage({version:VERSION});});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||!FILES.includes(event.request.url))return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{
      if(response.ok){const copy=response.clone();void caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
      return response;
    }).catch(()=>caches.match(event.request)));
    return;
  }
  event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request).then(cached=>cached||fetch(event.request))));
});
const validRoomId=id=>typeof id==='string'&&(/^[a-f0-9-]{36}$/.test(id)||/^system:members:(?:all|game:(?:G[2-9A-HJKMNP-Z]{8}|[a-f0-9-]{36}):(?:playing|unplayed))$/.test(id));
self.addEventListener('push',event=>{
  event.waitUntil((async()=>{
    let data;try{data=event.data?.json();}catch{return;}
    if(!data||!['alarm','event-created','event-emergency','event-change','event-response','test','chat','board','announcement'].includes(data.kind)||!Number.isFinite(data.expiresMs)||data.expiresMs<=Date.now())return;
    const eventId=typeof data.eventId==='string'&&/^[a-f0-9-]{36}$/.test(data.eventId)?data.eventId:null;
    const roomId=['chat','board'].includes(data.kind)&&validRoomId(data.roomId)?data.roomId:null;
    const postId=roomId&&typeof data.postId==='string'&&/^[a-f0-9-]{36}$/.test(data.postId)?data.postId:null;
    const roomTitle=typeof data.roomTitle==='string'&&data.roomTitle.trim()?data.roomTitle.trim().slice(0,100):data.kind==='chat'?'チャット':'掲示板';
    const postText=typeof data.postText==='string'&&data.postText.trim()?data.postText.trim().slice(0,120):'新しい投稿があります';
    const authorName=typeof data.authorName==='string'&&data.authorName.trim()?data.authorName.trim().slice(0,100):'発言者不明';
    const eventTitle=typeof data.eventTitle==='string'&&data.eventTitle.trim()?data.eventTitle.trim().slice(0,100):'予定';
    const attendance=typeof data.attendance==='string'&&data.attendance.trim()?data.attendance.trim().slice(0,100):'回答待ち';
    const dateText=(typeof data.dateText==='string'&&/^\d{4}\/\d{2}\/\d{2}(?: \d{2}:\d{2})?$/.test(data.dateText))||data.dateText==='日時未指定'?data.dateText:'日時未指定';
    const reason=data.kind==='alarm'?'開催時刻が近づいています':data.kind==='event-response'?'参加表明が変更されました':data.kind==='event-created'?'新しいイベントが登録されました':data.kind==='event-emergency'?'緊急イベント発生！ご参加をお待ちしています。':'内容が変更されました';
    const announcementId=data.kind==='announcement'&&typeof data.announcementId==='string'&&/^[a-f0-9-]{36}$/.test(data.announcementId)?data.announcementId:null;
    if(data.kind==='announcement'&&!announcementId)return;
    const announcementTitle=typeof data.announcementTitle==='string'&&data.announcementTitle.trim()?data.announcementTitle.trim().slice(0,100):'新しいお知らせ';
    const occurredMs=Number.isSafeInteger(data.occurredMs)&&data.occurredMs>=0?data.occurredMs:Date.now();
    const body=data.kind==='announcement'?`お知らせ：「${announcementTitle}」`:data.kind==='test'?'通知のテストです。':data.kind==='chat'?`${authorName}\n${postText}\n「${roomTitle}」`:data.kind==='board'?`「${roomTitle}」：${postText}`:data.kind==='event-emergency'?`${reason}｜${dateText}｜「${eventTitle}」｜${attendance}`:`${attendance}｜${dateText}｜「${eventTitle}」｜${reason}`;
    await self.registration.showNotification("くまたんグループ",{body,icon:new URL('b/180.png',self.registration.scope).href,tag:typeof data.tag==='string'?data.tag:'gcal',renotify:data.kind==='test',timestamp:occurredMs,data:{eventId,roomId,postId,roomKind:data.kind==='board'?'board':'chat',announcementId,occurredMs}});
  })());
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();event.waitUntil((async()=>{
    const url=new URL(self.registration.scope),id=event.notification.data?.eventId;if(typeof id==='string'&&/^[a-f0-9-]{36}$/.test(id))url.hash='alarm='+id;
    if(typeof event.notification.data?.announcementId==='string'&&/^[a-f0-9-]{36}$/.test(event.notification.data.announcementId))url.searchParams.set('view','announcements');
    const roomId=event.notification.data?.roomId,roomKind=event.notification.data?.roomKind==='board'?'board':'chat',postId=event.notification.data?.postId;if(validRoomId(roomId))url.hash=roomKind+'='+roomId+(typeof postId==='string'&&/^[a-f0-9-]{36}$/.test(postId)?'&post='+postId:'');
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    const scope=new URL(self.registration.scope);
    const appWindows=windows.filter(client=>{try{const address=new URL(client.url);return address.origin===scope.origin&&(address.pathname===scope.pathname||address.pathname===scope.pathname+'index.html');}catch{return false;}});
    // WindowClient has no display-mode property. Ask open app pages only when a choice is needed.
    const standalone=appWindows.length>1&&typeof MessageChannel==='function'?await Promise.all(appWindows.map(client=>new Promise(resolve=>{
      const channel=new MessageChannel();let done=false;
      const finish=value=>{if(done)return;done=true;clearTimeout(timer);channel.port1.close();resolve(value);};
      const timer=setTimeout(()=>finish(false),200);
      channel.port1.onmessage=reply=>finish(reply.data?.kind==='gcal-client-kind-result'&&reply.data.standalone===true);
      try{client.postMessage({kind:'gcal-client-kind-query'},[channel.port2]);}catch{finish(false);}
    }))):[];
    const pwaIndex=standalone.findIndex(Boolean);
    const preferred=pwaIndex<0?appWindows:appWindows.filter((_,index)=>standalone[index]);
    const target=preferred.find(client=>client.url===url.href)||preferred.find(client=>client.focused)||preferred.find(client=>client.visibilityState==='visible')||preferred[0];
    const message={kind:'gcal-push-target',eventId:id,roomId,postId,roomKind,announcementId:event.notification.data?.announcementId};
    const routeInPage=client=>typeof MessageChannel!=='function'?Promise.resolve(false):new Promise(resolve=>{
      const channel=new MessageChannel();let done=false;
      const finish=value=>{if(done)return;done=true;clearTimeout(timer);channel.port1.close();resolve(value);};
      const timer=setTimeout(()=>finish(false),300);
      channel.port1.onmessage=reply=>finish(reply.data?.kind==='gcal-push-target-accepted');
      try{client.postMessage(message,[channel.port2]);}catch{finish(false);}
    });
    if(target){
      // A running application can route without discarding its authenticated
      // session and fetched data. Older/unready pages fall back to navigation.
      if(await routeInPage(target)){await target.focus();return;}
      // Keep the existing app even if a browser cannot navigate its window client.
      let destination=target;
      try{if(target.url!==url.href){const navigated=await target.navigate(url.href);if(navigated&&typeof navigated.focus==='function')destination=navigated;}}catch{/* Use the in-page route below. */}
      if(destination===target)target.postMessage?.({kind:'gcal-push-target',eventId:id,roomId,postId,roomKind,announcementId:event.notification.data?.announcementId});
      await destination.focus();
    }else{
      const opened=await self.clients.openWindow(url.href);
      // Some installed web apps launch at their root even when openWindow receives a deep link.
      if(opened&&opened.url!==url.href){try{const navigated=await opened.navigate(url.href);if(!navigated)opened.postMessage?.({kind:'gcal-push-target',eventId:id,roomId,postId,roomKind,announcementId:event.notification.data?.announcementId});}catch{opened.postMessage?.({kind:'gcal-push-target',eventId:id,roomId,postId,roomKind,announcementId:event.notification.data?.announcementId});}}
    }
  })());
});
