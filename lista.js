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

const nfPesquisa = document.getElementById('nfPesquisa');
const clientePesquisa = document.getElementById('clientePesquisa');

// Filtro por NF e Cliente
function filtrarTabela() {
  const nfFiltro = nfPesquisa.value.trim().toLowerCase();
  const clienteFiltro = clientePesquisa.value.trim().toLowerCase();
  const linhas = document.querySelectorAll('#tabelaNF tbody tr');

  linhas.forEach(linha => {
    const numero = linha.children[1].textContent.toLowerCase();
    const cliente = linha.children[4].textContent.toLowerCase();
    linha.style.display = (numero.includes(nfFiltro) && cliente.includes(clienteFiltro)) ? '' : 'none';
  });
}

nfPesquisa.addEventListener('input', filtrarTabela);
clientePesquisa.addEventListener('input', filtrarTabela);

// Formatar data
function formatDataBR(dataStr) {
  if (!dataStr) return "";
  const partes = dataStr.split('-');
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Renderizar tabela
function renderTabela() {
  db.collection('notasFiscais').orderBy('data', 'desc').onSnapshot(snapshot => {
    const tbody = document.querySelector('#tabelaNF tbody');
    tbody.innerHTML = '';

    snapshot.forEach(doc => {
      const d = doc.data();
      const id = doc.id;
      const valorFormatado = d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${d.transportadora || ''}</td>
        <td>${d.numero || ''}</td>
        <td>${valorFormatado}</td>
        <td>${formatDataBR(d.data)}</td>
        <td>${d.cliente || ''}</td>
        <td>${d.uf || ''}</td>
        <td>${d.motivo || ''}</td>
        <td>${d.acao || ''}</td>
        <td>${d.nfEntrada || ''}</td>
        <td>${d.arm || ''}</td>
        <td>${d.status || ''}</td>
        <td>
          <button class="edit-btn" data-id="${id}">Editar</button>
          <button class="cancel-btn" data-id="${id}">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    addEventListeners();
    filtrarTabela(); // aplica filtro automaticamente após renderizar
  });
}

// Adicionar eventos aos botões
function addEventListeners() {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => editarNF(btn.dataset.id));
  });

  document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => excluirNF(btn.dataset.id));
  });
}

// Editar NF
function editarNF(id) {
  const tr = document.querySelector(`button[data-id="${id}"]`).closest('tr');
  const tds = tr.querySelectorAll('td');

  const valores = Array.from(tds).map(td => td.textContent);

  tr.innerHTML = `
    <td><input value="${valores[0]}"></td>
    <td><input value="${valores[1]}"></td>
    <td><input value="${valores[2].replace('.', '').replace(',', '.')}"></td>
    <td><input type="date" value="${formatDataInput(valores[3])}"></td>
    <td><input value="${valores[4]}"></td>
    <td><input value="${valores[5]}"></td>
    <td><input value="${valores[6]}"></td>
    <td><input value="${valores[7]}"></td>
    <td><input value="${valores[8]}"></td>
    <td><input value="${valores[9]}"></td>
    <td>
      <select>
        <option ${valores[10]==="pendente"?"selected":""}>pendente</option>
        <option ${valores[10]==="em_andamento"?"selected":""}>em_andamento</option>
        <option ${valores[10]==="finalizado"?"selected":""}>finalizado</option>
      </select>
    </td>
    <td>
      <button class="save-btn">Salvar</button>
      <button class="cancel-btn">Cancelar</button>
    </td>
  `;

  tr.querySelector('.save-btn').addEventListener('click', () => {
    const inputs = tr.querySelectorAll('input, select');
    const nfData = {
      transportadora: inputs[0].value,
      numero: inputs[1].value,
      valor: parseFloat(inputs[2].value),
      data: inputs[3].value,
      cliente: inputs[4].value,
      uf: inputs[5].value,
      motivo: inputs[6].value,
      acao: inputs[7].value,
      nfEntrada: inputs[8].value,
      arm: inputs[9].value,
      status: inputs[10].value
    };

    db.collection('notasFiscais').doc(id).update(nfData);
  });

  tr.querySelector('.cancel-btn').addEventListener('click', renderTabela);
}

// Excluir NF
function excluirNF(id) {
  if (confirm("Deseja excluir esta NF?")) {
    db.collection('notasFiscais').doc(id).delete();
  }
}

// Converter data DD/MM/YYYY -> YYYY-MM-DD
function formatDataInput(dataBR) {
  if (!dataBR.includes('/')) return dataBR;
  const partes = dataBR.split('/');
  return `${partes[2]}-${partes[1]}-${partes[0]}`;
}

// Inicializar
renderTabela();
