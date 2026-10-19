const SUPABASE_URL = 'https://kejqfatcmxxvjuseikhd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlanFmYXRjbXh4dmp1c2Vpa2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzNjExNjksImV4cCI6MjEwNzkzNzE2OX0.uBfqOcLzSC_vdd2xH2U3HHryebZx5Hm6ZhHVcp7EMro';
const myDB = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadDonorsDirectory() {
    const listContainer = document.getElementById('donors-list');
    
    // Database မှ is_donor = true ဖြစ်သော အလှူရှင်စာရင်းများကို သီးသန့်ဆွဲထုတ်မည်
    const { data: donors, error } = await myDB.from('transactions').select('*').eq('is_donor', true).order('created_at', { ascending: false });

    if (error) {
        listContainer.innerHTML = "<p style='text-align:center; color:red;'>အချက်အလက် ဆွဲထုတ်ရာတွင် အမှားရှိနေပါသည်။ Supabase RLS ကို ပိတ်ထားပေးပါ။</p>";
        return;
    }

    let html = '';
    if (donors && donors.length > 0) {
        donors.forEach(d => {
            let pic = d.donor_photo || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
            let name = d.donor_name || 'အမည်မဖော်လိုသူ အလှူရှင်';
            let address = d.donor_address ? `လိပ်စာ - ${d.donor_address}` : '';
            let note = d.note ? `(${d.note})` : '';
            let curr = d.currency || 'MMK';

            html += `
            <div class="donor-card">
                <img src="${pic}" class="donor-avatar" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'">
                <div class="donor-info">
                    <h3>${name}</h3>
                    <p style="margin:0; font-size:13px; color:#6b7280;">${address} ${note}</p>
                    <span style="font-size:11px; color:#9ca3af;">ရက်စွဲ - ${new Date(d.created_at).toLocaleDateString()}</span>
                </div>
                <div class="donor-amount">
                    + ${Number(d.amount).toLocaleString()} ${curr}
                </div>
            </div>`;
        });
    } else {
        html = "<p style='text-align:center; color:#6b7280;'>အလှူရှင် စာရင်း မရှိသေးပါ။</p>";
    }
    listContainer.innerHTML = html;
}

loadDonorsDirectory();
