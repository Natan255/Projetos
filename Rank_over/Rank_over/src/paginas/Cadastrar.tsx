import "./Cadastrar.css"
import { auth, provider, signInWithPopup } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


function Cadastrar() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const navigate = useNavigate();

    // Função para Cadastro com E-mail e Senha
    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            console.log("Usuário criado:", userCredential.user);
            navigate("/"); // Sucesso! Vai para a Home
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                alert("Este e-mail já está sendo usado por outra conta!");
            } else if (error.code === 'auth/invalid-email') {
                alert("O formato do e-mail é inválido.");
            } else if (error.code === 'auth/weak-password') {
                alert("A senha precisa ter pelo menos 6 caracteres.");
            } else {
                alert("Erro ao criar conta: " + error.message);
            }
        }
    };

    // Função para o Google (mesma lógica do Entrar)
    const handleGoogleSignup = async () => {
        try {
            await signInWithPopup(auth, provider);
            navigate("/");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-title">
                    <h1>Cadastre-se no Rank Over</h1>
                </div>

                <form className="auth-form" onSubmit={handleEmailSignup} >
                    <input className="auth-input" type="text" placeholder="Nome de usuário" />
                    <input className="auth-input" type="email" placeholder="e-mail" onChange={(e) => setEmail(e.target.value)} />
                    <input className="auth-input" type="password" placeholder="Crie uma senha" />
                    <input className="auth-input" type="password" placeholder="Confirme a senha" onChange={(e) => setSenha(e.target.value)} />

                    <button type="submit" className="btn-submit-auth">
                        Criar Conta
                    </button>
                </form>

                <div className="Cadastro_google">
                    <p>Ou continue com</p>
                    <button className="btn-google-auth" onClick={handleGoogleSignup}>
                        <img
                            src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
                            alt="Google"
                            className="google-icon"
                        />
                        Google
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Cadastrar;