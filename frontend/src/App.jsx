import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import StarBackground from '@/components/ui/StarBackground';
import SplashScreen from '@/components/ui/SplashScreen';

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout';
import ParentLayout from '@/layouts/ParentLayout';

// Pages — lazy loaded for fast initial load
const Landing = lazy(() => import('@/pages/Landing'));
const Login = lazy(() => import('@/pages/Login'));

// Dashboard pages
const DashboardOverview = lazy(() => import('@/pages/dashboard/Overview'));
const Tracker = lazy(() => import('@/pages/dashboard/Tracker'));
const Homework = lazy(() => import('@/pages/dashboard/Homework'));
const Notes = lazy(() => import('@/pages/dashboard/Notes'));
const Projects = lazy(() => import('@/pages/dashboard/Projects'));
const Attendance = lazy(() => import('@/pages/dashboard/Attendance'));
const Burnout = lazy(() => import('@/pages/dashboard/Burnout'));
const Productivity = lazy(() => import('@/pages/dashboard/Productivity'));
const Achievements = lazy(() => import('@/pages/dashboard/Achievements'));
const Reports = lazy(() => import('@/pages/dashboard/Reports'));
const Profile = lazy(() => import('@/pages/dashboard/Profile'));
const About = lazy(() => import('@/pages/dashboard/About'));

// Parent pages
const ParentDashboard = lazy(() => import('@/pages/parent/Dashboard'));
const ParentHomework = lazy(() => import('@/pages/parent/Homework'));
const ParentProjects = lazy(() => import('@/pages/parent/Projects'));
const ParentReportCards = lazy(() => import('@/pages/parent/ReportCards'));

function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', color: 'var(--text-dim)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid rgba(255, 215, 0, 0.1)',
        borderTopColor: '#FFD700',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );
}

export default function App() {
  return (
    <>
      <StarBackground />
      <SplashScreen />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* Dashboard routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="tracker" element={<Tracker />} />
              <Route path="homework" element={<Homework />} />
              <Route path="notes" element={<Notes />} />
              <Route path="projects" element={<Projects />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="burnout" element={<Burnout />} />
              <Route path="productivity" element={<Productivity />} />
              <Route path="achievements" element={<Achievements />} />
              <Route path="reports" element={<Reports />} />
              <Route path="profile" element={<Profile />} />
              <Route path="about" element={<About />} />
            </Route>

            {/* Parent routes */}
            <Route path="/parent" element={<ParentLayout />}>
              <Route index element={<ParentDashboard />} />
              <Route path="homework" element={<ParentHomework />} />
              <Route path="projects" element={<ParentProjects />} />
              <Route path="reportcards" element={<ParentReportCards />} />
            </Route>
          </Routes>
        </Suspense>
      </div>
    </>
  );
}
