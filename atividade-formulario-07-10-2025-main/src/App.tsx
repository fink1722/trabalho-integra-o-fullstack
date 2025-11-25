import { useState } from 'react';
import axios from 'axios';


interface DadosDoFormulario {
    nome: string;
    link: string;
    turma: string;
}

function FormularioProjeto() {
    const API_URL = 'http://localhost:4000/submit';
    const [nome, setNome] = useState<string>('');
    const [link, setLink] = useState<string>('');
    const [turma, setTurma] = useState<string>('');
    const [enviando, setEnviando] = useState<boolean>(false);
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!nome || !link || !turma){
          alert('Por favor, preencha todos os campos.');
        }
        setEnviando(true);

        const dadosParaEnviar: DadosDoFormulario = {
          nome: nome,
          link: link,
          turma: turma
        };
        
        try{
          const response = await axios.post(API_URL, dadosParaEnviar);

          alert('Projeto enviado com sucesso!');
          console.log('Resposta do servidor:', response.data);

          setNome('');
          setLink('');
          setTurma('');
        }catch (error){
          console.error('Houve um erro ao enviar o formulario:', error);
          alert('Ocorreu um erro ao enviar o projeto. Verifique o console para mais detalhes.');

        }finally{
          setEnviando(false);
        }
       



    }
    
    return(
      <div>
        <form onSubmit={handleSubmit}>
          <div>
              <label htmlFor="nome">Nome:</label>
              <input
                  type="text"
                  id="nome"
                  value={nome}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value)}
                  disabled={enviando}
              />
          </div>
          <div>
            <label htmlFor="link">Link do Projeto:</label>
              <input
                  type="url" // Usar type="url" é bom para semântica e validação do navegador
                  id="link"
                  value={link}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLink(e.target.value)}
                  disabled={enviando}
              />
          </div>
          <div>
            <label htmlFor="turma">Turma:</label>
              <input
                  type="text"
                  id="turma"
                  value={turma}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTurma(e.target.value)}
                  disabled={enviando}
              />
          </div>
          <button type="submit" disabled={enviando}>
              {enviando ? 'Enviando...' : 'Enviar Projeto'}
          </button>
       </form>
      </div>
    );

};

export default FormularioProjeto;