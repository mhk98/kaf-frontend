export default function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      style={{
        width: "min(calc(100% - var(--site-gutter, clamp(24px, 3.2vw, 56px))), var(--site-max, 1520px))",
        margin: "0 auto",
      }}
      className={className}
    >
      {children}
    </div>
  );
}
