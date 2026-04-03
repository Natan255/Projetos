import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./AlterarPerfil.css"

function AlterarPerfil() {
    const { campo } = useParams(); // Captura o que vem na URL
    const navigate = useNavigate();
    const [valor, setValor] = useState("");

    // Dicionário de configurações para adaptar a página
    const configs: Record<string, { titulo: string; tipo: string }> = {
        nome: { titulo: "Nome de Usuário", tipo: "text" },
        senha: { titulo: "Senha", tipo: "password" },
        bio: { titulo: "Biografia", tipo: "text" },
        foto: { titulo: "URL da Foto", tipo: "url" }
    };

    // Pega a configuração baseada no parâmetro da URL ou usa um padrão
    const atual = configs[campo || "nome"] || configs.nome;

    return (
        <div className="alterar-pagina-container">
            <h1>Alterar {atual.titulo}</h1>
            
            <input 
                type={atual.tipo} 
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder={`Digite seu novo ${atual.titulo}...`}
            />

            <div className="botoes-acoes">
                <button onClick={() => console.log("Salvar", valor)}>Salvar</button>
                <button onClick={() => navigate(-1)}>Cancelar</button>
            </div>
        </div>
    );
}
export default AlterarPerfil;