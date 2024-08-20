import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { createTheme } from "@mui/material/styles";
import 'bootstrap/dist/css/bootstrap.min.css';

import { ApplicationState } from "./ApplicationState";
import SignInPage from "./pages/SignInPage";
import CreateAccountPage from "./pages/CreateAccountPage";
import HomePage from "./pages/HomePage";
import EditProfilePage from "./pages/EditProfilePage";
import ExplorePage from "./pages/ExplorePage";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import InsightsPage from "./pages/InsightsPage";
import StateInfoPage from "./pages/StateInfoPage";
import Cities from "./pages/Cities";
import Listings from "./pages/Listings";

export const theme = createTheme({
  palette: {
    primary: {
      main: '#990011',
    },
    secondary: {
      main: '#FCF6F5'
    },
  },
});

export default function App() {
  return (
    <ApplicationState>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path="/" element={<SignInPage />} />
            <Route path="/create-account" element={<CreateAccountPage />} />
            <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
            <Route path="/cities">
              <Route path=":state" element={<ProtectedRoute><Cities/></ProtectedRoute>} />
            </Route>
            <Route path="/listings">
              <Route path=":city" element={<ProtectedRoute><Listings/></ProtectedRoute>} />
            </Route>
            <Route path="/insights" element={<ProtectedRoute><InsightsPage/></ProtectedRoute>} />
            <Route path="/edit-profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
            <Route path="/logout" element={<SignInPage/>} />
            <Route path="/state-info/:stateName" element={<ProtectedRoute><StateInfoPage/></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ApplicationState>
  );
}