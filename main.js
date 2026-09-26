// ClaimX Platform — Production JavaScript Engine

// State Management
const appState = {
  currentStep: 1,
  maxStepReached: 1,
  deceased: {
    fullName: "Eleanor Margaret Vance",
    dob: "1954-04-12",
    ssn: "987-65-4321",
    state: "FL",
    verified: false,
    edrsRecord: "FL-2024-884912"
  },
  policies: [
    {
      id: "ml-term",
      carrier: "MetLife",
      name: "Individual Term Life Policy",
      policyNumber: "ML-904-88219",
      amount: 250000,
      issueDate: "2017-05-14",
      status: "Active & Non-Contestable",
      selected: true
    },
    {
      id: "pru-group",
      carrier: "Prudential",
      name: "Prudential Group Employer Plan",
      policyNumber: "PRU-EMP-33104",
      amount: 50000,
      issueDate: "2019-11-01",
      status: "Active Coverage",
      selected: true
    }
  ],
  ocrComplete: false,
  ocrScore: 98,
  selectedPayoutOption: "instant-advance", // 'standard' or 'instant-advance'
  claimId: "CX-" + Math.floor(1000 + Math.random() * 9000) + "-US",
  timelineEvents: []
};

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  initLucideIcons();
  setupEventListeners();
  updateStepperUI();
  setupMobileMenu();
});

// Refresh Lucide Icons helper
function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Mobile menu button
  const mobileBtn = document.getElementById("mobile-menu-btn");
  if (mobileBtn) {
    mobileBtn.addEventListener("click", () => {
      const panel = document.getElementById("mobile-nav-panel");
      panel.classList.toggle("hidden");
    });
  }
}

// Mobile Nav Helper
window.closeMobileNav = function() {
  const panel = document.getElementById("mobile-nav-panel");
  if (panel) panel.classList.add("hidden");
};

function setupMobileMenu() {
  // Smooth scroll links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
}

