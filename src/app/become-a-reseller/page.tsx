"use client";
import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import Header from "@/components/Header";
import Footer from "@/components/KafFooter";
import FloatingContact from "@/components/FloatingContact";
import MarqueeBanner from "@/components/MarqueeBanner";
import { fetchSiteSettings, type SiteSetting } from "@/services/settingService";
import { registerReseller } from "@/services/resellerService";

const PRIMARY = "#073763";
const SECONDARY = "#10B8C4";

const inputStyle: CSSProperties = {
  width: "100%",
  height: 46,
  borderRadius: 8,
  border: "1px solid #d1d5db",
  padding: "0 14px",
  fontSize: 14,
  outline: "none",
  color: "#111827",
  background: "#fff",
};

export default function BecomeAResellerPage() {
  const [settings, setSettings] = useState<Partial<SiteSetting> | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchSiteSettings()
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  function validate() {
    if (!name.trim()) return "আপনার নাম দিন";
    if (!/^01\d{9}$/.test(phone.trim())) return "সঠিক ১১ ডিজিটের ফোন নম্বর দিন";
    if (!address.trim()) return "আপনার ঠিকানা দিন";
    return "";
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setLoading(true);
    try {
      await registerReseller({ name: name.trim(), phone: phone.trim(), address: address.trim() });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "আবেদন পাঠানো যায়নি, আবার চেষ্টা করুন");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <MarqueeBanner text={settings?.marqueeText ?? null} />
      <Header logoUrl={settings?.logoUrl ?? null} />

      <main className="flex-1 py-10">
        <div style={{ width: "90%", maxWidth: 640, margin: "0 auto" }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1f2937", marginBottom: 4 }}>
            Become a Reseller
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 28 }}>
            আমাদের সাথে reseller হিসেবে যুক্ত হতে নিচের ফর্মটি পূরণ করুন। আপনার তথ্য পাওয়ার পর আমাদের টিম আপনার সাথে যোগাযোগ করবে।
          </p>

          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 28,
              boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            }}
          >
            {submitted ? (
              <div style={{ textAlign: "center", padding: "24px 8px" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "#ecfdf5",
                    color: "#16a34a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    fontSize: 28,
                  }}
                >
                  ✓
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
                  আপনার আবেদন জমা হয়েছে
                </h2>
                <p style={{ fontSize: 14, color: "#6b7280" }}>
                  ধন্যবাদ! আমাদের টিম শীঘ্রই আপনার দেওয়া নম্বরে যোগাযোগ করবে।
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {error && (
                  <div
                    style={{
                      background: "#fef2f2",
                      color: "#dc2626",
                      borderRadius: 8,
                      padding: "10px 14px",
                      fontSize: 13,
                    }}
                  >
                    {error}
                  </div>
                )}
                <label style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    আপনার নাম
                  </span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="পূর্ণ নাম লিখুন"
                    style={inputStyle}
                  />
                </label>
                <label style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    ফোন নম্বর
                  </span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    inputMode="numeric"
                    style={inputStyle}
                  />
                </label>
                <label style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    ঠিকানা
                  </span>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন"
                    rows={3}
                    style={{ ...inputStyle, height: "auto", padding: "12px 14px", resize: "vertical" }}
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    height: 48,
                    borderRadius: 8,
                    border: "none",
                    background: loading ? "#9ca3af" : PRIMARY,
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "পাঠানো হচ্ছে..." : "আবেদন পাঠান"}
                </button>
              </form>
            )}
          </div>

          <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 16, textAlign: "center" }}>
            কোনো প্রশ্ন থাকলে{" "}
            <a href="/contact" style={{ color: SECONDARY, fontWeight: 700 }}>
              যোগাযোগ পেইজ
            </a>{" "}
            দেখুন।
          </p>
        </div>
      </main>

      <Footer settings={settings} />
      <FloatingContact settings={settings} />
    </div>
  );
}
