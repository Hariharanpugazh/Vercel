import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Loader from '../../layout/Loader';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  department: Yup.string().required('Required'),
  collegename: Yup.string().required('Required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Required'),
});

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    setIsLoading(true);

    try {
      const payload = {
        name: values.name,
        email: values.email,
        department: values.department,
        collegename: values.collegename,
        password: values.password,
      };

      const response = await axios.post(`${API_BASE_URL}/api/staff/signup/`, payload);

      if (response.data.message === 'Signup successful') {
        localStorage.setItem('token', response.data.token);
        navigate('/stafflogin');
      } else {
        throw new Error(response.data.message || 'Signup failed');
      }
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Something went wrong' });
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 py-16">
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

      {isLoading && <Loader message="Creating your account..." />}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-32 -left-32 h-[450px] w-[450px] animate-pulse-slow rounded-full bg-blue-100 blur-3xl" />
        <div className="absolute top-0 right-0 h-[500px] w-[500px] animate-pulse-slow rounded-full bg-gradient-to-tr from-blue-100 to-blue-150 blur-3xl" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 mx-auto w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="w-full p-12">
          <motion.div variants={itemVariants} className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-gray-800">SNS INSTITUTIONS</h1>
            <h4 className="text-lg font-medium text-gray-600 mt-4">Create Your Account</h4>
          </motion.div>

          <Formik
            initialValues={{
              name: '',
              email: '',
              department: '',
              collegename: '',
              password: '',
              confirmPassword: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors }) => (
              <Form className="space-y-8">
                {errors.submit && (
                  <div className="mb-6 text-red-600 text-center">
                    {errors.submit}
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3 h-5 w-5 text-gray-400" />
                    <Field
                      id="name"
                      name="name"
                      type="text"
                      className="block w-full rounded-xl border border-gray-200 bg-blue-50 py-3 pl-12 pr-4 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <ErrorMessage name="name" component="div" className="error-message" />
                </div>

                <div>
                  <label htmlFor="collegename" className="mb-2 block text-sm font-medium text-gray-700">
                    College Name
                  </label>
                  <Field
                    as="select"
                    id="collegename"
                    name="collegename"
                    className="block w-full rounded-xl border border-gray-200 bg-blue-50 py-3 px-4 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Select College</option>
                    <option value="SNSCE">SNSCE</option>
                    <option value="SNSCT">SNSCT</option>
                    <option value="SNS Nursing">SNS Nursing</option>
                    <option value="SNS ARTS">SNS ARTS</option>
                    <option value="SNS Spine">SNS Spine</option>
                    <option value="SNS Pharmacy">SNS Pharmacy</option>
                    <option value="SNS Physiotherapy">SNS Physiotherapy</option>
                    <option value="SNS Health Science">SNS Health Science</option>
                    <option value="SNS Academy">SNS Academy</option>
                  </Field>
                  <ErrorMessage name="collegename" component="div" className="error-message" />
                </div>

                <div>
                  <label htmlFor="department" className="mb-2 block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <Field
                    as="select"
                    id="department"
                    name="department"
                    className="block w-full rounded-xl border border-gray-200 bg-blue-50 py-3 px-4 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Select Department</option>
                    <option value="AI & DS">AI & DS</option>
                    <option value="AI & ML">AI & ML</option>
                    <option value="IT">IT</option>
                    <option value="CSE">CSE</option>
                    <option value="CST">CST</option>
                    <option value="CSD">CSD</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECHATRONICS">MECHATRONICS</option>
                    <option value="AERO">AERO</option>
                    <option value="OTHERS">OTHERS</option>
                  </Field>
                  <ErrorMessage name="department" component="div" className="error-message" />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 h-5 w-5 text-gray-400" />
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      className="block w-full rounded-xl border border-gray-200 bg-blue-50 py-3 pl-12 pr-4 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="Enter your email address"
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className="error-message" />
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 h-5 w-5 text-gray-400" />
                    <Field
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className="block w-full rounded-xl border border-gray-200 bg-blue-50 py-3 pl-12 pr-12 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className="error-message" />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 h-5 w-5 text-gray-400" />
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      className="block w-full rounded-xl border border-gray-200 bg-blue-50 py-3 pl-12 pr-12 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="Confirm your password"
                    />
                  </div>
                  <ErrorMessage name="confirmPassword" component="div" className="error-message" />
                </div>

                <motion.div variants={itemVariants} className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 text-white bg-blue-600 rounded-xl text-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Create Account
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </button>
                </motion.div>

                <motion.p
                  variants={itemVariants}
                  className="mt-6 text-center text-xs text-gray-500"
                >
                  Already have an account?{' '}
                  <Link
                    to="/stafflogin"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Sign in here
                  </Link>
                </motion.p>
              </Form>
            )}
          </Formik>
        </div>
      </motion.div>
    </div>
  );
}
