import { useState } from "react";
import "./Cardsquad.css"
import "./PostSquad.css"
import { useNavigate } from "react-router-dom"


function PostSquad({id, idAutor, titulo, texto, likes, comentarios, autor, fotoAutor, conquista, jaDeuLike, aoDarLike}) {
    const navigate = useNavigate();

    if (!titulo && !texto) return null;

    const verPerfil = () => {
        navigate(`/paginas/Perfil/${idAutor}`); 
    };

    return (
        <div className={`Estrutura_post ${conquista ? 'post-conquista' : ''}`}>
            
            <div className="Foto_perfil" onClick={verPerfil} style={{cursor: "pointer"}}>
                <img src={fotoAutor || "https://via.placeholder.com/40"} alt="foto perfil" />
                <p>{autor || "Membro"}</p>
            </div>

            <div className="Conteudo_Post" onClick={() => navigate(`/post/${id}`)}>
                <h1>{conquista ? `🏆 ${titulo}` : titulo}</h1>
                <p>{texto}</p>
            </div>

            <div className="Botoes_interacoes">
                <button className={`btn_interacao btn_like ${jaDeuLike ? 'ativo' : ''}`} onClick={aoDarLike}>
                    <span className="icon">{jaDeuLike ? "❤️" : "🤍"}</span>
                    <span className="count">{likes}</span>
                </button>

                <button className="btn_interacao btn_comment" onClick={() => navigate(`/post/${id}`)} >
                    <span className="icon">💬</span>
                    <span className="count">{comentarios || 0}</span>
                </button>
            </div>
        </div>
    );
}
export default PostSquad;