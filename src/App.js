import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import ContestPage from './pages/staff/coding/ContestPage';
// import StartContest from './pages/staff/coding/StartContest';
import SelectTestOption from './pages/staff/coding/SelectTestOption';
// import FileUpload from './pages/staff/coding/FileUpload';
// import ManualSelectUI from './pages/staff/coding/ManualSelectUI';
// import HrUpload from './pages/staff/coding/HrUploadPage';
// import OnebyOne from './pages/staff/coding/OnebyOne';
// import ManualPage from './pages/staff/coding/ManualPage';
// import ContestDashboard from './pages/staff/coding/ContestDashboard';
import Login from './pages/staff/Login';
import Signup from './pages/staff/Signup';
import Dashboard from './pages/staff/Dashboard';
import GeneralHome from './pages/GeneralHome';
import StudentRegister from './pages/student/StudentRegister';
import StudentLogin from './pages/student/StudentLogin';
import StudentPasswordReset from './pages/student/StudentPasswordReset';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import Navbar from './pages/student/Navbar';
import StaffNavbar from './pages/staff/StaffNavbar';
import VerifyCertificate from './pages/student/VerifyCertificate'
import TestInstructions from './pages/student/TestInstruction';
import ViewContest from './pages/staff/coding/ViewContest';
import Assesment from './pages/staff/coding/Assesment';
import QuestionsLibrary from './pages/staff/coding/QuestionsLibrary';
import Questions from './pages/staff/coding/Questions';
import Library from './pages/Library';
import QuestionPreview from "./pages/staff/coding/QuestionPreview";
import QuestionDashboard from "./pages/staff/coding/QuestionDashboard";
import BulkUpload from "./pages/staff/coding/BulkUpload";
import StaffStudentProfile from './pages/staff/coding/StaffStudentProfile';
import StudentStats from './pages/staff/coding/studentstats';
import Mcq from './pages/staff/mcq/Mcq';
import McqAssement from './pages/student/student_mcq/Mcq_Assement';
import ViewTest from './pages/staff/coding/ViewTest';
import StaffProfile from './pages/staff/StaffProfile';
import Mcq_Assesment from './pages/staff/mcq/Mcq_Assesment';
import Mcq_CombinedDashboard from './pages/staff/mcq/Mcq_CombinedDashboard';
import AIGenerate from "./pages/staff/mcq/AIGenerate";
import Mcq_createQuestion from './components/staff/mcq/Mcq_createQuestion';
import Mcq_bulkUpload from './components/staff/mcq/Mcq_bulkUpload';
import Mcq_Dashboard from './pages/staff/mcq/Mcq_Dashboard';
import McqLibrary from './pages/staff/mcq/McqQuestionLibrary'
import Student_report from './pages/staff/Student_report';
import StudentResult from './pages/student/StudentResult';
import QuestionsDisplay from './pages/staff/mcq/QuestionsDisplay';
import Mcqtest from './pages/staff/mcq/McqTestLibrary';
import SelectTestQuestion from './pages/staff/mcq/McqQuestionTestLibrary';
import QuestionListPage from './pages/staff/mcq/QuestionListPage';
import ForgotPassword from './pages/staff/ForgotPassword';
import SectionBasedMcqAssessment from './pages/student/student_mcq/SectionBasedMcqAssessment';
import ScrollToTop from './ScrollToTop';
import { TestProvider } from './pages/student/TestContext';
import AddTest from './components/McqLibrary/AddTest';
import CertificateVerification from './pages/staff/mcq/CertificateVerification';
import McqDraft from './pages/staff/mcq/McqDraft';



// Layout component for wrapping student routes 
const StudentLayout = () => (
  <>
    <Navbar />
    <Outlet /> {/* Render nested routes */}
  </>
);


// Layout component for wrapping staff routes
const StaffLayout = () => (
  <>
    <StaffNavbar />
    <Outlet /> {/* Render nested routes */}
  </>
);

