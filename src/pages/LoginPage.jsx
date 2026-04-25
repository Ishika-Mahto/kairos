import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { useAuth } from "../context/AuthContext";

const defaultValues = {
  email: "",
  password: "",
};

function LoginPage() {
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  function validate() {
    const nextErrors = {};

    if (!values.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!values.password.trim()) {
      nextErrors.password = "Password is required.";
    }

    return nextErrors;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setServerError("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);

    window.setTimeout(() => {
      const result = login(values.email, values.password);
      setLoading(false);

      if (!result.ok) {
        setServerError(result.message);
        return;
      }

      navigate(location.state?.from ?? "/dashboard", { replace: true });
    }, 700);
  }

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Reconnect with your predictive workspace and continue the next best move."
      fields={[
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "you@kairos.ai",
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      ]}
      values={values}
      errors={errors}
      loading={loading}
      submitLabel="Login"
      onChange={handleChange}
      onSubmit={handleSubmit}
      footerText="Need an account?"
      footerLinkLabel="Sign up"
      footerLinkTo="/signup"
      serverError={serverError}
    />
  );
}

export default LoginPage;
