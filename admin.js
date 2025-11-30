// Admin frontend logic
const tokenKey = 'proxysign_token';
function setToken(t){ localStorage.setItem(tokenKey, t); }
function getToken(){ return localStorage.getItem(tokenKey); }
function api(path, method='GET', body=null){
  const headers = {'Content-Type':'application/json'};
  const token = getToken();
  if(token) headers['Authorization'] = 'Bearer ' + token;
  return fetch(API_BASE + path, { method, headers, body: body ? JSON.stringify(body) : null })
    .then(async r => ({ ok: r.ok, status: r.status, body: await r.json().catch(()=> ({})) }));
}

// login redirect guard
(async function init(){
  const token = getToken();
  if(!token){
    // not logged in, redirect to login
    if(location.pathname.endsWith('/admin.html')) window.location.href = '/index.html';
  } else {
    // show user email if available
    document.getElementById('userEmail').innerText = '';
    await refreshAll();
  }
})();

// navigation
document.querySelectorAll('.sidebar nav button').forEach(b=>{
  b.addEventListener('click', ()=> {
    document.querySelectorAll('.sidebar nav button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    const sec = b.dataset.section;
    document.querySelectorAll('.section').forEach(s=>s.classList.add('hidden'));
    document.getElementById(sec).classList.remove('hidden');
    document.getElementById('pageTitle').innerText = b.innerText;
  });
});

// login on index.html
if(document.getElementById('loginBtn')){
  document.getElementById('loginBtn').addEventListener('click', async ()=>{
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    if(!email||!password) return alert('Provide credentials');
    const res = await fetch(API_BASE + '/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
    const j = await res.json();
    if(res.ok && j.token){
      setToken(j.token);
      window.location.href = '/admin.html';
    } else {
      document.getElementById('status').innerText = j.error || 'Login failed';
    }
  });
}

// logout
document.getElementById('logoutBtn')?.addEventListener('click', ()=>{
  localStorage.removeItem(tokenKey);
  window.location.href = '/index.html';
});

// teachers
document.getElementById('addTeacher')?.addEventListener('click', async ()=>{
  const name = document.getElementById('tName').value.trim();
  const email = document.getElementById('tEmail').value.trim();
  if(!name||!email) return alert('Provide details');
  const r = await api('/api/teachers','POST',{ name, email });
  if(r.ok){ document.getElementById('tName').value=''; document.getElementById('tEmail').value=''; await refreshTeachers(); }
  else alert(r.body.error || 'Error');
});

async function refreshTeachers(){
  const r = await api('/api/teachers');
  if(r.ok){ const list = document.getElementById('teacherList'); list.innerHTML=''; r.body.forEach(t=>{ const li=document.createElement('li'); li.innerText = t.name + ' — ' + t.email; list.appendChild(li); }); }
}

// lectures
document.getElementById('createLecture')?.addEventListener('click', ()=>{
  const title = document.getElementById('lTitle').value.trim();
  if(!title) return alert('Provide title');
  if(!navigator.geolocation) return alert('Geolocation required');
  navigator.geolocation.getCurrentPosition(async pos=>{
    const body = { title, lat: pos.coords.latitude, lon: pos.coords.longitude };
    const r = await api('/api/lectures','POST', body);
    if(r.ok){ document.getElementById('lTitle').value=''; await refreshLectures(); alert('Lecture created'); }
    else alert(r.body.error || 'Error');
  }, ()=> alert('Allow location'));
});

async function refreshLectures(){
  const r = await api('/api/lectures');
  if(r.ok){
    const grid = document.getElementById('lectureGrid'); grid.innerHTML='';
    const listFull = document.getElementById('lectureListFull'); listFull.innerHTML='';
    r.body.forEach(l=>{
      const card = document.createElement('div'); card.className='lecture';
      card.innerHTML = '<h5>' + l.title + '</h5><small>ID: ' + l._id + ' • ' + new Date(l.createdAt).toLocaleString() + '</small>';
      const canvas = document.createElement('canvas'); canvas.style.marginTop='8px';
      card.appendChild(canvas);
      grid.appendChild(card);
      QRCode.toCanvas(canvas, JSON.stringify({ lectureId: l._id }), { width:140 }, ()=>{});
      const li = document.createElement('li'); li.innerText = l.title + ' — ' + l._id + ' — ' + new Date(l.createdAt).toLocaleString(); listFull.appendChild(li);
    });
    updateAnalytics();
  }
}

// attendance submit (admin)
document.getElementById('submitAttendance')?.addEventListener('click', ()=>{
  const raw = document.getElementById('qrInput').value.trim();
  const name = document.getElementById('studentName').value.trim() || 'Student';
  if(!raw) return alert('Paste QR payload');
  let payload; try{ payload = JSON.parse(raw); } catch(e){ return alert('Invalid QR payload'); }
  if(!navigator.geolocation) return alert('Geolocation required');
  navigator.geolocation.getCurrentPosition(async pos=>{
    const body = { name, lectureId: payload.lectureId, lat: pos.coords.latitude, lon: pos.coords.longitude, time: new Date().toISOString() };
    const r = await fetch(API_BASE + '/api/attendance', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    const j = await r.json();
    if(r.ok) { document.getElementById('scanResult').innerText = 'Attendance recorded'; await refreshAttendance(); } else { document.getElementById('scanResult').innerText = j.error || 'Error'; }
  }, ()=> alert('Allow location'));
});

// camera scanning (admin page) - optional using jsQR if added
let videoStream=null, scanInterval=null;
document.getElementById('startCam')?.addEventListener('click', async ()=>{
  const video = document.getElementById('video'); const canvas=document.getElementById('capture'); const ctx=canvas.getContext('2d');
  try{ videoStream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'environment' } }); video.srcObject = videoStream; await video.play(); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    scanInterval = setInterval(()=>{ if(video.readyState !== video.HAVE_ENOUGH_DATA) return; ctx.drawImage(video,0,0,canvas.width,canvas.height); const imageData = ctx.getImageData(0,0,canvas.width,canvas.height); const code = window.jsQR ? jsQR(imageData.data,imageData.width,imageData.height) : null; if(code){ document.getElementById('qrInput').value = code.data; document.getElementById('scanResult').innerText='QR detected'; } }, 500);
  }catch(e){ alert('Camera access error'); }
});
document.getElementById('stopCam')?.addEventListener('click', ()=>{ if(scanInterval) clearInterval(scanInterval); scanInterval=null; if(videoStream){ videoStream.getTracks().forEach(t=>t.stop()); videoStream=null; } document.getElementById('video').srcObject=null; });

// attendance list
async function refreshAttendance(){
  const r = await api('/api/attendance');
  if(r.ok){ const ul=document.getElementById('attendanceList'); ul.innerHTML=''; r.body.forEach(a=>{ const li=document.createElement('li'); li.innerText = (a.name || '') + ' • ' + (a.lectureId || '') + ' • ' + new Date(a.time).toLocaleString(); ul.appendChild(li); }); updateAnalytics(); }
}

function updateAnalytics(){
  document.getElementById('countTeachers').innerText = document.getElementById('teacherList') ? document.getElementById('teacherList').children.length : 0;
  document.getElementById('countLectures').innerText = document.getElementById('lectureGrid') ? document.getElementById('lectureGrid').children.length : 0;
  document.getElementById('countAttendance').innerText = document.getElementById('attendanceList') ? document.getElementById('attendanceList').children.length : 0;
}

async function refreshAll(){
  await refreshTeachers(); await refreshLectures(); await refreshAttendance();
}
