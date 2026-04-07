import "./Perfil.css"
import type { User } from "firebase/auth";
import { useNavigate, useParams} from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

interface PerfilProps {
    usuario: User | null;
    squads: any[];
}

function Perfil({ usuario, squads }: PerfilProps) {
    const navigate = useNavigate();
    const { idUsuario } = useParams();
    const [dadosExtras, setDadosExtras] = useState<any>(null);
    const [dadosUsuarioAlvo, setDadosUsuarioAlvo] = useState<any>(null);
    const idParaBuscar = idUsuario || usuario?.uid;
    const eMeuPerfil = !idUsuario || idUsuario === usuario?.uid;
    useEffect(() => {
        if (!idParaBuscar) return;

        const unsubscribe = onSnapshot(doc(db, "usuarios", idParaBuscar), (docSnap) => {
            if (docSnap.exists()) {
                setDadosExtras(docSnap.data());
            }
        });

        return () => unsubscribe();
    }, [idParaBuscar]); // Recarrega se o ID mudar

    

    if (!idParaBuscar) return <h2>Carregando perfil...</h2>;
    const handleSair = async () => {
        try {
            await auth.signOut();
            navigate("/");
        } catch (error) {
            console.error("Erro ao sair:", error);
        }
    };

    if (!usuario) return <h2 style={{color: 'white', padding: '100px'}}>Carregando perfil...</h2>;

    return (
        <div className="perfil-container-user">
            <div className="perfil">
                <div className="perfil-header-user">
                    <div className="perfil-foto">
                        <img
                            src={dadosExtras?.fotoUrl || dadosExtras?.photoURL || "https://via.placeholder.com/150"}
                            alt="foto-user"
                            referrerPolicy="no-referrer"
                        />
                    </div>

                    <div className="perfil-bio">
                        <h1 className="perfil-nome-user">{dadosExtras?.nome || usuario.displayName}</h1>
                        {/* Agora a bio vem do banco de dados! */}
                        <h3 className="perfil-bio-text">{dadosExtras?.bio || "Recruta do Rank Over"}</h3>
                    </div>
                    

                    <div className="perfil-squad-quant">
                        {/* Contador real baseado no array de squads seguindo */}
                        <p>{dadosExtras?.squads_seguindo?.length || 0}</p>
                        <span>Squads</span>
                    </div>
                    
                    {eMeuPerfil && (
                        <>
                            <button onClick={() => navigate("/paginas/PerfilConfig")} style={{fontSize: '2.3rem', background: 'none', border: 'none', cursor: 'pointer'}}>⚙️</button>
                            <button className="perfil-sair" onClick={handleSair}>Sair</button>
                        </>
                    )}
                </div>

                <div className="perfil-posts">
                    <h3 style={{color: 'white', marginBottom: '20px'}}>Meus Squads</h3>
                    {dadosExtras?.squads_seguindo?.length > 0 ? (
                        <p style={{ color: '#ff4d00' }}>Você está em {dadosExtras.squads_seguindo.length} squads!</p>
                    ) : (
                        <p style={{ color: '#555' }}>Nenhum squad seguido ainda...</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Perfil;