import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Login.css"
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../data/translations";

export default function Login({ setIsLoggedIn }) {
    const { lang } = useLanguage();
    const t = translations[lang];

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()
    const handlelogin = (e) => {
        e.preventDefault()
        if (email === "" || password === "") {
            setError(t.fillFields)
            return
        }
        if (email === "admin@gmail.com" && password === "admin") {
            setIsLoggedIn(true)
            navigate("/dashboard")
        } else {
            setError(t.invalidLogin)
        }
    }
    return (
        <div className="login-page">
            <div className="login-card">
                <h2>{t.loginTitle}</h2>
                <form onSubmit={handlelogin}>
                    <div>
                        <label>{t.email}</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@gmail.com" />
                    </div>
                    <div>
                        <label>{t.password}</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="admin" />
                    </div>
                    <button type="submit">{t.signIn}</button>
                    <div>
                        {error && <p className="error-p">{error}</p>}
                    </div>
                </form>
            </div>
        </div>
    )
}