import express from 'express';
import { google } from 'googleapis';
import { promises as fs } from 'fs';
import cors from 'cors';

const app = express();
app.use(cors({ origin: '*' }));
const PORT = 3000;
app.use(express.json());

async function readCredentials() {
    try {
        const content = await fs.readFile('./secrets.json', 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error('Erro ao ler o arquivo JSON:', error);
        throw new Error('Erro ao ler o arquivo JSON');
    }
}

async function getSheetsInstance() {
    const credentials = await readCredentials();

    const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    return google.sheets({ version: 'v4', auth });
}

async function getValuesFromSheet(sheets, spreadsheetId, range) {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range,
    });
    return response.data.values;
}

async function verificarCpfUtilizado(cpf) {
    const sheets = await getSheetsInstance();
    const spreadsheetId = ''; //INSIRA O ID DA SUA PLANILHA
    const range = 'PRESENCA!A:B'; // Altere para o nome da aba correta

    const values = await getValuesFromSheet(sheets, spreadsheetId, range);
    return values.flat().includes(cpf);
}

async function adicionarCpfPresenca(cpf) {
    const sheets = await getSheetsInstance();
    const spreadsheetId = ''; //INSIRA O ID DA SUA PLANILHA
    const range = 'PRESENCA!A:B'; // Altere para o nome da aba correta

    sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: {
            values: [[cpf, ""]],
        },
    });
}

// Rota para obter as informações do cliente com base no CPF inserido
app.get('/cliente/:cpf', async (req, res) => {
    try {
        const cpf = req.params.cpf;

        // Ler as credenciais do arquivo JSON
        const credentials = await readCredentials();

        // Autenticar com as credenciais
        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        // Criar uma instância do serviço Google Sheets
        const sheets = google.sheets({ version: 'v4', auth });

        // ID da planilha e intervalo para a aba "1"
        const spreadsheetId = ''; //INSIRA O ID DA SUA PLANILHA
        const range = 'TESTE!A:D'; // Altere para o nome da aba correta

        // Obter os valores da aba "1"
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: range,
        });

        const values = response.data.values;

        // Inicializar arrays para armazenar os CNPJs e nomes das empresas
        let empresas = [];
        let cpfRelacionado = '';
        let nomeRelacionado = '';
        let nomeCliente1 = '';
        let nomeCliente2 = '';

        // Percorrer todas as linhas da planilha
        for (let i = 0; i < values.length; i++) {
            const row = values[i];
            
            // Verificar se o CPF está na primeira ou terceira coluna
            if (row[0] === cpf || row[2] === cpf) {
                // Mapear valores 'null' para strings vazias
                const sanitizedRow = row.map(value => (value === 'null' ? '' : value));
                
                empresas.push(sanitizedRow[1]);
                cpfRelacionado = sanitizedRow[2];
                nomeRelacionado = sanitizedRow[3];
                // Verificar se já existe um nomeCliente definido
                if (!nomeCliente1) {
                    nomeCliente1 = sanitizedRow[1];
                } else {
                    // Se já existe nomeCliente1, definir como nomeCliente2
                    nomeCliente2 = sanitizedRow[1];
                }
            }
        }

        if (empresas.length > 0) {
            res.json({
                empresas,
                cpfRelacionado,
                nomeRelacionado,
                nomeCliente1,
                nomeCliente2
            });
        } else {
            res.status(404).json({ error: 'Cliente não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar informações na planilha:', error);
        res.status(500).json({ error: 'Erro ao buscar informações na planilha' });
    }
});

// Rota para verificar presença
app.get('/verificar-presenca/:cpf', async (req, res) => {
    try {
        const { cpf } = req.params;

        const cpfUtilizado = await verificarCpfUtilizado(cpf);

        res.status(200).json({ cpfUtilizado });
    } catch (error) {
        console.error('Erro ao verificar presença:', error);
        res.status(500).json({ error: 'Erro ao verificar presença.' });
    }
});

// Rota para confirmar presença
app.post('/confirmar-presenca/:cpf', async (req, res) => {
    try {
        const cpf = req.params.cpf;

        const cpfUtilizado = await verificarCpfUtilizado(cpf);
        if (cpfUtilizado) {
            return res.status(400).json({ error: 'CPF já foi utilizado para confirmar presença.' });
        }

        const nomeRelacionado = req.body.nomeRelacionado; // Supondo que você obtenha o nome relacionado do corpo da requisição

        // Adiciona o CPF, nome do cliente e nome relacionado na linha correspondente na aba PRESENCA
        await adicionarCpfPresenca(cpf, nomeRelacionado);

        res.status(200).json({ message: 'Presença confirmada com sucesso.' });
    } catch (error) {
        console.error('Erro ao confirmar presença:', error);

        let message;
        if (error.message === 'CPF já foi utilizado para confirmar presença.') {
            message = error.message;
        } else if (error.message === 'CPF inválido.') {
            message = 'O CPF informado não é válido.';
        } else {
            message = 'Erro ao confirmar presença.';
        }

        res.status(400).json({ error: message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
