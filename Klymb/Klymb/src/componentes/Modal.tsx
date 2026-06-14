import { useState, useRef } from "react";
import "./Modal.css";

function Modal({ isOpen, onClose, aoPostar }) {
    const [titulo, setTitulo] = useState("");
    const [texto, setTexto] = useState("");
    const [imagem, setImagem] = useState(null); // Estado para guardar o arquivo da imagem
    const fileInputRef = useRef(null); // Referência para o input escondido

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImagem(e.target.files[0]);
        }
    };

    const handleAnexarClick = () => {
        fileInputRef.current?.click(); // Simula o clique no input de arquivo real
    };

    const handleEnviar = () => {
        if (titulo.trim() === "" || texto.trim() === "") {
            alert("Preencha todos os campos!");
            return;
        }
        
        // Passa o título, texto e o arquivo da imagem para a função pai
        aoPostar({ titulo, texto, imagem });
        
        // Limpa os estados
        setTitulo("");
        setTexto("");
        setImagem(null);
    };

    const handleFechar = () => {
        setTitulo("");
        setTexto("");
        setImagem(null);
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

                {/* Feedback visual de imagem anexada */}
                {imagem && (
                    <div style={{ padding: "0 20px", fontSize: "14px", color: "#4caf50" }}>
                        📸 Imagem selecionada: <strong>{imagem.name}</strong>
                    </div>
                )}

                {/* Input de arquivo real escondido */}
                <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    style={{ display: "none" }} 
                    onChange={handleFileChange}
                />

                <div className="modal-opcoes">
                    <button onClick={handleEnviar}> Enviar </button>
                    <button onClick={handleFechar}> Fechar </button>
                    <button onClick={handleAnexarClick}> 
                        {imagem ? "Alterar Foto" : "Anexar"} 
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Modal;