
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ComparePricesPage from './pages/ComparePricesPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VendorPricesPage from './pages/VendorPricesPage'
import AdminReviewPage from './pages/AdminReviewPage'
import ShoppingListPage from './pages/ShoppingListPage'
import MealPlannerPage from './pages/MealPlannerPage'
import NotFoundPage from './pages/NotFoundPage'
import { AuthProvider } from "./context/AuthContext";


function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/compare-prices" element={<ComparePricesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/vendor/prices" element={<VendorPricesPage />} />
        <Route path="/admin/review" element={<AdminReviewPage />} />
        <Route path="/shopping-list" element={<ShoppingListPage />} />
        <Route path="/meal-planner" element={<MealPlannerPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
