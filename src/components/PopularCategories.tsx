import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  segment: string;
  parentId: string | null;
  status: "active" | "hidden" | "disabled";
  order: number;
  showOnWebsite: boolean;
  showInNavbar: boolean;
  featured: boolean;
  allowProducts: boolean;
  productCount: number;
  imageUrl?: string;
};

type CategoriesResponse = {
  success: boolean;
  data: {
    items: CategoryItem[];
  };
};

const API_BASE = "http://localhost:5000/api";

// ✅ set current website segment here
const WEBSITE_SEGMENT: "all" | "luxury" = "luxury";

// ✅ fallback images if category.imageUrl is empty
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?auto=format&fit=crop&w=900&q=60",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=60",
  "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=900&q=60",
  "https://images.unsplash.com/photo-1616627981919-1e0a2de1f6d1?auto=format&fit=crop&w=900&q=60",
];

async function apiGet<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    signal,
  });

  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return (await res.json()) as T;
}

const PopularCategories = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await apiGet<CategoriesResponse>(
          `${API_BASE}/admin/categories?segment=all&status=all&level=all&sort=order&page=1&limit=200`,
          ac.signal
        );

        setItems(res?.data?.items || []);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setErr("Failed to load categories");
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  const allowedSegments = useMemo(() => {
    if (WEBSITE_SEGMENT === "all") return ["all"];
    return ["all", WEBSITE_SEGMENT];
  }, []);

  const popularParents = useMemo(() => {
    const filtered = (items || []).filter((c) => {
      const seg = String(c.segment || "all").toLowerCase();
      return (
        c.parentId === null &&
        c.status === "active" &&
        c.showOnWebsite === true &&
        allowedSegments.includes(seg)
      );
    });

    filtered.sort((a, b) => {
      const fa = a.featured ? 1 : 0;
      const fb = b.featured ? 1 : 0;
      if (fb !== fa) return fb - fa;
      return (a.order ?? 0) - (b.order ?? 0);
    });

    return filtered.slice(0, 10);
  }, [items, allowedSegments]);

  const pickImage = (c: CategoryItem, index: number) => {
    const url = (c.imageUrl || "").trim();
    if (url) return url;
    return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-r from-[#3b2a12] via-[#8b6b2e] to-[#3b2a12] text-[#f8f3e7]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-[#f8f3e7] tracking-wide">
            Popular Categories
          </h2>

          <div className="hidden md:flex gap-2">
            <Button
              variant="icon"
              size="icon"
              onClick={() => scroll("left")}
              className="bg-[#2b1d0e]/70 border border-[#ffd76a]/30 text-[#f8f3e7] hover:bg-[#3b2a12] hover:text-[#ffd76a]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <Button
              variant="icon"
              size="icon"
              onClick={() => scroll("right")}
              className="bg-[#2b1d0e]/70 border border-[#ffd76a]/30 text-[#f8f3e7] hover:bg-[#3b2a12] hover:text-[#ffd76a]"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-[#ffd76a]/20 bg-[#2b1d0e]/40 p-6 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#ffd76a]" />
            <p className="text-sm text-[#f8f3e7]/80">Loading categories...</p>
          </div>
        ) : err ? (
          <div className="rounded-xl border border-[#ffd76a]/20 bg-[#2b1d0e]/40 p-6">
            <p className="text-sm text-[#f8f3e7]/80">{err}</p>
          </div>
        ) : popularParents.length === 0 ? (
          <div className="rounded-xl border border-[#ffd76a]/20 bg-[#2b1d0e]/40 p-6">
            <p className="text-sm text-[#f8f3e7]/80">No categories to show.</p>
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {popularParents.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-64 lg:w-72 snap-start group"
              >
                <Link to={`/catalog/${category.slug}`} className="block cursor-pointer">
                  <div className="relative overflow-hidden rounded-xl aspect-[4/5] border border-[#ffd76a]/20 group-hover:border-[#ffd76a]/50 transition-all duration-300 shadow-lg">
                    <img
                      src={pickImage(category, index)}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#2b1d0e]/95 via-[#3b2a12]/40 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="rounded-lg bg-[#2b1d0e]/45 backdrop-blur-sm border border-[#ffd76a]/20 px-4 py-3">
                        <h4 className="text-lg font-semibold text-[#f8f3e7] tracking-wide">
                          {category.name}
                        </h4>

                        {category.productCount > 0 && (
                          <p className="text-sm text-[#ffd76a] mt-1">
                            {category.productCount} Products
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularCategories;