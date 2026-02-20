import { useState } from "react";
import { auth, provider, signInWithPopup, signInWithEmailAndPassword } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"
import "./Entrar.css"

function Entrar() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const navigate = useNavigate();


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, senha);
            console.log("Login realizado com sucesso!");
            navigate("/");
        } catch (error: any) {
            console.error("Erro ao entrar:", error.code);
            alert("E-mail ou senha incorretos.");
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, provider);
            navigate("/");
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <div className="enter-container">
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