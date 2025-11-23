// Variáveis globais
const alfabeto = 'abcdefghijklmnopqrstuvwxyz';
let alfabetoUsuario = [];
let automato = {};
let estadosFinais = [];
let tokenAtual = '';
let estadoAtual = 0;

// Elementos DOM
let elementos = {};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    armazenarElementos();
    configurarEventos();
});

function armazenarElementos() {
    elementos = {
        botaoAdicionar: document.getElementById('botaoAdicionar'),
        botaoExcluir: document.getElementById('botaoExcluir'),
        campoEntrada: document.getElementById('campoEntrada'),
        radioAlfabeto: document.getElementById('radioAlfabeto'),
        radioTokens: document.getElementById('radioTokens'),
        campoAlfabeto: document.getElementById('campoAlfabeto'),
        exibicaoAlfabeto: document.getElementById('exibicaoAlfabeto'),
        exibicaoTokenAtual: document.getElementById('exibicaoTokenAtual'),
        exibicaoEstadoAtual: document.getElementById('exibicaoEstadoAtual'),
        areaStatus: document.getElementById('areaStatus'),
        cabecalhoMatriz: document.getElementById('cabecalhoMatriz'),
        corpoMatriz: document.getElementById('corpoMatriz'),
        tituloMatriz: document.getElementById('tituloMatriz'),
        secaoInfo: document.querySelector('.secao-info'),
        containerTabela: document.querySelector('.container-tabela')
    };
}

function configurarEventos() {
    elementos.botaoAdicionar.addEventListener('click', manipularAdicionar);
    elementos.botaoExcluir.addEventListener('click', manipularExcluir);
    
    elementos.radioAlfabeto.addEventListener('change', () => {
        elementos.botaoAdicionar.disabled = false;
    });
    
    elementos.radioTokens.addEventListener('change', () => {
        elementos.botaoAdicionar.disabled = true;
    });
    
    elementos.campoEntrada.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            manipularAdicionar();
        }
    });

    elementos.campoEntrada.addEventListener('keydown', (e) => {
        if (elementos.radioTokens.checked && alfabetoUsuario.length > 0) {
            if (e.key === 'Backspace' && tokenAtual.length > 0) {
                e.preventDefault();
                removerUltimoSimbolo();
            }
        }
    });

    elementos.campoEntrada.addEventListener('input', (e) => {
        if (elementos.radioTokens.checked && alfabetoUsuario.length > 0) {
            const valor = e.target.value;
            const ultimoCaractere = valor[valor.length - 1];
            
            if (ultimoCaractere === ' ') {
                finalizarToken();
                e.target.value = '';
            } else if (ultimoCaractere && alfabeto.includes(ultimoCaractere) && valor.length > tokenAtual.length) {
                processarSimbolo(ultimoCaractere);
            }
        }
    });
}

function manipularAdicionar() {
    const valor = elementos.campoEntrada.value.trim().toLowerCase();

    if (!valor) {
        alert('Por favor, digite algo no campo de entrada.');
        return;
    }

    if (elementos.radioAlfabeto.checked) {
        if (!/^[a-z]+$/.test(valor)) {
            alert('O alfabeto deve conter apenas letras minúsculas de a-z.');
            return;
        }
        
        adicionarPalavra(valor);
        elementos.campoEntrada.value = '';
    } else if (elementos.radioTokens.checked) {
        if (alfabetoUsuario.length === 0) {
            alert('Por favor, defina pelo menos uma palavra no alfabeto primeiro.');
            return;
        }
        
        for (let caractere of valor) {
            if (alfabeto.includes(caractere)) {
                processarSimbolo(caractere);
            }
        }
        finalizarToken();
        elementos.campoEntrada.value = '';
    } else {
        alert('Por favor, selecione Alfabeto ou Tokens.');
    }
}

function manipularExcluir() {
    alfabetoUsuario = [];
    automato = {};
    estadosFinais = [];
    tokenAtual = '';
    estadoAtual = 0;
    
    elementos.campoAlfabeto.value = '';
    elementos.campoEntrada.value = '';
    elementos.exibicaoAlfabeto.textContent = '';
    elementos.exibicaoTokenAtual.textContent = '';
    elementos.exibicaoEstadoAtual.textContent = 'q0';
    elementos.areaStatus.innerHTML = '';
    elementos.areaStatus.className = 'exibicao-status';
    elementos.corpoMatriz.innerHTML = '';
    
    ocultarMatriz();
    
    elementos.radioAlfabeto.checked = false;
    elementos.radioTokens.checked = false;
}

