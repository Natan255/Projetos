import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { doc, updateDoc, getDoc } from "firebase/firestore";

import "./PerfilSquadConfig.css";

function PerfilSquadConfig() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [solicitarPost, setSolicitarPost] = useState("sim");
    const [solicitarEntrada, setSolicitarEntrada] = useState("sim");
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const carregarConfiguracoesSquad = async () => {
            try {
                const squadRef = doc(db, "squads", id);
                const squadSnap = await getDoc(squadRef);

                if (squadSnap.exists()) {
                    const dados = squadSnap.data();
                    if (dados.solicitarPost) setSolicitarPost(dados.solicitarPost);
                    if (dados.solicitarEntrada) setSolicitarEntrada(dados.solicitarEntrada);
                }
            } catch (error) {
                console.error("Erro ao buscar configurações do Squad:", error);
            } finally {
                setCarregando(false);
            }
        };

        carregarConfiguracoesSquad();
    }, [id]);

    const atualizarSolicitacaoPost = async (novoValor) => {
        try {
            const squadRef = doc(db, "squads", id);
            await updateDoc(squadRef, {
                solicitarPost: novoValor
            });
        } catch (error) {
            console.error("Erro ao atualizar solicitação de post:", error);
        }
    };

    const atualizarSolicitacaoEntrada = async (novoValor) => {
        try {
            const squadRef = doc(db, "squads", id);
            await updateDoc(squadRef, {
                solicitarEntrada: novoValor
            });
        } catch (error) {
            console.error("Erro ao atualizar solicitação de entrada:", error);
        }
    };

    if (carregando) {
        return <div className="config-container"><p style={{color: '#fff'}}>Carregando configurações...</p></div>;
    }

    return (
        <div className="config-container">
            <div className="config">
                <h2 className="config-titulo">Configurações da exibição do Squad</h2>
                
                <Link to={`/squadconfig/alterar/${id}/nome`}>
                    <button className="config-opcao">Alterar nome</button>
                </Link>

                <Link to={`/squadconfig/alterar/${id}/descricao`}>
                    <button className="config-opcao">Alterar descrição</button>
                </Link>

                <Link to={`/squadconfig/alterar/${id}/mural`}>
                    <button className="config-opcao">Alterar mural de avisos</button>
                </Link>

                <Link to={`/squadconfig/alterar/${id}/fotoBanner`}>
                    <button className="config-opcao">Alterar banner</button>
                </Link>

                <Link to={`/squadconfig/alterar/${id}/fotoCapa`}>
                    <button className="config-opcao">Alterar capa</button>
                </Link>

                <Link to={`/squadconfig/alterar/${id}/fotoPerfil`}>
                    <button className="config-opcao">Alterar foto de perfil</button>
                </Link>

                <h2 className="config-titulo">Configurações dos membros Squad</h2>

                <Link to={`/squadconfig/administrar/${id}/administrar`}>
                    <button className="config-opcao">Gerenciar usuario</button>
                </Link>

                <Link to={`/squadconfig/insignias/${id}`}>
                    <button className="config-opcao"> Insignias de usuario</button>
                </Link>

                <Link to={`/squadconfig/rank/${id}`}>
                    <button className="config-opcao"> Adicionar mais rank </button>
                </Link>


                {solicitarEntrada === "sim" && (
                    <Link to={`/squadconfig/solicitacao/${id}/entrada`}>
                        <button className="config-opcao">Solicitação de entrada no squad </button>
                    </Link>
                )}

                {solicitarPost === "sim" && (
                    <Link to={`/squadconfig/solicitacao/${id}/post`}>
                        <button className="config-opcao">Solicitação de post no squad </button>
                    </Link>
                )}

                <Link to={`/squadconfig/solicitacao/${id}/prova`}>
                    <button className="config-opcao">Solicitação de prova no squad </button>
                </Link>

                <h2 className="config-titulo">Configurações de privacidade do Squad</h2>
                
                <section className="config-privacidade-grupo">
                    <label htmlFor="solicitarPost">Solicitar post ao administrador do squad?</label>
                    <select 
                        name="solicitarPost" 
                        id="solicitarPost" 
                        value={solicitarPost} // Define qual option fica ativa vinda do banco
                        onChange={(e) => {
                            const valor = e.target.value;
                            setSolicitarPost(valor);
                            atualizarSolicitacaoPost(valor); // Salva o valor exato selecionado
                        }}
                    >
                        <option value="sim">Sim</option>
                        <option value="nao">Não</option>
                    </select>
                </section>

                <section className="config-privacidade-grupo">
                    <label htmlFor="solicitarEntrada">Solicitar entrada ao administrador do squad?</label>
                    <select name="solicitarEntrada" id="solicitarEntrada" value={solicitarEntrada}
                        onChange={(e) => {
                            const valor = e.target.value;
                            setSolicitarEntrada(valor);
                            atualizarSolicitacaoEntrada(valor);
                        }}
                    >
                        <option value="sim">Sim</option>
                        <option value="nao">Não</option>
                    </select>
                </section>

                <button className="config-voltar" onClick={() => navigate(-1)}>
                    ← Voltar ao perfil
                </button>
            </div>
        </div>
    );
}
export default PerfilSquadConfig;