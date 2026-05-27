import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./CardItem.css";

interface CardItemProps {
    nome: string;
    fotoBanner: string;
    info: string;
    id: string;
    eMeuPerfil: boolean; 
    onDeletar?: (id: string) => void; 
    onFixar?: (id: string) => void;   
    onCompartilhar?: (id: string) => void; // 1. Nova prop adicionada aqui
    fixado?: boolean;                  
}

function CardItem({ nome, fotoBanner, info, id, eMeuPerfil, onDeletar, onFixar, onCompartilhar, fixado }: CardItemProps) {
    const navigate = useNavigate();
    const [menuAberto, setMenuAberto] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    function entrar() {
        navigate(`../paginas/ItemExpansao/${id}`);
    }

    useEffect(() => {
        function cliqueFora(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuAberto(false);
            }
        }
        document.addEventListener("mousedown", cliqueFora);
        return () => document.removeEventListener("mousedown", cliqueFora);
    }, []);

    return (
        <div className={`card_squad ${fixado ? "item-fixado" : ""}`} onClick={entrar}>

            {eMeuPerfil && (
                <div className="card-menu-container" ref={menuRef}>
                    <button 
                        className="card-btn-tres-pontos" 
                        onClick={(e) => {
                            e.stopPropagation(); // Impede de abrir a página do item ao clicar nos três pontos
                            setMenuAberto(!menuAberto);
                        }}
                    >
                        ⋮
                    </button>

                    {menuAberto && (
                        <div className="card-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                            {onFixar && (
                                <button onClick={() => { onFixar(id); setMenuAberto(false); }}>
                                    {fixado ? "Desafixar" : "Fixar Item"}
                                </button>
                            )}

                            {/* 2. NOVO BOTÃO DE COMPARTILHAR NO DROPDOWN */}
                            {onCompartilhar && (
                                <button 
                                    className="btn-compartilhar"
                                    onClick={() => { onCompartilhar(id); setMenuAberto(false); }}
                                >
                                    Compartilhar no Squad
                                </button>
                            )}

                            {onDeletar && (
                                <button 
                                    className="btn-deletar" 
                                    onClick={() => { onDeletar(id); setMenuAberto(false); }}
                                >
                                    Apagar
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            <p>{nome}</p>
            
            <div className="card_bg">
                <img src={fotoBanner} alt={nome} />
            </div>
            
            <div className="card_info">
                <p>{info}</p>
            </div>

        </div>
    );
}

export default CardItem;