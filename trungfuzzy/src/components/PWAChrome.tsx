import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online ? null : <div className="offline-banner" role="status">Không có kết nối mạng</div>;
}

export function InstallAppPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

  useEffect(() => {
    if (isStandalone || localStorage.getItem("fuzzy-install-dismissed") === "true") return;
    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handlePrompt);
    if (isIos) setVisible(true);
    return () => window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, [isIos, isStandalone]);

  async function install() {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") setVisible(false);
      setPromptEvent(null);
      return;
    }
    if (isIos) alert('Trên Safari, nhấn nút Chia sẻ rồi chọn "Thêm vào Màn hình chính".');
  }

  function dismiss() {
    localStorage.setItem("fuzzy-install-dismissed", "true");
    setVisible(false);
  }

  if (!visible || isStandalone) return null;
  return <aside className="install-app-prompt">
    <img alt="" src="/assets/images/logo/pwa-icon.svg" />
    <div><strong>Cài đặt Fuzzy</strong><p>Thêm ứng dụng vào màn hình chính để mở nhanh và dùng khi offline.</p></div>
    <button className="install-action" onClick={install} type="button">Cài đặt</button>
    <button aria-label="Đóng" className="install-close" onClick={dismiss} type="button">×</button>
  </aside>;
}
