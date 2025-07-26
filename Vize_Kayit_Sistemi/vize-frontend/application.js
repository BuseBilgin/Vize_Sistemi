document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("applicationsList")) loadApplications();
});

// ✅ Form Gönderme
document.getElementById("applicationForm")?.addEventListener("submit", async function(e){
  e.preventDefault();
  const token = localStorage.getItem("token");
  if(!token){ alert("Giriş yapmalısınız."); return; }
  const form=e.target;
  const updateId=document.getElementById("updateId")?.value;
  const method=updateId?"PUT":"POST";
  const endpoint=updateId?`https://vize-sistemi.onrender.com/applications/${updateId}`:"https://vize-sistemi.onrender.com/applications";
  const formData=new FormData(form);
  try{
    const res=await fetch(endpoint,{method,headers:{"Authorization":`Bearer ${token}`},body:formData});
    if(res.ok){ alert(updateId?"Başvuru güncellendi.":"Başvuru eklendi."); form.reset(); loadApplications(); }
    else alert("Hata: "+await res.text());
  }catch(err){ alert("Sunucu hatası."); }
});

// ✅ Başvuruları Yükle
function loadApplications(){
  const token=localStorage.getItem("token");
  if(!token)return;
  fetch("https://vize-sistemi.onrender.com/applications",{headers:{"Authorization":`Bearer ${token}`}})
    .then(r=>r.json()).then(data=>renderCards(data))
    .catch(()=>document.getElementById("applicationsList").innerHTML="<p>Veri alınamadı.</p>");
}

// ✅ Kart Görünümünde Render
function renderCards(data){
  const container=document.getElementById("applicationsList");
  container.innerHTML="";
  if(!data.length){ container.innerHTML="<p>Henüz başvuru yok.</p>"; return; }
  data.forEach(app=>{
    const card=document.createElement("div");
    card.className="card";
    card.innerHTML=`
      <p><strong>Ad:</strong> ${app.ad}</p>
      <p><strong>Soyad:</strong> ${app.soyad}</p>
      <p><strong>Email:</strong> ${app.email}</p>
      <p><strong>Telefon:</strong> ${app.telefon}</p>
      <p><strong>Vize Tipi:</strong> ${app.vize_tipi}</p>
      <p><strong>Giriş Türü:</strong> ${app.vize_giris}</p>
      <div class="actions">
        <button class="edit-btn" onclick="fillFormForUpdate('${app.id}')">✏ Düzenle</button>
        <button class="delete-btn" onclick="deleteApplication('${app.id}')">🗑 Sil</button>
      </div>`;
    container.appendChild(card);
  });
}

// ✅ Silme
async function deleteApplication(id){
  const token=localStorage.getItem("token");
  if(!confirm("Silmek istediğinize emin misiniz?"))return;
  const res=await fetch(`https://vize-sistemi.onrender.com/applications/${id}`,{method:"DELETE",headers:{"Authorization":`Bearer ${token}`}});
  if(res.ok){ alert("Başvuru silindi."); loadApplications(); }
  else alert("Silme hatası.");
}
