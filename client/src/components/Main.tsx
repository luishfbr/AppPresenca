import React, { useEffect, useState } from 'react';
import '../styles/style.css';
import logo from '../assets/logo-empresa.png';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import InputMask from 'react-input-mask';

interface FormValues {
  cpf: string;
}

export default function Main() {
  const [mensagem, setMensagem] = useState<string>('');
  const history = useNavigate();

  useEffect(() => {
    const input = document.getElementById('cpfInput') as HTMLInputElement | null;
    if (input) {
      input.focus();
    }
  }, []);

  const formik = useFormik<FormValues>({
    initialValues: {
      cpf: '',
    },
    onSubmit: async (values) => {
      if (!values.cpf) {
        setMensagem('Por favor, insira o seu CPF.');
        return;
      }
    
      const formattedCPF = values.cpf.replace(/[.-]/g, '');
    
      try {
        const presencaResponse = await fetch(`http://localhost:3000/verificar-presenca/${formattedCPF}`);
        
        if (presencaResponse.ok) {
          const presencaData = await presencaResponse.json();
          if (presencaData.cpfUtilizado) {
            // Redireciona para a página de CPF já utilizado
            history('/negado');
            return;
          }
        } else {
          console.error('Erro ao verificar presença:', presencaResponse.status);
          setMensagem('Erro ao verificar CPF. Por favor, tente novamente.');
          return;
        }
    
        const clienteResponse = await fetch(`http://localhost:3000/cliente/${formattedCPF}`);
        if (clienteResponse.ok) {
          // Redireciona para a página Select com o CPF na URL
          history(`/selecionar/${formattedCPF}`);
        } else {
          setMensagem('CPF não encontrado. Solicite apoio.');
        }
      } catch (error) {
        console.error('Erro ao enviar CPF:', error);
        setMensagem('Erro ao verificar CPF. Por favor, tente novamente.');
      }
    }
  });

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      // Limpa o valor do campo de entrada quando a tecla Backspace é pressionada
      formik.setFieldValue('cpf', '');
    }
  };

  return (
    <div className="main">
      <div className="container-main">
        <div className="glass">          
          <div className="container-visible">
            <img src={logo} alt="" className="imglogo" />
            <span className="span-title poppins-regular">
              Prezado cooperado
            </span>
            <p className="p-title-main poppins-regular">
              Registre sua presença na Assembleia Geral Extraordinária e Ordinária 2024 do Sicoob Uberaba.  
            </p>
            <form className="form-btns" onSubmit={formik.handleSubmit}>
              <InputMask
                mask="999.999.999-99"
                maskChar=""
                value={formik.values.cpf}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onKeyDown={handleKeyDown} // Limpa o conteúdo do campo ao pressionar a tecla Backspace
                name="cpf"
                className="input-form"
                placeholder="Insira o seu CPF"
                autoComplete="off" // Desabilita o preenchimento automático de dados
                id="cpfInput" // Definindo um ID para o input
              />
              <button className="btn-form" type="submit">
                REGISTRAR
              </button>
            </form>
            <div>
              {mensagem && <p className="msg-error poppins-regular">{mensagem}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
