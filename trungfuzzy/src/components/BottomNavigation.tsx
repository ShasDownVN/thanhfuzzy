import { NavLink, useLocation } from "react-router-dom";

const items = [
  { to: "/landing", label: "Home", icon: "home" },
  { to: "/categories", label: "Categories", icon: "categories" },
  { to: "/cart", label: "Cart", icon: "bag" },
  { to: "/wishlist", label: "Wishlist", icon: "heart" },
  { to: "/profile", label: "Profile", icon: "profile" }
];

const visibleRoutes = new Set(items.map((item) => item.to));

export default function BottomNavigation() {
  const { pathname } = useLocation();
  if (!visibleRoutes.has(pathname)) return null;
  return <nav aria-label="Main navigation" className="app-bottom-nav">
    {items.map((item) => <NavLink aria-label={item.label} key={item.to} to={item.to}>
      {({ isActive }) => <><img alt="" src={`/assets/images/svg/${item.icon}${isActive ? "-fill" : ""}.svg`} /><span>{item.label}</span></>}
    </NavLink>)}
  </nav>;
}
