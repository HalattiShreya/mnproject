console.log("CampusCare Loaded - Shreya Version");

function showView(viewId) {
  console.log("Showing:", viewId);
  // Hide all main sections
  document.querySelectorAll('main > section, main > div, .view').forEach(el => {
    el.style.display = 'none';
    el.classList.remove('active');
  });
  // Also hide by ID pattern
  const allViews = ['studentView', 'trackView', 'adminView'];
  allViews.forEach(id => {
    const v = document.getElementById(id);
    if(v) v.style.display = 'none';
  });

  // Show selected
  const target = document.getElementById(viewId);
  if(target) {
    target.style.display = 'block';
    target.classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  showView('studentView');

  // YOUR HTML USES data-view - THIS IS THE FIX!
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      showView(view);
      if(view === 'trackView') loadTrack();
      if(view === 'adminView') loadAdmin();
      
      // Update active class
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Form submit
  const form = document.getElementById('complaintForm') || document.querySelector('form');
  if(form){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const payload = {
        studentName: document.getElementById('fullName')?.value || document.getElementById('studentName')?.value || "Shreya",
        usn: document.getElementById('studentId')?.value || document.getElementById('usn')?.value || "2VS24CS081",
        department: document.getElementById('department')?.value || "CSE",
        complaintType: document.getElementById('category')?.value || document.getElementById('complaintType')?.value || "General",
        title: document.getElementById('title')?.value || "Complaint",
        description: document.getElementById('description')?.value || document.getElementById('complaint')?.value || document.querySelector('textarea')?.value
      };
      console.log("Submitting:", payload);
      try{
        const res = await fetch('http://localhost:5000/api/complaints',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if(data.success){
          alert("✅ Complaint Saved! USN: "+payload.usn);
          form.reset();
          showView('trackView');
          loadTrack();
        }
      }catch(err){ alert("Error - Backend running?"); console.error(err); }
    });
  }
});

async function loadTrack(){
  const view = document.getElementById('trackView');
  if(!view) return;
  let list = document.getElementById('trackList');
  if(!list){
    list = document.createElement('div');
    list.id='trackList';
    list.style.padding='20px';
    view.appendChild(list);
  }
  list.innerHTML = '<p>Loading from MongoDB...</p>';
  try{
    const res = await fetch('http://localhost:5000/api/complaints');
    const complaints = await res.json();
    if(complaints.length===0){
      list.innerHTML = '<p>No complaints yet. Submit one!</p>';
    } else {
      list.innerHTML = complaints.reverse().map(c=>`
        <div style="background:white; border:1px solid #ddd; padding:15px; margin:12px 0; border-radius:10px; box-shadow:0 2px 5px rgba(0,0,0,0.1)">
          <b>${c.studentName}</b> (${c.usn})<br>
          <small style="color:#666">${c.department} | ${c.complaintType} | ${new Date(c.createdAt).toLocaleString()}</small>
          <p style="margin:8px 0"><b>${c.title}</b><br>${c.description}</p>
          <span style="background:${c.status==='Pending'?'#ff9800':'#4caf50'};color:white;padding:4px 12px;border-radius:20px;font-size:12px">${c.status}</span>
        </div>
      `).join('');
    }
  }catch(e){
    list.innerHTML = "<p style='color:red'>Backend not running! Check terminal - node server.js</p>";
  }
}

async function loadAdmin(){
  const view = document.getElementById('adminView');
  if(!view) return;
  let list = document.getElementById('adminList');
  if(!list){
    list = document.createElement('div');
    list.id='adminList';
    list.style.padding='20px';
    view.appendChild(list);
  }
  const res = await fetch('http://localhost:5000/api/complaints');
  const complaints = await res.json();
  list.innerHTML = complaints.map(c=>`
    <div style="background:#f9f9f9; border:1px solid #ddd; padding:12px; margin:8px 0; display:flex; justify-content:space-between; align-items:center">
      <div><b>${c.studentName}</b> - ${c.description}<br><small>${c.status}</small></div>
      <div>
        <button onclick="updateStatus('${c._id}','Solved')" style="background:green;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;margin-right:5px">Solved</button>
        <button onclick="deleteComp('${c._id}')" style="background:red;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer">Delete</button>
      </div>
    </div>
  `).join('');
}

async function updateStatus(id,status){
  await fetch(`http://localhost:5000/api/complaints/${id}`,{
    method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})
  });
  loadTrack(); loadAdmin();
}
async function deleteComp(id){
  if(!confirm("Delete?")) return;
  await fetch(`http://localhost:5000/api/complaints/${id}`,{method:'DELETE'});
  loadTrack(); loadAdmin();
}