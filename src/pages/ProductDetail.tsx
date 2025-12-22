import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Minus, Plus, ChevronLeft, Check, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { allProducts } from "@/data/siteData";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";

const ProductDetail = () => {
  const { id } = useParams();
  const product = allProducts.find((p) => p.id === Number(id));
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-heading">Product not found</h1>
          <Link to="/catalog" className="text-gold hover:underline mt-4 inline-block">
            Back to catalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.title,
      price: product.newPrice,
      image: product.image,
      color: product.colors[selectedColor],
    });
  };

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-gold">Home</Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-gold">Catalog</Link>
          <span>/</span>
          <span className="text-foreground">{product.title}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary/20">
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {product.discount > 0 && (
                <span className="absolute top-4 left-4 bg-gold text-primary-foreground text-sm font-bold px-3 py-1 rounded-full">
                  -{product.discount}%
                </span>
              )}
              <button
                onClick={() =>
                  toggleFavorite({
                    id: product.id,
                    name: product.title,
                    price: product.newPrice,
                    image: product.image,
                    type: product.type,
                  })
                }
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isFavorite(product.id)
                    ? "bg-gold text-primary-foreground"
                    : "bg-card/80 backdrop-blur-sm hover:bg-gold hover:text-primary-foreground"
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite(product.id) ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === idx ? "border-gold" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">
                {product.type}
              </p>
              <h1 className="text-4xl lg:text-5xl font-heading font-bold">{product.title}</h1>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gold">{formatPrice(product.newPrice)}</span>
              {product.oldPrice > product.newPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Color Selection */}
            <div>
              <p className="font-medium mb-3">Color</p>
              <div className="flex gap-3">
                {product.colors.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(idx)}
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                      selectedColor === idx ? "border-gold scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === idx && (
                      <Check className="w-5 h-5 text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions */}
            <div className="bg-secondary/30 rounded-xl p-4">
              <p className="font-medium mb-3">Dimensions</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Width</span>
                  <p className="font-medium">{product.dimensions.width} cm</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Depth</span>
                  <p className="font-medium">{product.dimensions.depth} cm</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Height</span>
                  <p className="font-medium">{product.dimensions.height} cm</p>
                </div>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-secondary/30 rounded-lg px-4 py-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <Button
                variant="gold"
                size="xl"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/50">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto text-gold mb-2" />
                <p className="text-xs text-muted-foreground">Free Delivery</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto text-gold mb-2" />
                <p className="text-xs text-muted-foreground">2 Year Warranty</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 mx-auto text-gold mb-2" />
                <p className="text-xs text-muted-foreground">Easy Returns</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-heading font-bold mb-8">Related Products</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <Link key={item.id} to={`/product/${item.id}`} className="group">
                  <div className="aspect-square rounded-xl overflow-hidden bg-secondary/20 mb-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{item.type}</p>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-gold font-bold">{formatPrice(item.newPrice)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
