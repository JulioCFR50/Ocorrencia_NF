// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDy-tQkx1vxriO56R4uDG0CP_-qnAf27Xg",
  authDomain: "ocorrencia-nf.firebaseapp.com",
  projectId: "ocorrencia-nf",
  storageBucket: "ocorrencia-nf.firebasestorage.app",
  messagingSenderId: "1042870457912",
  appId: "1:1042870457912:web:067f9d68f01b67356ef8cd",
  measurementId: "G-7Q813QZKSM"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const nfForm = document.getElementById('formCadastro');

// Converte valor brasileiro para número
function parseValor(valorStr) {
  return parseFloat(valorStr.replace(/\./g, '').replace(',', '.'));
}

// Salvar NF no Firestore
nfForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const nfData = {
    transportadora: document.getElementById('transportadora').value.trim(),
    numero: document.getElementById('numeroNF').value.trim(),
    valor: parseValor(document.getElementById('valorNF').value.trim()),
    data: document.getElementById('dataNF').value,
    cliente: document.getElementById('cliente').value.trim(),
    uf: document.getElementById('uf').value.trim().toUpperCase(),
    motivo: document.getElementById('motivo').value.trim(),
    acao: document.getElementById('acao').value.trim(),
    nfEntrada: document.getElementById('nfEntrada').value.trim(),
    arm: document.getElementById('arm').value.trim(),
    status: document.getElementById('status').value
  };

  if (!nfData.numero || !nfData.valor || !nfData.data || !nfData.transportadora) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  db.collection('notasFiscais').add(nfData)
    .then(() => {
      alert("Nota Fiscal cadastrada com sucesso!");
      nfForm.reset();
    })
    .catch(err => console.error("Erro ao salvar NF:", err));
});
