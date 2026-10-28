const listaDeProdutos = [];


let indiceEdicao = null;

// =========================================================================
// DESAFIO 1: Classe Produto com Encapsulamento Privado (#) e Validações
// =========================================================================
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

const TEXTO_BOTAO_INCLUIR = "Adicionar Produto";
const TEXTO_BOTAO_EDITAR = "Salvar Alterações";


function atualizarTotalEstoque() {
    const valorTotal = listaDeProdutos.reduce((acumulador, produto) => {
        return acumulador + produto.subtotal;
    }, 0);

    const totalFormatado = valorTotal.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    document.getElementById("total-estoque").innerText = `Total em Estoque: ${totalFormatado}`;
}

function renderizarTabela() {
    tabelaCorpo.innerHTML = "";

    listaDeProdutos.forEach((produto, index) => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>${produto.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
            <td>${produto.quantidade}</td>
            <td>${produto.subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
            <td>
                <button class="btn-editar" onclick="prepararEdicao(${index})">Editar</button>
                <button class="btn-remover" onclick="removerProduto(${index})">Remover</button>
            </td>
        `;

        tabelaCorpo.appendChild(linha);
    });

    atualizarTotalEstoque();
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

    renderizarTabela();
}

document.getElementById("limpar-tabela").addEventListener("click", () => {
    listaDeProdutos.length = 0;
    resetarModoInclusao();
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

        renderizarTabela();
        resetarModoInclusao(); 

    } catch (error) {
        alert(error.message);
    }
});