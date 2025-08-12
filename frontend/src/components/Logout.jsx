import { useEffect } from "react";
import Swal from "sweetalert2";

const Logout = () => {
  useEffect(() => {
    // Clear stored user data
    localStorage.removeItem("token");
    localStorage.removeItem("data");

    Swal.fire({
      title: "Success!!",
      text: "Logout from your account",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      // Force full site reload to signin page
      window.location.href = "/signin";
    });
  }, []);

  return (
    <div className="logout-container">
      <h2>Logging out...</h2>
    </div>
  );
};

export default Logout;
