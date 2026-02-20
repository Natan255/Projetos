import "./Perfil.css"
import type { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";

interface PerfilProps {
    usuario: User | null;
}

function Perfil({ usuario }: PerfilProps) {
    const navigate = useNavigate();

    const handleSair = async () => {
        try {
            await auth.signOut();
            navigate("/"); // e assim que guia pra outra pagina por um botao
        } catch (error) {
            console.error("Erro ao sair:", error);
        }
    };
    return (
        <div className="perfil-container-user">
            <div className="perfil">
                <div className="perfil-header-user">
                    <div className="perfil-bio">
                        <h1 className="perfil-nome-user">{usuario.displayName}</h1>
                        <h3 className="perfil-bio-text">Pro Player de Rank Over</h3>
                    </div>

                    <div className="perfil-foto">
                        <img
                            src={usuario.photoURL}
                            alt="foto-user"
                            referrerPolicy="no-referrer"
                        />
                    </div>

                    <div className="perfil-squad-quant">
                        <p>12</p>
                    </div>

                    <button className="perfil-sair" onClick={handleSair}>Sair</button>
                </div>

                <div className="perfil-posts">
                    <p style={{ color: '#555' }}>Nenhum squad criado ainda...</p>
                </div>
            </div>
        </div>
    )
}

export default Perfil;