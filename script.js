// --- SISTEMA NATIVO DE NAVEGAÇÃO DE SLIDES ---
let currentSlide = 1;
const totalSlides = 9;
let isAnimating = false;

document.addEventListener("DOMContentLoaded", () => {
  createDots();
  updateSlide(1, 'next');

  // Controle total por teclado (Seta Direita / Seta Esquerda / Espaço)
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "Space") nextSlide();
    if (e.key === "ArrowLeft") prevSlide();
  });
});

function updateSlide(targetIndex, direction = 'next') {
  if (isAnimating || (targetIndex === currentSlide && targetIndex !== 1)) return;
  
  const currentSlideEl = document.querySelector(".slide.active");
  const nextSlideEl = document.getElementById(`slide-${targetIndex}`);

  if (!nextSlideEl) return;

  isAnimating = true;

  // Atualizar Barra Superior de Progresso
  const progressPercent = (targetIndex / totalSlides) * 100;
  document.getElementById("progress-bar").style.width = `${progressPercent}%`;
  document.getElementById("slide-number-top").innerText = `0${targetIndex} / 0${totalSlides}`;

  // Atualizar Dots
  document.querySelectorAll(".dot").forEach((dot, idx) => {
    dot.classList.toggle("active", idx + 1 === targetIndex);
  });

  if (currentSlideEl && currentSlideEl !== nextSlideEl) {
    if (direction === 'next') {
      currentSlideEl.classList.add("exit-left");
      nextSlideEl.classList.remove("enter-left");
    } else {
      currentSlideEl.classList.remove("exit-left");
      nextSlideEl.classList.add("enter-left");
    }

    currentSlideEl.classList.remove("active");

    setTimeout(() => {
      currentSlideEl.classList.remove("exit-left");
      nextSlideEl.classList.add("active");
      nextSlideEl.classList.remove("enter-left");
      isAnimating = false;
    }, 450);

  } else {
    nextSlideEl.classList.add("active");
    isAnimating = false;
  }

  currentSlide = targetIndex;
}

function nextSlide() {
  if (currentSlide < totalSlides) {
    updateSlide(currentSlide + 1, 'next');
  }
}

function prevSlide() {
  if (currentSlide > 1) {
    updateSlide(currentSlide - 1, 'prev');
  }
}

function goToSlide(index) {
  const direction = index > currentSlide ? 'next' : 'prev';
  updateSlide(index, direction);
}

function createDots() {
  const container = document.getElementById("dots-container");
  container.innerHTML = "";
  for (let i = 1; i <= totalSlides; i++) {
    const dot = document.createElement("div");
    dot.className = `dot ${i === 1 ? "active" : ""}`;
    dot.onclick = () => goToSlide(i);
    container.appendChild(dot);
  }
}

// --- DEMONSTRAÇÃO INTERATIVA DO WMS NOZAMA (SLIDE 8) ---

const logisticsSteps = [
  { id: 1, title: "1. OMS & Antifraude", desc: "Aprovação do pagamento no gateway e reserva imediata do item 1P no WMS Nozama." },
  { id: 2, title: "2. WMS - Onda de Picking", desc: "Agrupamento inteligente de pedidos por proximidade de corredor no armazém." },
  { id: 3, title: "3. Coleta (Picking RF)", desc: "Bipagem por radiofrequência no endereço de Armazenamento Caótico." },
  { id: 4, title: "4. Packing & Balança", desc: "Conferência volumétrica e validação de peso por sensores na esteira." },
  { id: 5, title: "5. Faturamento (NF-e)", desc: "Emissão da Nota Fiscal Eletrônica e colagem de etiqueta com código QR." },
  { id: 6, title: "6. Staging & Sorting", desc: "Triagem automatizada do pacote para a Doca da transportadora correta." },
  { id: 7, title: "7. Transferência Linehaul", desc: "Emissão de MDF-e e embarque em carreta pesada para o Hub regional." },
  { id: 8, title: "8. Last Mile & POD", desc: "Entrega final ao cliente e assinatura do Comprovante Digital (POD)." }
];

let activeOrder = null;

document.getElementById("purchase-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const custName = document.getElementById("cust-name").value;
  const custCity = document.getElementById("cust-city").value;

  activeOrder = {
    id: `NOZ-${Math.floor(10000 + Math.random() * 90000)}`,
    customer: custName,
    city: custCity,
    step: 1
  };

  document.getElementById("no-order-placeholder").classList.add("hidden");
  document.getElementById("active-logistics-box").classList.remove("hidden");
  document.getElementById("client-feedback").classList.remove("hidden");

  document.getElementById("display-order-id").innerText = activeOrder.id;
  document.getElementById("display-cust-name").innerText = activeOrder.customer;
  document.getElementById("display-cust-city").innerText = activeOrder.city;

  renderStepper();
  updateStepView();

  const terminal = document.getElementById("demo-log-terminal");
  terminal.innerHTML = "";
  addLog(`[OMS NOZAMA]: Pedido ${activeOrder.id} aprovado para ${activeOrder.customer}. Estoque reservado.`);
});

function renderStepper() {
  const container = document.getElementById("stepper-list");
  container.innerHTML = "";

  logisticsSteps.forEach(s => {
    const item = document.createElement("div");
    let stateClass = "";
    if (s.id < activeOrder.step) stateClass = "completed";
    if (s.id === activeOrder.step) stateClass = "active";

    item.className = `step-item ${stateClass}`;
    item.innerText = s.id;
    container.appendChild(item);
  });
}

function updateStepView() {
  const currentObj = logisticsSteps.find(s => s.id === activeOrder.step);
  const btn = document.getElementById("advance-step-btn");

  document.getElementById("current-step-badge").innerText = `Etapa ${activeOrder.step}/8`;
  document.getElementById("current-step-title").innerText = currentObj.title;
  document.getElementById("current-step-desc").innerText = currentObj.desc;

  if (activeOrder.step === 8) {
    btn.innerText = "✓ Pedido Concluído e Entregue";
    btn.disabled = true;
    btn.style.background = "var(--success)";
  } else {
    btn.innerText = `Avançar para: ${logisticsSteps[activeOrder.step].title.split('.')[1]} →`;
    btn.disabled = false;
    btn.style.background = "var(--primary)";
  }

  renderStepper();
}

function advanceStep() {
  if (activeOrder && activeOrder.step < 8) {
    activeOrder.step++;
    updateStepView();

    const time = new Date().toLocaleTimeString();
    const currentObj = logisticsSteps.find(s => s.id === activeOrder.step);
    addLog(`[${time}] [WMS-NOZAMA-STEP-${activeOrder.step}]: ${currentObj.title} concluído.`);
  }
}

function addLog(text) {
  const terminal = document.getElementById("demo-log-terminal");
  const line = document.createElement("div");
  line.className = "log-line";
  line.innerText = text;
  terminal.prepend(line);
}