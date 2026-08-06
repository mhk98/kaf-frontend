const benefits = [
  { icon: <svg viewBox="0 0 24 24"><path d="M12 3l3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6z"/></svg>, title: "Premium quality", text: "Carefully selected products and dependable finishing." },
  { icon: <svg viewBox="0 0 24 24"><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7zM7 20a2 2 0 100-4 2 2 0 000 4zm11 0a2 2 0 100-4 2 2 0 000 4z"/></svg>, title: "Nationwide delivery", text: "Fast, trackable delivery across Bangladesh." },
  { icon: <svg viewBox="0 0 24 24"><path d="M4 7h12a4 4 0 014 4v1M8 3L4 7l4 4m12 6H8a4 4 0 01-4-4v-1m12 9l4-4-4-4"/></svg>, title: "Easy exchange", text: "Straightforward exchange support when you need it." },
  { icon: <svg viewBox="0 0 24 24"><path d="M12 3l8 4v5c0 5-3.4 8.3-8 9-4.6-.7-8-4-8-9V7l8-4zm-3 9l2 2 4-5"/></svg>, title: "Secure checkout", text: "Protected checkout with trusted payment options." },
];

export default function ServiceBenefits() {
  return (
    <section className="home-benefits" aria-label="Shopping benefits">
      <div className="home-shell home-benefits-grid">
        {benefits.map((benefit) => (
          <article key={benefit.title} className="home-benefit">
            <span className="home-benefit-icon" aria-hidden="true">{benefit.icon}</span>
            <div>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
