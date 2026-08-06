import Link from "next/link";
import { Product } from "@/data/products";
import ProductCard from "./ProductCard";
import Container from "./Container";
import HorizontalCarousel from "./HorizontalCarousel";

interface ProductSectionProps {
  title: string;
  products: Product[];
  menuParam?: string;
}

export default function ProductSection({
  title,
  products,
  menuParam,
}: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="home-product-section">
      <Container>
        <div
          className="home-section-heading flex items-center justify-between"
        >
          <h2
            className="uppercase text-gray-800"
          >
            {title}
          </h2>
          <Link
            href={`/?menu=${encodeURIComponent(menuParam ?? title)}`}
            className="home-view-all"
          >
            View All
          </Link>
        </div>

        <HorizontalCarousel
          itemWidthClass="w-[calc(50%-5px)] sm:w-[calc(33.333%-7px)] lg:w-[calc(16.666%-9px)]"
          gap={10}
          autoplay
          interval={6000}
          showArrows={false}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </HorizontalCarousel>
      </Container>
    </section>
  );
}