// Scroll to Wizard
window.scrollToWizard = function() {
  const el = document.getElementById("claims-wizard-section");
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// Toggle SSN Mask
window.toggleSSNMask = function() {
  const ssnInput = document.getElementById("deceased-ssn");
  const maskText = document.getElementById("ssn-mask-text");
  if (ssnInput.type === "password") {
    ssnInput.type = "text";
    maskText.textContent = "Hide";
  } else {
    ssnInput.type = "password";
    maskText.textContent = "Show";
  }
};

// Stepper Navigation
window.switchStep = function(targetStep) {
  // Allow switching to any step already reached or 1 step ahead if verified
  if (targetStep > appState.maxStepReached + 1 && targetStep > 1) {
    showToast("Please complete the current verification step first.", "info");
    return;
  }

  // Update State
  appState.currentStep = targetStep;
  if (targetStep > appState.maxStepReached) {
    appState.maxStepReached = targetStep;
  }

  // Hide all step sections
  for (let i = 1; i <= 5; i++) {
    const stepEl = document.getElementById(`wizard-step-${i}`);
    if (stepEl) {
      if (i === targetStep) {
        stepEl.classList.remove("hidden");
      } else {
        stepEl.classList.add("hidden");
      }
    }
  }

  updateStepperUI();
  initLucideIcons();
  
  // Smooth scroll to top of wizard on mobile
  if (window.innerWidth < 768) {
    const wizardTop = document.getElementById("claims-wizard-section");
    if (wizardTop) wizardTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// Update Stepper Top Indicator
function updateStepperUI() {
  for (let i = 1; i <= 4; i++) {
    const badge = document.getElementById(`step-badge-${i}`);
    const nav = document.getElementById(`step-nav-${i}`);
    if (!badge || !nav) continue;

    if (i < appState.currentStep) {
      // Completed step
      badge.className = "w-9 h-9 rounded-xl bg-emerald-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20";
      badge.innerHTML = `<i data-lucide="check" class="w-5 h-5 stroke-[3]"></i>`;
      nav.classList.remove("opacity-50");
    } else if (i === appState.currentStep) {
      // Current active step
      badge.className = "w-9 h-9 rounded-xl bg-teal-500 text-slate-950 font-bold text-sm flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/30 scale-105";
      badge.textContent = `${i}`;
      nav.classList.remove("opacity-50");
    } else {
      // Inactive step
      badge.className = "w-9 h-9 rounded-xl bg-slate-800 text-slate-400 font-bold text-sm flex items-center justify-center shrink-0 border border-slate-700";
      badge.textContent = `${i}`;
      if (i > appState.maxStepReached) {
        nav.classList.add("opacity-50");
      } else {
        nav.classList.remove("opacity-50");
      }
    }
  }
  initLucideIcons();
}

// STEP 1: TRIGGER INSTANT DEATH VERIFICATION VIA EDRS
window.triggerStep1Verification = function() {
  const btn = document.getElementById("btn-verify-edrs");
  const spinner = document.getElementById("btn-verify-spinner");
  const icon = document.getElementById("btn-verify-icon");
  const label = document.getElementById("btn-verify-label");
  const resultBox = document.getElementById("step-1-result");

  // Loading state
  btn.disabled = true;
  spinner.classList.remove("hidden");
  icon.classList.add("hidden");
  label.textContent = "Connecting to Florida Vital Statistics Registry...";

  // Simulated State EDRS Query Delay
  setTimeout(() => {
    label.textContent = "Validating Social Security DMF & NCHS Registry...";
  }, 900);

  setTimeout(() => {
    btn.disabled = false;
    spinner.classList.add("hidden");
    icon.classList.remove("hidden");
    label.textContent = "Re-Verify Registry";

    // Show verified result state box
    resultBox.classList.remove("hidden");
    appState.deceased.verified = true;
    appState.maxStepReached = Math.max(appState.maxStepReached, 2);

    initLucideIcons();

    // Add event to tracker
    addTrackerEvent("EDRS Handshake Complete: Death record FL-2024-884912 verified with Dept of Health.", "200_OK");

    showToast("State Death Registration Verified", "success");
  }, 1800);
};

// STEP 2: TRIGGER AUTOMATED POLICY DISCOVERY SCAN
window.triggerPolicyScan = function() {
  const btn = document.getElementById("btn-scan-policies");
  const label = document.getElementById("scan-btn-label");
  const progressContainer = document.getElementById("scan-progress-container");
  const progressBar = document.getElementById("scan-progress-bar");
  const progressText = document.getElementById("scan-progress-text");
  const progressPercent = document.getElementById("scan-percent");
  const resultContainer = document.getElementById("policies-result-container");

  btn.disabled = true;
  progressContainer.classList.remove("hidden");

  let progress = 0;
  const stages = [
    { at: 20, text: "Scanning MetLife, Prudential, and Northwestern registries..." },
    { at: 50, text: "Cross-referencing MIB Group and NAIC active coverage records..." },
    { at: 80, text: "Checking GE Healthcare and Fortune 500 employer trusts..." },
    { at: 100, text: "2 Active verified policies matched to Eleanor Vance!" }
  ];

  const interval = setInterval(() => {
    progress += 5;
    if (progress > 100) progress = 100;
    
    progressBar.style.width = `${progress}%`;
    progressPercent.textContent = `${progress}%`;

    const currentStage = stages.find(s => progress <= s.at) || stages[stages.length - 1];
    progressText.textContent = currentStage.text;

    if (progress >= 100) {
      clearInterval(interval);
      btn.disabled = false;
      label.textContent = "Re-Scan Clearinghouse";
      appState.maxStepReached = Math.max(appState.maxStepReached, 3);
      showToast("Found 2 Active Policies totaling $300,000", "success");
      addTrackerEvent("Clearinghouse Discovery: 2 active policies ($300k total) identified for beneficiary David Vance.", "MATCH_CONFIRMED");
    }
  }, 70);
};

// STEP 3: DRAG & DROP AND OCR PIPELINE
window.handleDragOver = function(e) {
  e.preventDefault();
  const dz = document.getElementById("document-dropzone");
  dz.classList.add("dropzone-active");
};

window.handleDragLeave = function(e) {
  e.preventDefault();
  const dz = document.getElementById("document-dropzone");
  dz.classList.remove("dropzone-active");
};

window.handleDrop = function(e) {
  e.preventDefault();
  const dz = document.getElementById("document-dropzone");
  dz.classList.remove("dropzone-active");

  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    const file = e.dataTransfer.files[0];
    showUploadedFile(file.name, (file.size / (1024 * 1024)).toFixed(1) + " MB");
    startAiOcrSimulation();
  }
};

window.handleFileSelected = function(e) {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    showUploadedFile(file.name, (file.size / (1024 * 1024)).toFixed(1) + " MB");
    startAiOcrSimulation();
  }
};

window.loadSampleDeathCertificate = function() {
  showUploadedFile("FL_Certified_Death_Certificate_Vance_E_2024.pdf", "2.1 MB");
  startAiOcrSimulation();
};

function showUploadedFile(name, size) {
  const pill = document.getElementById("uploaded-file-pill");
  const filename = document.getElementById("uploaded-filename");
  pill.classList.remove("hidden");
  filename.textContent = `${name} (${size})`;
  initLucideIcons();
}

window.startAiOcrSimulation = function() {
  const btn = document.getElementById("btn-run-ocr");
  if (btn) btn.disabled = true;

  // Step 1: Extract holographic seal
  const bar1 = document.getElementById("ocr-bar-1");
  const val1 = document.getElementById("ocr-val-1");
  const dot1 = document.getElementById("ocr-dot-1");

  val1.textContent = "Processing...";
  val1.className = "font-mono text-teal-400";
  dot1.className = "w-2 h-2 rounded-full bg-teal-400 animate-ping mr-2";
  bar1.style.width = "40%";

  setTimeout(() => {
    bar1.style.width = "100%";
    val1.textContent = "100% Extracted";
    val1.className = "font-mono text-emerald-400 font-bold";
    dot1.className = "w-2 h-2 rounded-full bg-emerald-400 mr-2";

    // Step 2: Contestability Check
    const bar2 = document.getElementById("ocr-bar-2");
    const val2 = document.getElementById("ocr-val-2");
    const dot2 = document.getElementById("ocr-dot-2");

    val2.textContent = "Analyzing Issue Dates...";
    val2.className = "font-mono text-teal-400";
    dot2.className = "w-2 h-2 rounded-full bg-teal-400 animate-ping mr-2";
    bar2.style.width = "50%";

    setTimeout(() => {
      bar2.style.width = "100%";
      val2.textContent = "Passed (>2 Yrs Cleared)";
      val2.className = "font-mono text-emerald-400 font-bold";
      dot2.className = "w-2 h-2 rounded-full bg-emerald-400 mr-2";

      // Step 3: Auto-filling Carrier Form #804-A
      const bar3 = document.getElementById("ocr-bar-3");
      const val3 = document.getElementById("ocr-val-3");
      const dot3 = document.getElementById("ocr-dot-3");

      val3.textContent = "Generating NAIC Packet...";
      val3.className = "font-mono text-teal-400";
      dot3.className = "w-2 h-2 rounded-full bg-teal-400 animate-ping mr-2";
      bar3.style.width = "60%";

      setTimeout(() => {
        bar3.style.width = "100%";
        val3.textContent = "Form #804-A Ready";
        val3.className = "font-mono text-emerald-400 font-bold";
        dot3.className = "w-2 h-2 rounded-full bg-emerald-400 mr-2";

        // Show result badge
        const resultBadge = document.getElementById("ocr-result-badge");
        resultBadge.classList.remove("hidden");

        appState.ocrComplete = true;
        appState.maxStepReached = Math.max(appState.maxStepReached, 4);
        if (btn) btn.disabled = false;

        initLucideIcons();

        showToast("AI Pre-Approval Score: 98% (Ready for Settlement)", "success");
        addTrackerEvent("OCR & Forensic Analysis: Hologram authenticated. Pre-approval score: 98%. Form #804-A auto-filled.", "SCORE_98");
      }, 700);

    }, 700);

  }, 600);
};

// STEP 4: LIQUIDITY & PAYOUT SELECTION
window.handlePayoutOptionChange = function(option) {
  appState.selectedPayoutOption = option;
  const advanceField = document.getElementById("advance-destination-field");
  if (advanceField) {
    if (option === "instant-advance") {
      advanceField.style.display = "block";
    } else {
      advanceField.style.display = "none";
    }
  }
};

window.executePayoutOrder = function() {
  const btn = document.getElementById("btn-execute-payout");
  const spinner = document.getElementById("payout-spinner");
  const icon = document.getElementById("payout-icon");
  const btnText = document.getElementById("payout-btn-text");

  btn.disabled = true;
  spinner.classList.remove("hidden");
  icon.classList.add("hidden");
  btnText.textContent = "Dispatching FedNow / RTP Wire Settlement...";

  setTimeout(() => {
    btnText.textContent = "Issuing Digital Settlement Certificate...";
  }, 1100);

  setTimeout(() => {
    btn.disabled = false;
    spinner.classList.add("hidden");
    icon.classList.remove("hidden");
    btnText.textContent = "Execute Payout Order";

    // Set new claim ID
    const newClaimId = "CX-" + Math.floor(1000 + Math.random() * 9000) + "-FL";
    appState.claimId = newClaimId;
    
    const receiptClaimIdEl = document.getElementById("receipt-claim-id");
    if (receiptClaimIdEl) {
      receiptClaimIdEl.textContent = newClaimId;
    }

    // Switch to confirmation step 5
    switchStep(5);

    // Update Live Tracker with new claim and events
    const trackerInput = document.getElementById("tracker-search-input");
    if (trackerInput) {
      trackerInput.value = newClaimId;
    }

    addTrackerEvent(`RTP Liquidity Order Confirmed: Advance dispatched for Claim ${newClaimId}.`, "RTP_DISPATCHED");
    showToast("Payout order executed successfully", "success");

  }, 2200);
};

// View In Tracker from Receipt
window.viewInTracker = function() {
  const section = document.getElementById("track-claim-section");
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// 1-CLICK QUICK DEMO FILL FOR EVALUATORS
window.quickDemoFill = function() {
  // Step 1: Pre-populate
  document.getElementById("deceased-name").value = "Eleanor Margaret Vance";
  document.getElementById("deceased-dob").value = "1954-04-12";
  document.getElementById("deceased-ssn").value = "987-65-4321";
  document.getElementById("deceased-state").value = "FL";

  triggerStep1Verification();
  showToast("Sample data loaded: Eleanor M. Vance ($300k benefit)", "info");
};

window.quickDemoFillAndScroll = function() {
  quickDemoFill();
  scrollToWizard();
};

window.resetWizard = function() {
  appState.currentStep = 1;
  appState.maxStepReached = 1;
  appState.ocrComplete = false;

  document.getElementById("step-1-result").classList.add("hidden");
  document.getElementById("scan-progress-container").classList.add("hidden");
  document.getElementById("uploaded-file-pill").classList.add("hidden");
  document.getElementById("ocr-result-badge").classList.add("hidden");

  // Reset OCR progress bars
  for (let i = 1; i <= 3; i++) {
    const bar = document.getElementById(`ocr-bar-${i}`);
    const val = document.getElementById(`ocr-val-${i}`);
    if (bar) bar.style.width = "0%";
    if (val) {
      val.textContent = "Waiting";
      val.className = "font-mono text-slate-400";
    }
  }

  switchStep(1);
  showToast("Wizard reset to Step 1", "info");
};

// TRACKER LOOKUP
window.handleLookupClaim = function() {
  const input = document.getElementById("tracker-search-input");
  const claimId = input ? input.value.trim() : "";

  if (!claimId) {
    showToast("Please enter a valid Claim ID", "info");
    return;
  }

  showToast(`Looking up Claim ${claimId}...`, "info");
  
  setTimeout(() => {
    addTrackerEvent(`Claim ${claimId} records synchronized with Carrier FedNow ledger.`, "SYNC_OK");
    showToast(`Claim ${claimId} records updated live`, "success");
  }, 600);
};

function addTrackerEvent(message, code) {
  const container = document.getElementById("activity-log-container");
  if (!container) return;

  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];

  const logItem = document.createElement("div");
  logItem.className = "flex items-start justify-between text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 animate-in fade-in";
  logItem.innerHTML = `
    <div class="flex items-center space-x-2">
      <span class="text-teal-400 font-bold">[${timeStr}]</span>
      <span>${message}</span>
    </div>
    <span class="text-emerald-400 text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded font-mono">${code}</span>
  `;

  container.prepend(logItem);
}

// POLICY FINDER FILTERING
window.filterCarriers = function() {
  const carrierFilter = document.getElementById("carrier-select").value.toLowerCase();
  const typeFilter = document.getElementById("coverage-type-select").value.toLowerCase();
  const query = document.getElementById("search-input-carrier").value.toLowerCase().trim();

  const cards = document.querySelectorAll(".carrier-card");
  cards.forEach(card => {
    const cardCarrier = card.getAttribute("data-carrier");
    const cardType = card.getAttribute("data-type");
    const textContent = card.textContent.toLowerCase();

    const matchesCarrier = carrierFilter === "all" || cardCarrier === carrierFilter;
    const matchesType = typeFilter === "all" || cardType === typeFilter;
    const matchesQuery = !query || textContent.includes(query);

    if (matchesCarrier && matchesType && matchesQuery) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
};

window.openPolicyFinderModal = function() {
  const el = document.getElementById("policy-finder");
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// FAQ ACCORDIONS
window.toggleAccordion = function(faqId) {
  const content = document.getElementById(faqId);
  const icon = document.getElementById(`faq-icon-${faqId}`);

  if (content.classList.contains("hidden")) {
    content.classList.remove("hidden");
    if (icon) icon.style.transform = "rotate(180deg)";
  } else {
    content.classList.add("hidden");
    if (icon) icon.style.transform = "rotate(0deg)";
  }
};

// EXECUTOR CHECKLIST MODAL
window.downloadChecklistModal = function() {
  showToast("📥 First 7 Days Bereavement Checklist downloaded (PDF)", "success");
};

// BEREAVEMENT CONCIERGE CHATBOT
window.toggleConciergeModal = function() {
  const modal = document.getElementById("concierge-modal");
  modal.classList.toggle("hidden");
  initLucideIcons();
};

window.openConciergeModal = function() {
  const modal = document.getElementById("concierge-modal");
  modal.classList.remove("hidden");
  initLucideIcons();
};

window.askConcierge = function(question) {
  const input = document.getElementById("concierge-input");
  input.value = question;
  sendConciergeMessage();
};

window.sendConciergeMessage = function() {
  const input = document.getElementById("concierge-input");
  const text = input.value.trim();
  if (!text) return;

  const stream = document.getElementById("concierge-chat-stream");

  // User Bubble
  const userBubble = document.createElement("div");
  userBubble.className = "p-3 bg-teal-600 text-white rounded-xl text-right ml-8 shadow-xs";
  userBubble.textContent = text;
  stream.appendChild(userBubble);
  input.value = "";
  stream.scrollTop = stream.scrollHeight;

  // Bot Typing Simulation
  setTimeout(() => {
    let reply = "Our condolences. Our licensed bereavement specialists are available 24/7 at 1-800-CLAIM-EX to assist with this specific matter.";

    const lower = text.toLowerCase();
    if (lower.includes("death cert") || lower.includes("without a physical")) {
      reply = "Yes! Through ClaimX's direct State EDRS integration, you do NOT have to wait for physical paper death certificates. We verify the legal record electronically via the Department of Health Vital Registry.";
    } else if (lower.includes("funeral home") || lower.includes("10,000") || lower.includes("advance")) {
      reply = "The instant funeral advance option can disburse $10,000 either directly to your debit card within 2 hours or wired directly to the funeral home of your choice.";
    } else if (lower.includes("tax") || lower.includes("taxable")) {
      reply = "Generally, under Internal Revenue Code Section 101(a), lump-sum life insurance death benefits are completely 100% exempt from federal and state income tax.";
    }

    const botBubble = document.createElement("div");
    botBubble.className = "p-3 bg-white rounded-xl border border-slate-200 shadow-xs mr-8";
    botBubble.innerHTML = `<p class="font-medium text-slate-800">${reply}</p>`;
    stream.appendChild(botBubble);
    stream.scrollTop = stream.scrollHeight;
  }, 600);
};

// Empathetic Toast Notification System
function showToast(message, type = "info") {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "fixed top-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  let bgClass = "bg-slate-900 text-white border-slate-700";
  if (type === "success") bgClass = "bg-emerald-950 text-emerald-100 border-emerald-700";
  if (type === "error") bgClass = "bg-rose-950 text-rose-100 border-rose-700";

  toast.className = `px-4 py-3 rounded-xl border shadow-xl text-xs font-semibold flex items-center space-x-2 pointer-events-auto transform transition-all duration-300 translate-y-2 opacity-0 ${bgClass}`;
  toast.innerHTML = `<span>${message}</span>`;

  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  });

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
