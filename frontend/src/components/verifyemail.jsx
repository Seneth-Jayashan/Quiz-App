import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/axios";

const VerifyEmail = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Verifying your email...");
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/user/verify/${token}`);
        const data = res.data;

        setMessage(data?.message || "Email verified successfully!");
        setLoading(false);

        await Swal.fire({
          title: "Success!",
          text: data?.message || "Your email has been verified successfully.",
          icon: "success",
          confirmButtonColor: "#2563eb",
        });

        navigate("/signin");
      } catch (error) {
        console.error("Verification error:", error);
        setMessage("Invalid or expired token");
        setLoading(false);

        await Swal.fire({
          title: "Error!",
          text: "Invalid or expired token. Please request a new verification link or contact support.",
          icon: "error",
          confirmButtonColor: "#dc2626",
        });

        navigate("/verification");
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className=" shadow-lg rounded-xl p-8 max-w-md w-full text-center">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
              <p className="text-gray-600 text-lg">{message}</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
              <p className="text-gray-700">{message}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
