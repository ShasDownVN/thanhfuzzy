import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Cart from "./pages/Cart";
import Categories from "./pages/Categories";
import Checkout from "./pages/Checkout";
import Coupon from "./pages/Coupon";
import CreateAccount from "./pages/CreateAccount";
import EmptyCart from "./pages/EmptyCart";
import EmptyNotification from "./pages/EmptyNotification";
import EmptyOrderHistory from "./pages/EmptyOrderHistory";
import EmptySearch from "./pages/EmptySearch";
import EmptyWishlist from "./pages/EmptyWishlist";
import ForgotPassword from "./pages/ForgotPassword";
import Help from "./pages/Help";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Language from "./pages/Language";
import Login from "./pages/Login";
import ManageAddress from "./pages/ManageAddress";
import ManageDeliveryAddress from "./pages/ManageDeliveryAddress";
import ManagePayment from "./pages/ManagePayment";
import Ne from "./pages/Ne";
import NewAddress from "./pages/NewAddress";
import NewCard from "./pages/NewCard";
import Notification from "./pages/Notification";
import OrderDetails from "./pages/OrderDetails";
import OrderHistory from "./pages/OrderHistory";
import OrderTracking from "./pages/OrderTracking";
import OtherSetting from "./pages/OtherSetting";
import Otp from "./pages/Otp";
import PageListing from "./pages/PageListing";
import Payment from "./pages/Payment";
import ProductDetails from "./pages/ProductDetails";
import Product2Details from "./pages/Product2Details";
import ProfileSetting from "./pages/ProfileSetting";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import Search from "./pages/Search";
import Setting from "./pages/Setting";
import ShippingAddress from "./pages/ShippingAddress";
import Shipping from "./pages/Shipping";
import Shop from "./pages/Shop";
import TermsConditions from "./pages/TermsConditions";
import Voucher from "./pages/Voucher";
import Wishlist from "./pages/Wishlist";
import ProtectedRoute from "./components/ProtectedRoute";
import OAuthCallback from "./pages/OAuthCallback";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminUsers from "./pages/AdminUsers";
import BottomNavigation from "./components/BottomNavigation";
import { InstallAppPrompt, OfflineBanner } from "./components/PWAChrome";

function App() {
  return (
    <BrowserRouter>
      <OfflineBanner />
      <InstallAppPrompt />
      <BottomNavigation />
      <Routes>
        <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/coupon" element={<Coupon />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/empty-cart" element={<EmptyCart />} />
        <Route path="/empty-notification" element={<EmptyNotification />} />
        <Route path="/empty-order-history" element={<EmptyOrderHistory />} />
        <Route path="/empty-search" element={<EmptySearch />} />
        <Route path="/empty-wishlist" element={<EmptyWishlist />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/help" element={<Help />} />
        <Route path="/" element={<Index />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/language" element={<Language />} />
        <Route path="/login" element={<Login />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/manage-address" element={<ProtectedRoute><ManageAddress /></ProtectedRoute>} />
        <Route path="/manage-delivery-address" element={<ManageDeliveryAddress />} />
        <Route path="/manage-payment" element={<ManagePayment />} />
        <Route path="/ne" element={<Ne />} />
        <Route path="/new-address" element={<ProtectedRoute><NewAddress /></ProtectedRoute>} />
        <Route path="/new-card" element={<NewCard />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/order-details" element={<OrderDetails />} />
        <Route path="/order-history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
        <Route path="/order-tracking" element={<Navigate to="/order-history" replace />} />
        <Route path="/order-tracking/:orderId" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
        <Route path="/other-setting" element={<OtherSetting />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/page-listing" element={<PageListing />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/product-details" element={<ProductDetails />} />
        <Route path="/product-details/:productId" element={<ProductDetails />} />
        <Route path="/product2-details" element={<Product2Details />} />
        <Route path="/profile-setting" element={<ProtectedRoute><ProfileSetting /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/search" element={<Search />} />
        <Route path="/setting" element={<Setting />} />
        <Route path="/shipping-address" element={<ShippingAddress />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/voucher" element={<Voucher />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
