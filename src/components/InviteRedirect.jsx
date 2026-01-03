import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

function InviteRedirect() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const inviteToken = params.get("token");

    // ❌ Token illa → login page
    if (!inviteToken) {
      navigate("/l-gy5n8r4v2t", { replace: true });
      return;
    }

    axios
      .get(`http://localhost:5000/verify-invite?token=${inviteToken}`)
      .then((res) => {

        // ==========================
        // 🔑 LOGIN ACCESS (INVITED USER)
        // ==========================
        if (res.data.access === "login") {
          // ✅ USE INVITE TOKEN AS AUTH TOKEN
          localStorage.setItem("token", inviteToken);

          // 🔐 mark as pending login (restricted user)
          localStorage.setItem(
            "user",
            JSON.stringify({
              email: res.data.email,
              company_name: res.data.company_name,
              pendingLogin: true,   // ⭐ KEY FLAG
              isInvite: true
            })
          );

          // ✅ GO TO DASHBOARD
          navigate("/d-oxwilh9dy1", { replace: true });
          return;
        }

        // ==========================
        // 👀 VIEW ACCESS (READ ONLY)
        // ==========================
        if (res.data.access === "view") {
          // 🔐 backend generated view token
          localStorage.setItem("token", res.data.viewToken);

          localStorage.setItem(
            "user",
            JSON.stringify({
              firstName: "Viewer",
              email: res.data.email,
              company_name: res.data.company_name,
              viewOnly: true,
              isInvite: true
            })
          );

          // ✅ FILES PAGE
          navigate("/cf-2g7h9k3l5m", { replace: true });
          return;
        }

        // ❌ fallback
        navigate("/l-gy5n8r4v2t", { replace: true });
      })
      .catch((err) => {
        console.error("Invite verification failed:", err);
        navigate("/l-gy5n8r4v2t", { replace: true });
      });
  }, [navigate, params]);

  return (
    <div style={{ textAlign: "center", marginTop: "60px" }}>
      <h3>Processing your invitation…</h3>
      <p>Please wait</p>
    </div>
  );
}

export default InviteRedirect;