import { useEffect } from 'react';
import '../styles/style.css';
import logo from '../assets/logo-empresa.png';
import { Link, useNavigate } from 'react-router-dom';

export default function Denied() {
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
            <span className="span-title-denied poppins-regular">
                PRESENÇA JÁ REGISTRADA
            </span>
            <div className="div-denied poppins-regular">
              <h1>!</h1>
            </div>
            <p className="p-title-denied poppins-regular">
              Solicite apoio
            </p>
          </div>
        </div>
        </div>
    </div>
  );
}
