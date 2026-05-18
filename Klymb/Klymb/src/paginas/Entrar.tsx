import { useState } from "react";
import { setDoc, doc } from "firebase/firestore";
import { db, auth, provider, signInWithPopup, signInWithEmailAndPassword } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"
import "./Entrar.css"
import AlertaMsg from "../componentes/AlertaMsg";

function Entrar() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [mostrarSucesso, setMostrarSucesso] = useState(false);
    const navigate = useNavigate();


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, senha);
            navigate("/");
        } catch (error: any) {
            setMostrarSucesso(true)
        }
    };

    const handleGoogleLogin = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        await setDoc(doc(db, "usuarios", user.uid), {
            nome: user.displayName,
            email: user.email,
            bio: "Recruta do Rank Over",
            squads_admin: [],
            squads_mode: [],
            squads_seguindo: [], 
            fotoUrl: user.photoURL,
            criadoEm: new Date()
        }, { merge: true });

        // 3. Só depois de salvar tudo, navega para a Home
        navigate("/");
        
    } catch (error) {
        console.error("Erro no login Google:", error);
    }
};
    return (
        
        <div className="enter-container">
            {mostrarSucesso && (
                <AlertaMsg 
                    MsgTitulo="Erro :(" 
                    Msg={`Email ou senha incorreto`} 
                   fechar={() => setMostrarSucesso(false)}
                />
            )}
            <div className="auth-card">
                <div className="auth-title">
                    <h1>Entre no Rank Over</h1>
                </div>

                <form className="auth-form" onSubmit={handleLogin}>
                    <input className="auth-input" type="email" placeholder="E-mail" onChange={(e) => setEmail(e.target.value)}/>
                    <input className="auth-input" type="password" placeholder="Senha" onChange={(e) => setSenha(e.target.value)} />

                    <button type="submit" className="btn-submit-enter">
                        Entrar
                    </button>
                </form>

                <div className="Entre_google">
                    <p>Ou entre com</p>
                    <button className="btn-google-enter" onClick={handleGoogleLogin}>
                        <img
                            src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
                            alt="Google"
                            className="google-icon"
                        />
                        Google
                    </button>
                </div>
                <div className="auth-jump">
                    <p>Caso não tenha conta, <Link to="/paginas/Cadastrar">cadastre-se aqui</Link></p>
                </div>
            </div>

        </div>
    )
}
export default Entrar