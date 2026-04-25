import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { useAuth } from "../context/AuthContext";

const defaultValues = {
  name: "",
  email: "",
  password: "",
};

function SignupPage() {
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  function validate() {
    const nextErrors = {};

    if (!values.name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!values.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!values.password.trim()) {
      nextErrors.password = "Password is required.";
    } else if (values.password.trim().length < 6) {
      nextErrors.password = "Use at least 6 characters.";
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
      const result = signup(values);
      setLoading(false);

      if (!result.ok) {
        setServerError(result.message);
        return;
      }

      navigate("/dashboard", { replace: true });
    }, 900);
  }

  return (
    <AuthCard
      title="Create Account"
      subtitle="Open your KAIROS workspace and start training a more accurate future signal."
      fields={[
        {
          name: "name",
          label: "Name",
          type: "text",
          placeholder: "Your full name",
        },
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
          placeholder: "Create a secure password",
        },
      ]}
      values={values}
      errors={errors}
      loading={loading}
      submitLabel="Sign Up"
      onChange={handleChange}
      onSubmit={handleSubmit}
      footerText="Already registered?"
      footerLinkLabel="Login"
      footerLinkTo="/login"
      serverError={serverError}
    />
  );
}

export default SignupPage;
