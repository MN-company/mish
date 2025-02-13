/******************************************************
 * VARIABILI PRINCIPALI
 ******************************************************/
let current = 1;       // da screen-1 a screen-8
const total = 8;       // numero schermate
const answers = {
  q1: null,
  q2: null,
  q3: null,
  correct: {
    q1: 'Piazza Brà',
    q2: 'Concerto di Max Pezzali',
    q3: 'Michele'
  }
};

/******************************************************
 * NAVIGAZIONE TRA SCHERMATE
 ******************************************************/
function showScreen() {
  document.querySelectorAll('.container').forEach(el => el.classList.remove('active'));
  document.getElementById(`screen-${current}`).classList.add('active');
  updateProgress();
}

function next() {
  if (current < total) {
    current++;
    showScreen();
  }
}
function prev() {
  if (current > 1) {
    current--;
    showScreen();
  }
}
function updateProgress() {
  const fill = document.getElementById('progress-fill');
  fill.style.width = ((current - 1) / (total - 1)) * 100 + '%';
}

/******************************************************
 * SALVATAGGIO NOME UTENTE
 ******************************************************/
function saveName() {
  const nameInput = document.getElementById('name');
  const nome = nameInput.value.trim();
  if (nome) {
    const userSpan = document.getElementById('username');
    if (userSpan) userSpan.textContent = nome;
    next();
  } else {
    alert("Per favore, inserisci il tuo nome!");
  }
}

/******************************************************
 * SCELTA RISPOSTE
 ******************************************************/
function selectAnswer(question, answer, button) {
  // deseleziona i precedenti
  document.querySelectorAll(`#screen-${current} .answers button`)
          .forEach(btn => btn.classList.remove('selected'));
  // seleziona il corrente
  button.classList.add('selected');
  answers[question] = answer;
  const nextBtn = document.getElementById(`next${current}`);
  if (nextBtn) nextBtn.disabled = false;
}

function checkAnswers() {
  // Verifica se corrispondono a quelle giuste
  const isCorrect =
    answers.q1 === answers.correct.q1 &&
    answers.q2 === answers.correct.q2 &&
    answers.q3 === answers.correct.q3;

  if (isCorrect) {
    next();
    showHearts();
  } else {
    alert('Risposte errate! Riprova ❤️');
    // Torna alla prima domanda se vuoi
    current = 3;
    showScreen();
  }
}

/******************************************************
 * EFFETTO CUORI CHE CADONO
 ******************************************************/
function showHearts() {
  for (let i = 0; i < 40; i++) {
    const heart = document.createElement('span');
    heart.textContent = '❤️';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animation = `fall ${Math.random() * 3 + 3}s linear infinite`;
    document.querySelector('.hearts').appendChild(heart);
    setTimeout(() => heart.remove(), 6000);
  }
}

/******************************************************
 * LETTERA FINALE: RIVELA PARAGRAFO NASCOSTO
 * E NASCONDE IL PULSANTE DOPO IL CLICK
 ******************************************************/
function reveal() {
  const secret = document.getElementById('secret');
  if (secret) {
    secret.style.display = 'block';
  }
  // Nascondi il pulsante
  const revealBtn = document.getElementById('revealBtn');
  if (revealBtn) {
    revealBtn.style.display = 'none';
  }
}

/******************************************************
 * PULSANTE NO CHE SCAPPA + YES DIVENTA GRANDE PER SEMPRE
 ******************************************************/
function moveNo() {
  const noBtn  = document.getElementById('noBtn');
  const yesBtn = document.getElementById('yesBtn');

  // Sposta NO su tutto lo schermo
  const x = Math.random() * (window.innerWidth - noBtn.offsetWidth);
  const y = Math.random() * (window.innerHeight - noBtn.offsetHeight);

  noBtn.style.position = 'absolute';
  noBtn.style.left = x + 'px';
  noBtn.style.top  = y + 'px';

  // Incrementa in modo permanente la grandezza di YES
  let currentScale = parseFloat(yesBtn.dataset.scale || "1");
  currentScale += 0.1;  // puoi cambiare il valore per ingrandire di più/meno
  yesBtn.dataset.scale = currentScale;
  yesBtn.style.transform = `scale(${currentScale})`;
}


/******************************************************
 * LABIRINTO (CANVAS) + CHECKPOINTS
 ******************************************************/
