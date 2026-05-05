import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/Home";
import AuthPage from "./auth/AuthPage";
import { CartProvider } from "./context/CartContext";
import CartPage from "./pages/CartPage";
import Profile from "./pages/Profile";
import Business from "./pages/Business";
import Admin from "./pages/Admin"
import BusinessDashboard from "./pages/BusinessDashboard";
import Product from "./pages/Product";
import Style from "./pages/Style";
import ProductDetails from "./pages/ProductDetails";
import StyleDetails from "./pages/StyleDetails";
import PublicSeller from "./pages/PublicSeller";
import ChatPage from "./pages/ChatPage";
import OrderPage from "./pages/Order";
import AdminAccounts from "./pages/AdminAccouts";
import AdminOrders from "./pages/AdminOrders";
import AdminRequests from "./pages/AdminStyleRequest";
import RequestPaymentPage from "./pages/RequestPaymentPage";


function App() {
  return (
    <CartProvider>
      <Router>
        <Navbar />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/business" element={<Business />} />
          <Route path="/admin" element={<Admin />} />
          {/* <Route path="/business/dashboard" element={<BusinessDashboard />} /> */}
          {/* 🏪 VENDOR DASHBOARD */}
          <Route path="/vendor/:id" element={<Product />} />
          <Route path="/tailor/:id" element={<Style />} />

          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/style/:id" element={<StyleDetails />} />

          <Route
            path="/dashboard/business/:id"
            element={<BusinessDashboard />}
          />

          <Route path="/chat" element={<ChatPage />} />


          <Route path="/business/:businessId/public" element={<PublicSeller />} />

          <Route path="/order" element={<OrderPage />} />
          <Route path="/admin/accounts" element={<AdminAccounts />} />


          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/styles-request" element={<AdminRequests />} />
          <Route path="/request-payment" element={<RequestPaymentPage />} />

        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
