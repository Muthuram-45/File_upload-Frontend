import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function InviteRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      navigate("/l-gy5n8r4v2t");
      return;
    }

    axios
      .get(`http://localhost:5000/verify-invite?token=${token}`)
      .then((res) => {
        // =====================
        // VIEW ACCESS
        // =====================
        if (res.data.access === "view") {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem(
            "user",
            JSON.stringify({
              role: "employee",
              viewOnly: true,
              isCompany: true
            })
          );

          navigate("/d-oxwilh9dy1", { replace: true });
        }

        // =====================
        // LOGIN ACCESS → COMPANY REGISTER
        // =====================
        if (res.data.access === "login" && res.data.forceCompanyRegister) {
          localStorage.setItem(
            "inviteLogin",
            JSON.stringify({
              email: res.data.email,
              company_name: res.data.company_name
            })
          );

          navigate("/cr-h2k8j5d1f5", { replace: true });
        }
      })
      .catch(() => navigate("/l-gy5n8r4v2t"));
  }, [navigate]);

  return <h3 style={{ textAlign: "center" }}>Redirecting...</h3>;
}

export default InviteRedirect;
