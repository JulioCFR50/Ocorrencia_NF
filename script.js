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

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const nfForm = document.getElementById('nfForm');
const btnAbrir = document.getElementById('btnAbrirCadastro');
const btnFechar = document.getElementById('btnFecharCadastro');
const formCadastro = document.getElementById('formCadastro');
let editId = null;

// Abrir tela de cadastro
btnAbrir.addEventListener('click', () => {
  formCadastro.style.display = 'block';
});

// Fechar tela de cadastro
btnFechar.addEventListener('click', () => {
  formCadastro.style.display = 'none';
  nfForm.reset();
  editId = null;
});

// Converter valor brasileiro para float
function parseValor(valorStr) {
  return parseFloat(valorStr.replace(/\./g, '').replace(',', '.'));
}

// Salvar ou atualizar NF
nfForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const numero = document.getElementById('nfNumero').value.trim();
  const valorInput = document.getElementById('nfValor').value.trim();
  const data = document.getElementById('nfData').value;
  const ocorrencia = document.getElementById('nfOcorrencia').value.trim();

  if (!numero || !valorInput || !data) return alert("Preencha os campos obrigatórios.");

  const valor = parseValor(valorInput);
  if (isNaN(valor)) return alert("Informe um valor válido.");

  const nfData = { numero, valor, data, ocorrencia };

  if (editId) {
    db.collection('notasFiscais').doc(editId).update(nfData)
      .then(() => editId = null)
      .catch(err => console.error(err));
  } else {
    db.collection('notasFiscais').add(nfData)
      .catch(err => console.error(err));
  }

  nfForm.reset();
  formCadastro.style.display = 'none';
});

// Carregar NFs em tempo real
db.collection('notasFiscais').onSnapshot(snapshot => {
  const tbody = document.querySelector('#tabelaNF tbody');
  tbody.innerHTML = '';
  snapshot.forEach(doc => {
    const data = doc.data();
    const valorFormatado = data.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    tbody.innerHTML += `
      <tr>
        <td>${data.numero}</td>
        <td>${valorFormatado}</td>
        <td>${formatDataBR(data.data)}</td>
        <td>${data.ocorrencia || ''}</td>
        <td><button onclick="editarNF('${doc.id}')">Editar</button></td>
      </tr>
    `;
  });
});

function formatDataBR(dataStr) {
  const partes = dataStr.split('-'); // "YYYY-MM-DD"
  if(partes.length !== 3) return dataStr; // caso inválido
  return `${partes[2]}/${partes[1]}/${partes[0]}`; // "DD/MM/YYYY"
}


// Editar NF
function editarNF(id) {
  db.collection('notasFiscais').doc(id).get()
    .then(doc => {
      if (!doc.exists) return alert("Registro não encontrado.");
      const data = doc.data();
      document.getElementById('nfNumero').value = data.numero;
      document.getElementById('nfValor').value = data.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
      document.getElementById('nfData').value = data.data;
      document.getElementById('nfOcorrencia').value = data.ocorrencia || '';
      formCadastro.style.display = 'block';
      editId = id;
    })
    .catch(err => console.error(err));
}