function App() {
  const [studentId, setStudentId] = useState(null);

  return (
    <TestProvider>
    <Router>
      <ScrollToTop />
      <Routes>
        {/* General Home */}
        <Route path="/" element={<GeneralHome />} />

        {/* Student Routes */}
        <Route path="/StudentRegister" element={<StudentRegister />} />
        <Route path="/StudentPasswordReset" element={<StudentPasswordReset />} />
        <Route path="/StudentLogin" element={<StudentLogin onLogin={setStudentId} />} />
        <Route element={<StudentLayout />}>
          <Route path="/studentdashboard" element={<StudentDashboard />} />
          <Route path="/studentprofile" element={<StudentProfile studentId={studentId} />} />
          <Route path="/result/:contestId/:studentId" element={<StudentResult  />} />
        </Route>
        <Route path="/testinstructions/:contestId" element={<TestInstructions />} />
        <Route path="/coding/:contestId" element={<ContestPage />} />
        <Route path="/mcq/:contestId" element={<McqAssement />} />
        <Route path="/section-based-mcq/:contestId" element={<SectionBasedMcqAssessment />} />

        {/* Staff Routes */}
        <Route path="/stafflogin" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/staffsignup" element={<Signup />} />
        <Route element={<StaffLayout />}>
          <Route path="/staffdashboard" element={<Dashboard />} />
          <Route path="/Staffprofile" element={<StaffProfile />} />
          <Route path="/library" element={<Library />} />
          <Route path="/coding/details" element={<Assesment />} /> {/* coding creation */}
          <Route path="/SelectTestOption" element={<SelectTestOption />} />
          <Route path="/staffstudentprofile" element={<StaffStudentProfile/>} />         
          <Route path="/:contestId/Questions" element={<Questions />} />
          <Route path="/:contestId/QuestionsLibrary" element={<QuestionsLibrary />} />          
          <Route path="/library/Mcq" element={<Mcq/>} />
          <Route path="/library/mcq/test" element={<Mcqtest/>} />
          <Route path='/library/mcq/test/addtest' element={<AddTest />} />
          <Route path="/Questions/:contestId" element={<Questions />} />
          <Route path="/QuestionsLibrary/:contestId" element={<QuestionsLibrary />} />          
          <Route path="/studentstats/:regno" element={<StudentStats />} /> 
          <Route path="/viewcontest/:contestId" element={<ViewContest />} />
          <Route path="/:contestId/question-preview" element={<QuestionPreview />} />
          <Route path="mcq/aigenerator" element={<AIGenerate />} />
          <Route path="mcq/airesponse" element={<QuestionsDisplay />} />
          <Route path="/verify" element={<CertificateVerification />} />
          <Route path="/mcqdraft" element={<McqDraft />}  />




          {/* <Route path="/coding" element={<ContestDashboard />} /> */}
          {/* <Route path="/FileUpload" element={<FileUpload />} /> */}
          {/* <Route path="/ManualSelectUI" element={<ManualSelectUI />} /> */}
          {/* <Route path="/HrUpload/:contestId" element={<HrUpload />} /> */}
          {/* <Route path="/OnebyOne" element={<OnebyOne />} /> */}
          {/* <Route path="/ManualPage/:contestId" element={<ManualPage />} /> */}
          {/* <Route path="/CreateContest" element={<CreateContest />} /> */}
          {/* <Route path="/StartContest" element={<StartContest />} /> */}
        

          <Route path="/library/coding" element={<QuestionDashboard />} />
          <Route path="/BulkUpload" element={<BulkUpload />} />
          <Route path="/viewtest/:contestId" element={<ViewTest  />} />
          <Route path="/viewtest/:contestId/:regno" element={<Student_report />} />

          {/* MCQ - routes */}
          <Route path='mcq/details' element={<Mcq_Assesment />}/>
          
          <Route path='mcq/combinedDashboard' element={<Mcq_CombinedDashboard/>}/>
          <Route path='mcq/CreateQuestion' element = {<Mcq_createQuestion/>}/>
          <Route path='mcq/bulkUpload' element={<Mcq_bulkUpload />}/>
          <Route path='mcq/QuestionsDashboard' element = {<Mcq_Dashboard/>}/>
          <Route path='mcq/McqLibrary' element = {<McqLibrary/>}/>
          <Route path='mcq/McqSectionLibrary' element = {<McqLibrary/>}/>
          <Route path='mcq/TestLibrary' element = {<SelectTestQuestion/>}/>
          <Route path='/mcq/TestLibrary/Questionlist' element={<QuestionListPage />} />



        </Route>
       
        {/* <Route path="/assessment-overview" element={<AssessmentOverview />} />
        <Route path="/test-configuration" element={<TestConfiguration />} /> */}
        {/* <Route path='/UploadType' element = {<HomeTwo/>} />
        <Route path='/QuestionsDashboard' element = {<Dashboard/>}/>
        <Route path='/BulkUpload' element = {<Upload/>}/> */}
                  {/* Certificate Verification*/}
                  <Route path="/verify-certificate/:uniqueId/" element={<VerifyCertificate/>} />
      </Routes>
    </Router>
    </TestProvider>
  );
}

export default App;