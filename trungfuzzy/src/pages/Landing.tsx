import HtmlBlock from "../components/HtmlBlock";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import html from "../templates/Landing.html?raw";
import type { Product } from "../types/product";
import { isFavorite, toggleFavorite } from "../services/wishlist";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character] ?? character);
}

export default function Landing() {
  const { user } = useAuth();
  const name = escapeHtml(user?.fullName.trim() || "Agasya");
  const avatar = escapeHtml(user?.avatar || "/assets/images/icons/profile.png");
  const personalizedHtml = html
    .split("Agasya!").join(`${name}!`)
    .split(
      'src="/assets/images/icons/profile.png"',
    ).join(`src="${avatar}"`);

  useEffect(() => {
    let active = true;
    const cleanups: (() => void)[] = [];
    fetch(`${API_URL}/products?limit=30`)
      .then((response) => response.json())
      .then(({ items }: { items: Product[] }) => {
        if (!active) return;
        document.querySelectorAll<HTMLElement>(".product-box .like-btn").forEach((button, index) => {
          const product = items[index];
          if (!product) return;
          button.classList.toggle("active", isFavorite(product.id));
          const handleFavorite = () => {
            const added = toggleFavorite(product);
            button.classList.toggle("active", added);
            button.classList.toggle("inactive", !added);
          };
          button.addEventListener("click", handleFavorite);
          cleanups.push(() => button.removeEventListener("click", handleFavorite));
        });
      });
    return () => {
      active = false;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [personalizedHtml]);

  return <HtmlBlock html={personalizedHtml} />;
}