function adicionarPalavra(palavra) {
    if (!alfabetoUsuario.includes(palavra)) {
        alfabetoUsuario.push(palavra);
        
        elementos.campoAlfabeto.value = alfabetoUsuario.join(', ');
        
        construirAutomato();
        desenharMatrizTransicao();
        
        elementos.exibicaoAlfabeto.textContent = alfabetoUsuario.join(', ');
        
        alert(`Palavra "${palavra}" adicionada!\nTotal de palavras: ${alfabetoUsuario.length}\nAgora selecione "Tokens" para validar.`);
    } else {
        alert(`A palavra "${palavra}" já está no alfabeto.`);
    }
}

function construirAutomato() {
    automato = {};
    estadosFinais = [];
    
    let contadorEstados = 0;
    const mapaEstados = {};
    
    mapaEstados[''] = 0;
    automato[0] = {};
    
    for (let simbolo of alfabeto) {
        automato[0][simbolo] = -1;
    }
    
    for (let palavra of alfabetoUsuario) {
        let prefixo = '';
        
        for (let i = 0; i < palavra.length; i++) {
            const simbolo = palavra[i];
            const proximoPrefixo = prefixo + simbolo;
            const estadoAtualLoop = mapaEstados[prefixo];
            
            if (!mapaEstados[proximoPrefixo]) {
                contadorEstados++;
                mapaEstados[proximoPrefixo] = contadorEstados;
                
                automato[contadorEstados] = {};
                for (let s of alfabeto) {
                    automato[contadorEstados][s] = -1;
                }
            }
            
            automato[estadoAtualLoop][simbolo] = mapaEstados[proximoPrefixo];
            prefixo = proximoPrefixo;
        }
        
        const estadoFinal = mapaEstados[palavra];
        if (!estadosFinais.includes(estadoFinal)) {
            estadosFinais.push(estadoFinal);
        }
    }
}

function desenharMatrizTransicao() {
    mostrarMatriz();
    
    // Limpa e cria cabeçalho
    elementos.cabecalhoMatriz.innerHTML = '<th class="cabecalho-estado">Estado</th>';
    for (let letra of alfabeto) {
        elementos.cabecalhoMatriz.innerHTML += `<th>${letra}</th>`;
    }
    
    // Limpa corpo
    elementos.corpoMatriz.innerHTML = '';
    
    // Cria linhas de estados
    const estados = Object.keys(automato).map(Number).filter(e => e >= 0).sort((a, b) => a - b);
    
    for (let estado of estados) {
        const linha = elementos.corpoMatriz.insertRow();
        linha.setAttribute('data-estado', estado);
        
        const ehInicial = estado === 0;
        const ehFinal = estadosFinais.includes(estado);
        
        let rotuloEstado = `q${estado}`;
        if (ehInicial) rotuloEstado += ' (inicial)';
        if (ehFinal) rotuloEstado += ' ⭐';
        
        const celulaRotulo = linha.insertCell();
        celulaRotulo.className = `rotulo-estado ${ehInicial ? 'estado-inicial' : ''} ${ehFinal ? 'estado-final' : ''}`;
        celulaRotulo.textContent = rotuloEstado;
        
        for (let letra of alfabeto) {
            const proximoEstado = automato[estado][letra];
            const celula = linha.insertCell();
            
            let conteudoCelula = '';
            let classeCelula = 'transicao-vazia';
            
            if (proximoEstado !== undefined && proximoEstado !== -1) {
                conteudoCelula = `q${proximoEstado}`;
                classeCelula = 'transicao-valida';
            }
            
            celula.className = classeCelula;
            celula.setAttribute('data-estado', estado);
            celula.setAttribute('data-simbolo', letra);
            celula.setAttribute('data-proximo', proximoEstado);
            celula.textContent = conteudoCelula;
        }
    }
}

