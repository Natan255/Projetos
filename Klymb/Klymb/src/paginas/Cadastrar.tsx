import "./Cadastrar.css"
import { auth, provider, signInWithPopup, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { use, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore"; // Importe estas funções


function Cadastrar() {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [senhadef, setSenhaDef] = useState("")
    const [erro, setErro] = useState("");
    const navigate = useNavigate();


    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (senha !== senhadef) {
                setErro("As senhas não coincidem! Verifique e tente novamente.");
                return;
            }

            if (senha.length < 5){
                setErro("A senha precisa ter pelo menos 5 caracteres.");
                return;
            }
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            const user = userCredential.user;
            await setDoc(doc(db, "usuarios", user.uid), {
                nome: nome,
                email: email,
                bio: "Recruta do Rank Over",
                squads_admin: [],
                squads_mode:[],
                squads_seguindo: [],
                fotoUrl: `https://ui-avatars.com/api/?name=${nome}&background=ff4d00&color=fff`,
                criadoEm: new Date()
            }, { merge: true });
            await updateProfile(user, {
                displayName: nome,
                photoURL: `https://ui-avatars.com/api/?name=${nome}&background=ff4d00&color=fff`
            });
                navigate("/");

        } catch (error: any) {
            
            if (error.code === 'auth/email-already-in-use') {
                setErro("Este e-mail já está sendo usado por outra conta!");
            } else if (error.code === 'auth/invalid-email') {
                setErro("O formato do e-mail é inválido.");
            } else if (error.code === 'auth/weak-password') {
                setErro("A senha precisa ter pelo menos 6 caracteres no Firebase.");
            } else {
                setErro("Erro ao criar conta: " + error.message);
            }
        }
    };

    const handleGoogleSignup = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Cria ou atualiza o perfil no banco
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

            navigate("/");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-title">
                    <h1>Cadastre-se no Klymb</h1>
                </div>

                {erro && <div className="auth-error-message">{erro}</div>}

                <form className="auth-form" onSubmit={handleEmailSignup} >
                    <input className="auth-input" type="text" placeholder="Nome de usuário" onChange={(e) => setNome(e.target.value)} />
                    <input className="auth-input" type="email" placeholder="E-mail" onChange={(e) => setEmail(e.target.value)} />
                    <input className="auth-input" type="password" placeholder="Crie uma senha" onChange={(e) => setSenha(e.target.value)} />
                    <input className="auth-input" type="password" placeholder="Confirme a senha" onChange={(e) => setSenhaDef(e.target.value)} />

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