import { createPortal } from "react-dom";
import "./ModalListagemComp.css";

interface ItemLista {
    id: string;
    nome: string;
    foto?: string;
    subtitulo?: string;
}

interface ModalListagemProps {
    isOpen: boolean;
    onClose: () => void;
    titulo: string;
    itens: ItemLista[];
    onItemClick: (id: string) => void;
}

function ModalListagem({ isOpen, onClose, titulo, itens, onItemClick }: ModalListagemProps) {
    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{titulo}</h3>
                    <button className="btn-fechar" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {itens.length === 0 ? (
                        <p className="modal-vazio">Nenhum item encontrado.</p>
                    ) : (
                        itens.map((item) => (
                            <div 
                                key={item.id} 
                                className="modal-item-linha" 
                                onClick={() => {
                                    onItemClick(item.id);
                                    console.log("Clicou no item com ID:", item.id);
                                    onClose();
                                }}
                            >
                                <img 
                                    src={item.foto || "https://via.placeholder.com/150"} 
                                    alt={item.nome} 
                                    className="modal-item-foto"
                                />
                                <div className="modal-item-info">
                                    <p className="modal-item-nome">{item.nome}</p>
                                    {item.subtitulo && <span className="modal-item-sub">{item.subtitulo}</span>}
                                </div>

                                <div className="modal-item-acao">
                                    <button>Compartilhar</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

export default ModalListagem;