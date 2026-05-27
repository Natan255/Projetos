//import "./ModalListagem.css";

interface ItemLista {
    id: string;
    nome: string;
    foto?: string; // Pode ser foto de perfil ou escudo do Squad
    subtitulo?: string; // Ex: "Relojoeiro Máster" ou "Criado em 2026"
}

interface ModalListagemProps {
    isOpen: boolean;
    onClose: () => void;
    titulo: string;
    itens: ItemLista[];
    onItemClick: (id: string) => void; // A mágica está aqui: cada tela dita o que o clique faz
}

function ModalListagem({ isOpen, onClose, titulo, itens, onItemClick }: ModalListagemProps) {
    if (!isOpen) return null;

    return (
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
                                    onClose(); // Fecha o modal após clicar
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
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default ModalListagem;