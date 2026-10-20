const SUPABASE_URL = 'https://kejqfatcmxxvjuseikhd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlanFmYXRjbXh4dmp1c2Vpa2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzNjExNjksImV4cCI6MjEwNzkzNzE2OX0.uBfqOcLzSC_vdd2xH2U3HHryebZx5Hm6ZhHVcp7EMro';
const myDB = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let allApprovedMembers = [];
let allDonorsList = [];

// Link 404 Error မတက်စေရန် https:// အလိုအလျောက် တပ်ဆင်ပေးသည့် Helper
function formatUrl(urlStr) {
    if (!urlStr) return '#';
    let trimmed = urlStr.trim();
    if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        return 'https://' + trimmed;
    }
    return trimmed;
}

// Telegram/Social Handle (@username) သို့မဟုတ် Link စာသား ထုတ်ယူပေးသည့် Helper
function getDisplayHandle(urlStr) {
    if (!urlStr) return '';
    let clean = urlStr.trim();
    if (clean.includes('t.me/')) {
        let parts = clean.split('t.me/');
        let handle = parts[1] ? parts[1].replace('/', '') : '';
        if (handle) return '@' + handle;
    }
    return clean.replace(/^https?:\/\//, '');
}

// ၁။ အလှူရှင်များ စာရင်းကို Database မှ ဆွဲထုတ်၍ Member List ပုံစံ ပြသခြင်း
async function loadPublicDonors() {
    const container = document.getElementById('public-donors-grid');
    if (!container) return;

    const { data: donors, error } = await myDB
        .from('transactions')
        .select('*')
        .eq('is_donor', true)
        .order('created_at', { ascending: false });

    if (error || !donors) {
        container.innerHTML = `<p style="color: red; text-align: center;">အလှူရှင်စာရင်း ဆွဲထုတ်၍ မရပါခင်ဗျာ။</p>`;
        return;
    }

    allDonorsList = donors;

    if (donors.length === 0) {
        container.innerHTML = `<p style="color: #6b7280; text-align: center;">အလှူရှင် စာရင်း မရှိသေးပါခင်ဗျာ။</p>`;
        return;
    }

    let html = '';
    donors.forEach(d => {
        let photo = d.donor_photo || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        let name = d.donor_name || 'အမည်မဖော်လိုသော အလှူရှင်';
        let isMmk = d.currency === 'MMK';
        let amountStr = `+ ${Number(d.amount).toLocaleString()} ${d.currency || 'MMK'}`;

        html += `
        <div class="member-card">
            <div class="member-info">
                <img src="${photo}" class="member-avatar" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'">
                <div class="member-details">
                    <h3>${name}</h3>
                    <p style="font-weight: bold; color: ${isMmk ? '#059669' : '#2563eb'}; font-size: 13px;">${amountStr}</p>
                </div>
            </div>
            <button onclick="openDonorModal('${d.id}')" class="btn-detail">
                အသေးစိတ်
            </button>
        </div>`;
    });

    container.innerHTML = html;
}

// ၂။ အလှူရှင် အသေးစိတ် ကြည့်သည့် Modal ဖွင့်ခြင်း
function openDonorModal(donorId) {
    const donor = allDonorsList.find(d => d.id === donorId);
    if (!donor) return;

    let photo = donor.donor_photo || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
    let name = donor.donor_name || 'အမည်မဖော်လိုသော အလှူရှင်';
    let amountStr = `+ ${Number(donor.amount).toLocaleString()} ${donor.currency || 'MMK'}`;
    let dateStr = donor.created_at ? new Date(donor.created_at).toLocaleDateString('en-GB') : 'မရှိပါ';

    document.getElementById('modal-donor-photo').src = photo;
    document.getElementById('modal-donor-name').innerText = name;
    document.getElementById('modal-donor-amount').innerText = amountStr;
    document.getElementById('modal-donor-address').innerText = donor.donor_address || 'မရှိပါ';
    document.getElementById('modal-donor-note').innerText = donor.note || 'မရှိပါ';
    document.getElementById('modal-donor-date').innerText = dateStr;

    const modal = document.getElementById('donor-detail-modal');
    if (modal) modal.style.display = 'flex';
}

function closeDonorModal() {
    const modal = document.getElementById('donor-detail-modal');
    if (modal) modal.style.display = 'none';
}

// ၃။ အတည်ပြုပြီးသော အဖွဲ့ဝင်များ စာရင်းကို Database မှ ဆွဲထုတ်ခြင်း
async function loadPublicMembers() {
    const container = document.getElementById('public-members-grid');
    if (!container) return;

    const { data: members, error } = await myDB
        .from('members')
        .select('*')
        .eq('status', 'approved');

    if (error || !members) {
        container.innerHTML = `<p style="color: red; text-align: center;">အဖွဲ့ဝင်စာရင်း ဆွဲထုတ်၍ မရပါခင်ဗျာ။</p>`;
        return;
    }

    allApprovedMembers = members;

    if (members.length === 0) {
        container.innerHTML = `<p style="color: #6b7280; text-align: center;">အဖွဲ့ဝင် စာရင်း မရှိသေးပါခင်ဗျာ။</p>`;
        return;
    }

    let html = '';
    members.forEach(m => {
        let photo = m.profile_url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        let name = m.name || m.username || 'အမည်မရှိ အဖွဲ့ဝင်';
        let role = m.role || 'အဖွဲ့ဝင်';

        html += `
        <div class="member-card">
            <div class="member-info">
                <img src="${photo}" class="member-avatar" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'">
                <div class="member-details">
                    <h3>${name}</h3>
                    <p>( ${role} )</p>
                </div>
            </div>
            <button onclick="openMemberModalByUsername('${m.username}')" class="btn-detail">
                အသေးစိတ်
            </button>
        </div>`;
    });

    container.innerHTML = html;
}

// ၄။ အဖွဲ့ဝင် အသေးစိတ် ကြည့်သည့် Modal ဖွင့်ခြင်း
function openMemberModalByUsername(username) {
    const member = allApprovedMembers.find(m => m.username === username);
    if (!member) return;

    document.getElementById('modal-member-name').innerText = member.name || member.username;
    document.getElementById('modal-member-role').innerText = `( ${member.role || 'အဖွဲ့ဝင်'} )`;
    
    const modalPhoto = document.getElementById('modal-member-photo');
    if (modalPhoto) {
        modalPhoto.src = member.profile_url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
    }

    let linksArray = [];
    if (member.social_links) {
        try {
            linksArray = typeof member.social_links === 'string' ? JSON.parse(member.social_links) : member.social_links;
        } catch (e) { console.error(e); }
    }

    let linksHtml = '';
    let ssHtml = '';

    if (Array.isArray(linksArray) && linksArray.length > 0) {
        linksArray.forEach(item => {
            let pName = item.platform || 'Social Link';
            let pLink = formatUrl(item.link);
            let displayHandle = getDisplayHandle(item.link);
            let ssUrl = item.ss;

            linksHtml += `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-link" style="color: #059669;"></i>
                        <span style="font-weight: bold; font-size: 14px; color: #374151;">${pName}</span>
                    </div>
                    <span style="font-size: 13px; color: #059669; font-weight: bold; margin-left: 22px; word-break: break-all;">
                        ${displayHandle || pLink}
                    </span>
                </div>
                <a href="${pLink}" target="_blank" style="background: #059669; color: white; padding: 6px 14px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: bold; white-space: nowrap;">
                    သွားမည်
                </a>
            </div>`;

            if (ssUrl) {
                ssHtml += `
                <div style="text-align: center;">
                    <p style="font-size: 11px; color: #4b5563; margin-bottom: 4px; font-weight: bold;">${pName} SS</p>
                    <img src="${ssUrl}" onclick="openImageViewer('${ssUrl}')" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #d1d5db; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                </div>`;
            }
        });
    }

    if (!linksHtml) linksHtml = `<p style="font-size: 13px; color: #6b7280; text-align: center; margin: 10px 0;">ဆက်သွယ်ရန် လင့်ခ် မရှိသေးပါခင်ဗျာ</p>`;
    if (!ssHtml) ssHtml = `<p style="font-size: 13px; color: #6b7280; text-align: center; margin: 10px 0; grid-column: 1 / -1;">အတည်ပြုချက် မှတ်တမ်း (SS) မရှိသေးပါခင်ဗျာ</p>`;

    document.getElementById('modal-social-links-list').innerHTML = linksHtml;
    document.getElementById('modal-ss-grid').innerHTML = ssHtml;

    const modal = document.getElementById('member-detail-modal');
    if (modal) modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('member-detail-modal');
    if (modal) modal.style.display = 'none';
}

// ၅။ SS နှင့် ပရိုဖိုင် ပုံများကို ပုံအကြီး ကြည့်နိုင်သည့် Function များ
function openImageViewer(url) {
    if (!url || url.includes('flaticon.com')) return;
    const viewer = document.getElementById('image-viewer-modal');
    const img = document.getElementById('full-image-preview');
    if (viewer && img) {
        img.src = url;
        viewer.style.display = 'flex';
    }
}

function closeImageViewer() {
    const viewer = document.getElementById('image-viewer-modal');
    if (viewer) {
        viewer.style.display = 'none';
    }
}

// Modal မိုဒယ်များ ပြင်ပနှိပ်ပါက ပိတ်ရန်
window.onclick = function(event) {
    const memberModal = document.getElementById('member-detail-modal');
    const imageModal = document.getElementById('image-viewer-modal');
    const donorModal = document.getElementById('donor-detail-modal');
    
    if (event.target === memberModal) memberModal.style.display = 'none';
    if (event.target === imageModal) imageModal.style.display = 'none';
    if (event.target === donorModal) donorModal.style.display = 'none';
};

// စတင်သည်နှင့် အချက်အလက်များ ဆွဲထုတ်ရန်
loadPublicDonors();
loadPublicMembers();
