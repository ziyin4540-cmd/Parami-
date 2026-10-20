const SUPABASE_URL = 'https://kejqfatcmxxvjuseikhd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlanFmYXRjbXh4dmp1c2Vpa2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzNjExNjksImV4cCI6MjEwNzkzNzE2OX0.uBfqOcLzSC_vdd2xH2U3HHryebZx5Hm6ZhHVcp7EMro';
const myDB = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let allDonorsList = [];

// ၁။ အလှူရှင်များ စာရင်းကို Database မှ ဆွဲထုတ်ပေးခြင်း
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
        <div class="donor-card">
            <div class="donor-info">
                <img src="${photo}" class="donor-avatar" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'">
                <div class="donor-details">
                    <h3>${name}</h3>
                    <p style="margin: 2px 0 0 0; font-weight: bold; color: ${isMmk ? '#059669' : '#2563eb'}; font-size: 13px;">${amountStr}</p>
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

// ၃။ ပုံအကြီး ကြည့်နိုင်သည့် Modal Function များ
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

// Modal ပြင်ပနှိပ်ပါက ပိတ်ရန်
window.onclick = function(event) {
    const donorModal = document.getElementById('donor-detail-modal');
    const imageModal = document.getElementById('image-viewer-modal');
    
    if (event.target === donorModal) donorModal.style.display = 'none';
    if (event.target === imageModal) imageModal.style.display = 'none';
};

// စတင်သည်နှင့် အလှူရှင်များ စာရင်းကို ဆွဲထုတ်ရန်
loadPublicDonors();
