
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { ProtectedRoute } from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout'; // Import AdminLayout
import UserLayout from './layouts/UserLayout';
import Auth from './pages/Auth';
import UpdatePassword from './pages/UpdatePassword';
import Home from './pages/Home'; // Import the new Home component
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import UserAttendance from './pages/UserAttendance';
import Scanner from './pages/Scanner';
import Users from './pages/Users';
import Attendance from './pages/Attendance';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
      <Toaster position="bottom-center" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/users" element={<Users />} />
            <Route path="/attendance" element={<Attendance />} />
          </Route>
        </Route>

        {/* User Routes */}
        {/* <Route element={<ProtectedRoute allowedRoles={['user', 'student', 'teacher']} />}> */}
          <Route element={<UserLayout />}>
            <Route path="/me" element={<Profile />} />
            <Route path="/me/attendance" element={<UserAttendance />} />
          </Route>
        {/* </Route> */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
