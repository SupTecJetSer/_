let dados = [];
let indiceSelecionado = -1;

async function carregarDados() {
  try {
    const res = await fetch("https://raw.githubusercontent.com/SupTecJetSer/_/refs/heads/main/dados.json?nocache=" + Date.now());
    dados = await res.json();
    renderizar();
  } catch (erro) {
    console.error("Erro ao carregar JSON:", erro);
  }
}

function copiarCodigo(codigo, el) {
  navigator.clipboard.writeText(codigo);

  const icon = el.querySelector('.copy-btn');
  const linha = el.closest('tr');

  if (el._copyTimeout) {
    clearTimeout(el._copyTimeout);
  }

  if (icon) {
    icon.innerHTML = "✔️";

    el._copyTimeout = setTimeout(() => {
      icon.innerHTML = "";
    }, 1500);
  }

  if (linha) {
    linha.classList.remove('copiado');
    void linha.offsetWidth;
    linha.classList.add('copiado');
  }
}

function getTiposSelecionados() {
  return Array.from(document.querySelectorAll('.filtros input:checked'))
    .map(el => el.value);
}

function atualizarSelecao(linhas) {
  linhas.forEach(l => l.classList.remove('selecionado'));

  if (linhas[indiceSelecionado]) {
    linhas[indiceSelecionado].classList.add('selecionado');
    linhas[indiceSelecionado].scrollIntoView({ block: "nearest" });
  }
}

document.addEventListener('keydown', function(e) {
  const linhas = document.querySelectorAll('#tabela tr');

  if (!linhas.length) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    indiceSelecionado = Math.min(indiceSelecionado + 1, linhas.length - 1);
    atualizarSelecao(linhas);
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    indiceSelecionado = Math.max(indiceSelecionado - 1, 0);
    atualizarSelecao(linhas);
  }

  if (e.key === "Enter" && indiceSelecionado >= 0) {
    const linha = linhas[indiceSelecionado];
    const celula = linha.querySelector('.codigo-cell');
    if (celula) celula.click();
  }
});

function renderizar() {
  const termo = document.getElementById('busca').value.toLowerCase();
  const tiposSelecionados = getTiposSelecionados();

  const filtrados = dados.filter(item => {
    const matchBusca =
      item.codigo.toLowerCase().includes(termo) ||
      item.nome.toLowerCase().includes(termo);

    const matchTipo = tiposSelecionados.includes(item.tipo);

    return matchBusca && matchTipo;
  }).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  const tabela = document.getElementById('tabela');
  tabela.innerHTML = '';

  filtrados.forEach(item => {
    tabela.innerHTML += `
      <tr class="${item.tipo}">
        <td class="codigo-cell" onclick="copiarCodigo('${item.codigo}', this)">
          <span class="copy-btn"></span>
          ${item.codigo}
        </td>
        <td>
          ${item.nome}
          <span class="badge ${item.tipo}">
            ${item.tipo}
          </span>
        </td>
      </tr>
    `;
  });

  indiceSelecionado = -1;
}

document.getElementById('busca').addEventListener('input', renderizar);
document.querySelectorAll('.filtros input')
  .forEach(el => el.addEventListener('change', renderizar));

carregarDados();