function mostrarMatriz() {
    elementos.secaoInfo.style.display = 'block';
    elementos.tituloMatriz.style.display = 'block';
    elementos.containerTabela.style.display = 'block';
}

function ocultarMatriz() {
    elementos.secaoInfo.style.display = 'none';
    elementos.tituloMatriz.style.display = 'none';
    elementos.containerTabela.style.display = 'none';
}

function processarSimbolo(simbolo) {
    tokenAtual += simbolo;
    limparDestaques();
    
    const estadoAnterior = estadoAtual;
    if (automato[estadoAtual] && automato[estadoAtual][simbolo] !== undefined) {
        estadoAtual = automato[estadoAtual][simbolo];
    } else {
        estadoAtual = -1;
    }
    
    elementos.exibicaoTokenAtual.textContent = tokenAtual;
    elementos.exibicaoEstadoAtual.textContent = estadoAtual === -1 ? 'ERRO' : `q${estadoAtual}`;
    
    destacarTransicao(estadoAnterior, simbolo, estadoAtual);
}

function removerUltimoSimbolo() {
    if (tokenAtual.length === 0) return;
    
    tokenAtual = tokenAtual.slice(0, -1);
    estadoAtual = 0;
    limparDestaques();
    
    for (let simbolo of tokenAtual) {
        if (automato[estadoAtual] && automato[estadoAtual][simbolo] !== undefined) {
            const estadoAnterior = estadoAtual;
            estadoAtual = automato[estadoAtual][simbolo];
            destacarTransicao(estadoAnterior, simbolo, estadoAtual);
        } else {
            estadoAtual = -1;
            break;
        }
    }
    
    elementos.exibicaoTokenAtual.textContent = tokenAtual;
    elementos.exibicaoEstadoAtual.textContent = estadoAtual === -1 ? 'ERRO' : `q${estadoAtual}`;
    elementos.campoEntrada.value = tokenAtual;
}

function destacarTransicao(estadoOrigem, simbolo, estadoDestino) {
    const celula = document.querySelector(`td[data-estado="${estadoOrigem}"][data-simbolo="${simbolo}"]`);
    if (celula) {
        celula.classList.add(estadoDestino === -1 ? 'erro-atual' : 'transicao-atual');
    }
    
    document.querySelectorAll('tr[data-estado]').forEach(linha => {
        linha.classList.remove('linha-estado-atual');
    });
    
    const linhaAtual = document.querySelector(`tr[data-estado="${estadoDestino}"]`);
    if (linhaAtual) {
        linhaAtual.classList.add('linha-estado-atual');
    }
}

function limparDestaques() {
    document.querySelectorAll('.transicao-atual, .erro-atual').forEach(el => {
        el.classList.remove('transicao-atual', 'erro-atual');
    });
    document.querySelectorAll('.linha-estado-atual').forEach(el => {
        el.classList.remove('linha-estado-atual');
    });
}

function finalizarToken() {
    if (tokenAtual === '') return;
    
    bloquearCampos(true);
    
    const foiAceito = estadosFinais.includes(estadoAtual);
    
    if (foiAceito) {
        elementos.areaStatus.innerHTML = `<span class="aceito">✓ TOKEN "${tokenAtual}" ACEITO!</span>`;
        elementos.areaStatus.className = 'exibicao-status fundo-aceito';
    } else {
        elementos.areaStatus.innerHTML = `<span class="rejeitado">✗ TOKEN "${tokenAtual}" REJEITADO!</span>`;
        elementos.areaStatus.className = 'exibicao-status fundo-rejeitado';
    }
    
    setTimeout(() => {
        tokenAtual = '';
        estadoAtual = 0;
        limparDestaques();
        elementos.exibicaoTokenAtual.textContent = '';
        elementos.exibicaoEstadoAtual.textContent = 'q0';
        elementos.areaStatus.innerHTML = '';
        elementos.areaStatus.className = 'exibicao-status';
        bloquearCampos(false);
    }, 2000);
}

function bloquearCampos(bloquear) {
    elementos.campoEntrada.disabled = bloquear;
    elementos.radioAlfabeto.disabled = bloquear;
    elementos.radioTokens.disabled = bloquear;
    elementos.botaoAdicionar.disabled = bloquear;
    elementos.botaoExcluir.disabled = bloquear;
}