const canvas = document.getElementById('maze');
const ctx = canvas.getContext('2d');

// Carichiamo l'immagine del labirinto
const labyrinthImg = new Image();
labyrinthImg.src = 'mazehart.gif';  // Assicurati che esista
let hasStarted = false;
let completed = false;

// Due checkpoint (start/fine)
const startCP = { x: 171,  y: 30 };
const endCP   = { x: 171, y: 210 };

labyrinthImg.onload = function() {
  // Disegna immagine
  ctx.drawImage(labyrinthImg, 0, 0, canvas.width, canvas.height);
};

let drawing = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', drawMaze);
canvas.addEventListener('mouseup', stopDraw);
canvas.addEventListener('mouseout', stopDraw);

function startDraw(e) {
  drawing = true;
  const pos = getMousePos(e);
  lastX = pos.x; 
  lastY = pos.y;
}

function drawMaze(e) {
  if (!drawing) return;
  const pos = getMousePos(e);

  ctx.strokeStyle = '#FF477E';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();

  checkComplete(pos);

  lastX = pos.x;
  lastY = pos.y;
}

function stopDraw() {
  drawing = false;
}

function getMousePos(evt) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top)  * scaleY
  };
}

function checkComplete(pos) {
  if (completed) return;
  // Se non ha iniziato, controlla start
  if (!hasStarted) {
    if (isNear(pos, startCP)) {
      hasStarted = true;
      alert("Hai trovato il punto di partenza! Ora trova la soluzione al labirinto");
    }
  } else {
    // Se ha iniziato, controlla la fine
    if (isNear(pos, endCP)) {
      completed = true;
      alert("Labirinto completato!");
      document.getElementById('mazeBtn').style.display = 'inline-block';
      showHearts();
    }
  }
}

function isNear(pos, cp) {
  const tolerance = 15;
  return Math.abs(pos.x - cp.x) < tolerance &&
         Math.abs(pos.y - cp.y) < tolerance;
}

function reveal() {
  // 1) Nascondi il pulsante (se lo desideri)
  const revealBtn = document.getElementById('revealBtn');
  if (revealBtn) revealBtn.style.display = 'none';

  // 2) Seleziona l’elemento dove apparirà il testo
  const secretEl = document.getElementById('secret');
  if (!secretEl) return;

  // 3) Fai apparire l’elemento (se prima era display:none)
  secretEl.style.display = 'block';

  // 4) Testo che vuoi mostrare in stile "macchina da scrivere"
  const text = `Cara Michelle,
“L’amore non guarda con gli occhi, ma con l’anima.” 
Così scriveva Shakespeare nelle sue opere e non c’è nulla di più vero. 
Ciò che ammiro di te è che mi hai saputo guardare amandomi  per ciò che sono, pregi e difetti, non hai mollato alla prima difficoltà e mi sei sempre rimasta a fianco. Con te non mi sono mai sentito più a mio agio e rivivrei ogni momento senza cambiare nulla perché i nostri sbagli ci hanno permesso di arrivare qui.
Ormai la parola casa non significa più quattro mura, ma ha il profumo della tua pelle e il calore delle tue braccia. Quelle stesse braccia in cui non vedo l’ora di rifugiarmi ogni volta che la distanza si fa raggiungibile e finalmente posso abbracciarti.
E se l’amore è pazienza, promessa, attesa e desiderio… allora con te ho trovato il più vero che potessi immaginare.
Sei il mio oggi e il mio domani, il mio posto sicuro e il mio viaggio più bello. E non importa quanto tempo dovrò aspettare tra un abbraccio e l’altro: ogni secondo senza di te non farà che rendere ancora più prezioso il momento in cui potrò perdermi di nuovo nei tuoi occhi.

Il tuo Google :)  Ti amo 💖`;

  // 5) Svuota il contenuto e definisci la velocità (ms)
  secretEl.textContent = "";
  let i = 0;
  const speed = 50; // Millisecondi tra una lettera e l’altra

  // 6) Scrivi il testo carattere per carattere
  const timer = setInterval(() => {
    if (i < text.length) {
      secretEl.textContent += text.charAt(i);
      i++;
    } else {
      clearInterval(timer);
    }
  }, speed);
}

  

/******************************************************
 * Avvio: Mostra screen-1
 ******************************************************/
showScreen();
