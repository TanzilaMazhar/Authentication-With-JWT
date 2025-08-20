import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Logout({ setUser }) {
    const navigate = useNavigate();

    useEffect(() => {
        const logoutUser = async () => {
            try {
                await api.post("/auth/logout");
            } catch (e) {
                console.error("Logout failed", e);
            } finally {
                setUser(null);
                navigate("/signin", { replace: true });
            }
        };
        logoutUser();
    }, [navigate, setUser]);

    return <div>Logging out...</div>;
}
