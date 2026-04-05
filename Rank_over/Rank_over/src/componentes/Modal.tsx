import { useState } from "react";
import "./Modal.css"

function Modal({ isOpen, onClose, aoPostar }) {
    const [titulo, setTitulo] = useState("");
    const [texto, setTexto] = useState("");

    if (!isOpen) return null;

    const handleEnviar = () => {
        aoPostar(texto);
        setTexto("");
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-legenda">
                    <h3>Criar Nova Publicação</h3>
                </div>
                <div className="modal-titulo">
                     <textarea 
                        placeholder="Titulo"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                    />
                </div>

                <div className="modal-conteudo">
                    <textarea 
                        placeholder="O que está acontecendo no squad?"
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                    />
                </div>

                <div className="modal-opcoes">
                    <button onClick={handleEnviar}> Enviar </button>
                    <button onClick={onClose}> Fechar </button>
                    <button> Anexar </button>
                </div>
            </div>
        </div>
    );
}

export default Modal;