// ==========================================
// CONFIGURATION (SECURE - HEX METHOD)
// ==========================================

const _0xHex = "68747470733a2f2f7363726970742e676f6f676c652e636f6d2f6d6163726f732f732f414b667963627a7655334b4c4b6661693762483039505a6a59584973397937434679456e5956727439537453456f56677045727374327468656d5453764b3569313241453470732f65786563";

const _decodeHex = (hex) => {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
};

const GOOGLE_SCRIPT_URL = _decodeHex(_0xHex);

// ==========================================
// MAIN LOGIC
// ==========================================

async function handleSearch(e) {
    e.preventDefault();
    
    const btn = e.target.querySelector('button[type="submit"]');
    const btnContent = document.getElementById('btnContent');
    const progressLine = document.getElementById('btnProgressLine');
    
    const inputVal = document.getElementById('searchInput').value.trim().toLowerCase();
    const resultCard = document.getElementById('resultCard');
    const notFoundMsg = document.getElementById('notFoundMsg');
    
    // UI Reset
    const originalText = btnContent.innerHTML; 
    btnContent.innerHTML = '<i class="fas fa-spinner fa-spin"></i> খুঁজছে...';
    btn.disabled = true;
    
    progressLine.style.transition = 'none';
    progressLine.style.width = '0%';
    
    setTimeout(() => {
        progressLine.style.transition = 'width 4s cubic-bezier(0.4, 0, 0.2, 1)'; 
        progressLine.style.width = '90%'; 
    }, 50);

    resultCard.classList.add('hidden');
    resultCard.classList.remove('opacity-100', 'translate-y-0');
    notFoundMsg.classList.add('hidden');

    try {
        const searchUrl = `${GOOGLE_SCRIPT_URL}?q=${encodeURIComponent(inputVal)}`;
        const response = await fetch(searchUrl);

        if (!response.ok) throw new Error(`Server Error: ${response.status}`);

        const student = await response.json(); 

        if (!student || student.error) {
            notFoundMsg.classList.remove('hidden');
        } 
        else if (student.email || student.fb) {
            
            // --- MASKING LOGIC ---
            let displayEmail = student.email || "Email Hidden";
            const isEmailSearch = student.email && String(student.email).toLowerCase() === inputVal;

            if (!isEmailSearch && displayEmail.includes('@')) {
                const parts = displayEmail.split('@');
                displayEmail = parts[0].length > 2 
                    ? `${parts[0][0]}•••${parts[0].slice(-1)}@${parts[1]}` 
                    : `•••@${parts[1]}`;
            }

            // Data Population
            document.getElementById('studentName').innerText = student.name || "N/A";
            document.getElementById('studentEmail').innerText = displayEmail;
            document.getElementById('studentId').innerText = "#AWT-" + (student.id || "0000");
            
            // --- Task Calculation Start ---
            const taskCount = parseInt(student.tasks || 0);
            const totalTasks = 14;
            // প্রাথমিক পার্সেন্টেজ হিসাব
            let percentage = Math.min(Math.round((taskCount / totalTasks) * 100), 100);
            
            // Elements
            const statusBadge = document.getElementById('statusBadge');
            const suspMsg = document.getElementById('suspensionMessage');
            const pBar = document.getElementById('progressBar');
            const remainingLabel = document.getElementById('remainingLabel');
            const remainingDaysDisplay = document.getElementById('remainingDays');
            
            const statusValue = String(student.suspended || "").trim().toLowerCase();

            // Defaults
            suspMsg.classList.add('hidden');
            // ডিফল্ট ক্লাস সেট
            remainingDaysDisplay.className = "text-3xl font-bold text-white z-10";

            // --- Status Logic ---
            if (statusValue.includes("suspended") || statusValue === "true") {
                // 1. Suspended
                statusBadge.innerText = "Suspended";
                statusBadge.className = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-red-100 text-red-700";
                
                suspMsg.classList.remove('hidden');
                pBar.className = "bg-red-500 h-3 rounded-full transition-all duration-1000 relative";
                
                remainingLabel.innerText = "অবশিষ্ট দিন";
                remainingDaysDisplay.innerText = Math.max(totalTasks - taskCount, 0);
            } 
            else if (statusValue.includes("completed")) {
                // 2. Completed
                statusBadge.innerText = "Completed";
                statusBadge.className = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-green-100 text-green-700";
                
                remainingLabel.innerText = "মোট কর্মঘন্টা";
                remainingDaysDisplay.innerText = "60+";
                
                pBar.className = "bg-green-500 h-3 rounded-full transition-all duration-1000 relative";
            } 
            else if (taskCount >= 14) {
                // 3. Presentation Pending (14 days done, but not marked completed)
                
                percentage = 99;

                statusBadge.innerText = "Reviewing";
                statusBadge.className = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-yellow-100 text-yellow-700";
                
                remainingLabel.innerText = "বর্তমান অবস্থা"; 
                remainingDaysDisplay.innerText = "প্রেজেন্টেশন বাকি!"; 
                
                // [UPDATED FIX] - টেক্সট মাঝখানে এবং সাইজ ঠিক করার জন্য
                remainingDaysDisplay.className = "font-bold text-white z-10 text-sm md:text-lg text-center leading-tight";
                
                pBar.className = "bg-yellow-500 h-3 rounded-full transition-all duration-1000 relative";
            } 
            else {
                // 4. Active
                statusBadge.innerText = "Active";
                statusBadge.className = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-700";
                
                remainingLabel.innerText = "অবশিষ্ট দিন";
                remainingDaysDisplay.innerText = Math.max(totalTasks - taskCount, 0);
                
                pBar.className = "bg-blue-600 h-3 rounded-full transition-all duration-1000 relative";
            }
            
            // --- Update Progress UI (After Logic) ---
            document.getElementById('completedTasks').innerText = taskCount;
            document.getElementById('progressText').innerText = percentage + "%";
            pBar.style.width = percentage + "%";

            // Image Logic
            const imgContainer = document.getElementById('perfImageContainer');
            const imgTag = document.getElementById('perfImage');
            if (student.image) {
                imgTag.src = student.image;
                imgContainer.classList.remove('hidden');
            } else {
                imgContainer.classList.add('hidden');
            }

            // Show Result
            resultCard.classList.remove('hidden');
            setTimeout(() => resultCard.classList.add('opacity-100', 'translate-y-0'), 10);
            
            setTimeout(() => {
                resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);

        } else {
            notFoundMsg.classList.remove('hidden');
        }

    } catch (error) {
        console.error('Fetch Error:', error);
        alert("সংযোগ সমস্যা! দয়া করে ইন্টারনেট কানেকশন চেক করুন।");
    } finally {
        progressLine.style.transition = 'width 0.5s ease-out';
        progressLine.style.width = '100%';

        setTimeout(() => {
            btnContent.innerHTML = originalText;
            btn.disabled = false;
            progressLine.style.transition = 'none';
            progressLine.style.width = '0%';
        }, 800);
    }
}