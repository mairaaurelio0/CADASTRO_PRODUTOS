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

function atualizarTotalEstoque(itensVisiveis) {
    const valorTotal = itensVisiveis.reduce((acumulador, { produto }) => {
        return acumulador + produto.subtotal;
    }, 0);

    document.getElementById("total-estoque").innerText =
        `Total em Estoque: ${formatarMoeda(valorTotal)}`;
}

function renderizarTabela() {
    tabelaCorpo.innerHTML = "";

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
            <td>${produto.nome}</td>
            <td>${formatarMoeda(produto.preco)}</td>
            <td>${produto.quantidade}</td>
            <td>${formatarMoeda(produto.subtotal)}</td>
            <td>
                <button class="btn-editar" onclick="prepararEdicao(${indiceOriginal})">Editar</button>
                <button class="btn-remover" onclick="removerProduto(${indiceOriginal})">Remover</button>
            </td>
        `;

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

    document.getElementById("nome").value = produto.nome;
    document.getElementById("preco").value = produto.preco;
    document.getElementById("quantidade").value = produto.quantidade;

    indiceEdicao = index;
    botaoSubmit.innerText = TEXTO_BOTAO_EDITAR;

    document.getElementById("nome").focus();
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

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const preco = parseFloat(document.getElementById("preco").value);
    const quantidade = parseInt(document.getElementById("quantidade").value);

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