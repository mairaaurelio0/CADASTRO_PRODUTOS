const listaDeProdutos = [];

let indiceEdicao = null;
let termoBusca = "";

const CHAVE_STORAGE = "estoque_stavni";

class Produto {
    #preco;
    #quantidade;

    constructor(nome, preco, quantidade) {
        if (!nome || nome.trim() === "") {
            throw new Error("O nome do produto não pode estar vazio.");
        }
        if (preco <= 0) {
            throw new Error("O preço do produto deve ser maior que zero (R$ 0.00).");
        }
        if (quantidade <= 0) {
            throw new Error("A quantidade de itens deve ser maior que zero.");
        }

        this.nome = nome;
        this.#preco = preco;
        this.#quantidade = quantidade;
    }

    get preco() {
        return this.#preco;
    }

    get quantidade() {
        return this.#quantidade;
    }

    get subtotal() {
        return this.#preco * this.#quantidade;
    }
}

const form = document.getElementById("produto-form");
const tabelaCorpo = document.querySelector("#tabela-produtos tbody");
const botaoSubmit = form.querySelector('button[type="submit"]');
const campoBusca = document.getElementById("campo-busca");

const campoNome = document.getElementById("nome");
const campoPreco = document.getElementById("preco");
const campoQuantidade = document.getElementById("quantidade");
const listaSugestoes = document.getElementById("sugestoes-produtos");

const TEXTO_BOTAO_INCLUIR = "Adicionar Produto";
const TEXTO_BOTAO_EDITAR = "Salvar Alterações";

const formatarMoeda = (valor) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function salvarNoStorage() {
    const dados = listaDeProdutos.map((p) => ({
        nome: p.nome,
        preco: p.preco,
        quantidade: p.quantidade
    }));
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(dados));
}

function carregarDoStorage() {
    try {
        const dados = JSON.parse(localStorage.getItem(CHAVE_STORAGE)) || [];
        dados.forEach((d) => {
            listaDeProdutos.push(new Produto(d.nome, d.preco, d.quantidade));
        });
    } catch (error) {
        console.error("Não foi possível carregar os dados salvos:", error);
        localStorage.removeItem(CHAVE_STORAGE);
    }
}

function obterProdutosFiltrados() {
    return listaDeProdutos
        .map((produto, indiceOriginal) => ({ produto, indiceOriginal }))
        .filter(({ produto }) => produto.nome.toLowerCase().includes(termoBusca));
}

function atualizarSugestoes() {
    listaSugestoes.innerHTML = "";

    const nomesUnicos = [...new Map(
        listaDeProdutos.map((p) => [p.nome.toLowerCase(), p.nome])
    ).values()];

    nomesUnicos.forEach((nome) => {
        const opcao = document.createElement("option");
        opcao.value = nome;
        listaSugestoes.appendChild(opcao);
    });
}

function atualizarTotalEstoque(itensVisiveis) {
    const valorTotal = itensVisiveis.reduce((acumulador, { produto }) => {
        return acumulador + produto.subtotal;
    }, 0);

    document.getElementById("total-estoque").innerText =
        `Total em Estoque: ${formatarMoeda(valorTotal)}`;
}

function renderizarTabela() {
    tabelaCorpo.innerHTML = "";
    atualizarSugestoes();

    const itensVisiveis = obterProdutosFiltrados();

    if (itensVisiveis.length === 0) {
        const mensagem = listaDeProdutos.length === 0
            ? "Nenhum produto cadastrado ainda."
            : "Produto não localizado.";

        tabelaCorpo.innerHTML = `<tr><td colspan="5" class="sem-resultados">${mensagem}</td></tr>`;
        atualizarTotalEstoque(itensVisiveis);
        return;
    }

    itensVisiveis.forEach(({ produto, indiceOriginal }) => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td class="celula-nome"></td>
            <td>${formatarMoeda(produto.preco)}</td>
            <td>${produto.quantidade}</td>
            <td>${formatarMoeda(produto.subtotal)}</td>
            <td>
                <button class="btn-editar" onclick="prepararEdicao(${indiceOriginal})">Editar</button>
                <button class="btn-remover" onclick="removerProduto(${indiceOriginal})">Remover</button>
            </td>
        `;

        linha.querySelector(".celula-nome").textContent = produto.nome;

        tabelaCorpo.appendChild(linha);
    });

    atualizarTotalEstoque(itensVisiveis);
}

function resetarModoInclusao() {
    indiceEdicao = null;
    botaoSubmit.innerText = TEXTO_BOTAO_INCLUIR;
    form.reset();
}

function prepararEdicao(index) {
    const produto = listaDeProdutos[index];

    campoNome.value = produto.nome;
    campoPreco.value = produto.preco;
    campoQuantidade.value = produto.quantidade;

    indiceEdicao = index;
    botaoSubmit.innerText = TEXTO_BOTAO_EDITAR;

    campoNome.focus();
}

function removerProduto(index) {
    listaDeProdutos.splice(index, 1);

    if (indiceEdicao === index) {
        resetarModoInclusao();
    } else if (indiceEdicao !== null && index < indiceEdicao) {
        indiceEdicao--;
    }

    salvarNoStorage();
    renderizarTabela();
}

document.getElementById("limpar-tabela").addEventListener("click", () => {
    listaDeProdutos.length = 0;
    campoBusca.value = "";
    termoBusca = "";
    resetarModoInclusao();
    salvarNoStorage();
    renderizarTabela();
});

campoBusca.addEventListener("input", () => {
    termoBusca = campoBusca.value.trim().toLowerCase();
    renderizarTabela();
});

campoNome.addEventListener("change", () => {
    if (indiceEdicao !== null) return;

    const existente = listaDeProdutos.find(
        (p) => p.nome.toLowerCase() === campoNome.value.trim().toLowerCase()
    );

    if (existente) {
        campoPreco.value = existente.preco;
        campoQuantidade.value = existente.quantidade;
    }
});

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const nome = campoNome.value.trim();
    const preco = parseFloat(campoPreco.value);
    const quantidade = parseInt(campoQuantidade.value);

    if (nome === "") {
        alert("O nome do produto não pode estar vazio.");
        return;
    }
    if (isNaN(preco) || preco <= 0) {
        alert("O preço deve ser um número válido maior que zero.");
        return;
    }
    if (isNaN(quantidade) || quantidade <= 0) {
        alert("A quantidade deve ser um número válido maior que zero.");
        return;
    }

    try {
        const novoProduto = new Produto(nome, preco, quantidade);

        if (indiceEdicao === null) {
            listaDeProdutos.push(novoProduto);
        } else {
            listaDeProdutos[indiceEdicao] = novoProduto;
        }

        salvarNoStorage();
        renderizarTabela();
        resetarModoInclusao();

    } catch (error) {
        alert(error.message);
    }
});

carregarDoStorage();
renderizarTabela();