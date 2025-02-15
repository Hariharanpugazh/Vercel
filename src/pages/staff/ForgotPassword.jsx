import React, { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import Loader from "../../layout/Loader" // Adjust the import path as necessary

const ResetPasswordSchema = Yup.object().shape({
  token: Yup.string().required("Required"),
  new_password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    .required("Required"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("new_password"), null], "Passwords must match")
    .required("Required"),
})

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"

  const handleRequestToken = async () => {
    setLoading(true)
    try {
      await axios.post(`${API_BASE_URL}/api/staff/forgot-password/`, { email })
      toast.success("Reset token sent to your email!")
      setStep(2)
    } catch (error) {
      toast.error(error.response?.data?.error || "Error sending reset token")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (values, { setSubmitting }) => {
    setLoading(true)
    try {
      await axios.post(`${API_BASE_URL}/api/staff/reset-password/`, {
        email,
        token: values.token,
        password: values.new_password,
      })
      toast.success("Password reset successful!")
      setStep(1)
      navigate("/stafflogin")
    } catch (error) {
      toast.error(error.response?.data?.error || "Error resetting password")
    } finally {
      setLoading(false)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-gray-50">
      <style>
        {`
          .error-message {
            color: #fdc500;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            font-weight: 500;
          }
        `}
      </style>
      {loading && <Loader message="Processing your request..." />}
      <ToastContainer />
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        {step === 1 ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-lg border px-4 py-2"
                placeholder="Enter your email"
              />
            </div>
            <button
              onClick={handleRequestToken}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Send Reset Token
            </button>
          </>
        ) : (
          <Formik
            initialValues={{
              token: "",
              new_password: "",
              confirm_password: "",
            }}
            validationSchema={ResetPasswordSchema}
            onSubmit={handleResetPassword}
          >
            {({ isSubmitting }) => (
              <Form>
                <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
                <div>
                  <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                    Reset Token
                  </label>
                  <Field
                    type="text"
                    id="token"
                    name="token"
                    className="mt-2 w-full rounded-lg border px-4 py-2"
                    placeholder="Enter reset token"
                  />
                  <ErrorMessage name="token" component="div" className="error-message" />
                </div>
                <div className="mt-4">
                  <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <Field
                    type="password"
                    id="new_password"
                    name="new_password"
                    className="mt-2 w-full rounded-lg border px-4 py-2"
                    placeholder="Enter new password"
                  />
                  <ErrorMessage name="new_password" component="div" className="error-message" />
                </div>
                <div className="mt-4">
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <Field
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    className="mt-2 w-full rounded-lg border px-4 py-2"
                    placeholder="Re-enter new password"
                  />
                  <ErrorMessage name="confirm_password" component="div" className="error-message" />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Reset Password
                </button>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword

