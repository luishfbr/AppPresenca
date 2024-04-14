import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import logo from '../assets/logo-empresa.png';

export default function Select() {
    const [dados, setDados] = useState({ empresas: [], cpf: '', nomeRelacionado: '' });
    const { cpf } = useParams();
    const history = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`http://localhost:3000/cliente/${cpf}`);
                if (response.ok) {
                    const data = await response.json();
                    setDados(data);
                } else {
                    console.error('Erro ao obter dados do cliente:', response.status);
                }
            } catch (error) {
                console.error('Erro ao obter dados do cliente:', error);
            }
        }

        fetchData();

        // Define o foco no botão de confirmar presença ao carregar a página
        const confirmarPresencaBtn = document.getElementById('confirmar-presenca-btn');
        if (confirmarPresencaBtn) {
            confirmarPresencaBtn.focus();
        }
    }, [cpf]);

    const confirmarPresenca = async () => {
        try {
            const response = await fetch(`http://localhost:3000/confirmar-presenca/${cpf}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nomeRelacionado: dados.nomeRelacionado // Adicionando nome relacionado ao corpo da requisição
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                history('/aprovado');
            } else {
                console.error('Erro ao confirmar presença:', response.status);
            }
        } catch (error) {
            console.error('Erro ao confirmar presença:', error);
        }
    };

    return (
        <div className="main">
            <button className='voltar-btn btn1 poppins-regular'><Link className='linkstyle' to="/">VOLTAR</Link></button>
            <div className="container-main">
                <div className="glass">
                    <div className="container-visible">
                        <img src={logo} alt="" className="imglogo" />
                        <span className="span-title poppins-regular">Seja bem-vindo.</span>
                        <p className="p-title poppins-regular">
                            <p>{dados.nomeRelacionado}</p>
                            <ul className='select-list'>
                                {dados.empresas.map((empresa, index) => (
                                    <li key={index}>{empresa}</li>
                                ))}
                            </ul>
                        </p>
                        <div className='div-btn'>
                            <button id="confirmar-presenca-btn" className='voltar-btn poppins-regular' onClick={confirmarPresenca}>CONFIRMAR PRESENÇA</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
