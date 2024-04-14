import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo-empresa.png';

export default function Approved() {
  const history = useNavigate();

  useEffect(() => {
    // Inicia um temporizador de 8 segundos
    const timer = setTimeout(() => {
      // Redireciona para a página '/main'
      history('/');
    }, 5000); // 5000 milissegundos = 5 segundos

    // Limpa o temporizador ao desmontar o componente
    return () => clearTimeout(timer);
  }, [history]);

  return (
    <div className="main">
      <button className='voltar-btn btn1 poppins-regular'><Link className='linkstyle' to="/">VOLTAR</Link></button>
      <div className="container-main">
        <div className="glass">          
          <div className="container-visible">
            <img src={logo} alt="" className="imglogo" />
            <span className="span-title-approved poppins-regular">
              PRESENÇA CONFIRMADA!
              <br />
            </span>
            <span className="poppins-regular">SOLICITE SUA PULSEIRA DE ACESSO.</span>
            <div className="div-approved poppins-regular">
              <h1>✅</h1>
            </div>
            <p className="p-title-approved poppins-regular">
              Aproveite o evento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
