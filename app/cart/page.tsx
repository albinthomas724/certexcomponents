'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/modal';

const ProductCart = () => {
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<{ slug: string; name: string } | null>(null);
    const router = useRouter();

    const products = [
        { slug: 'product-one', name: 'Product One' },
        { slug: 'product-two', name: 'Product Two' },
        { slug: 'product-three', name: 'Product Three' },
    ];

    // Open the modal for a specific product
    const openProductModal = (product: { slug: string; name: string }) => {
        setSelectedProduct(product);
        setProductModalOpen(true);
        router.push(`/cart?product=${product.slug}`, { scroll: false }); // Update URL
    };

    // Close the modal and reset the URL
    const closeProductModal = () => {
        setProductModalOpen(false);
        setSelectedProduct(null);
        router.push('/cart', { scroll: false }); // Reset URL
    };

    // Open modal if a product slug is present in the URL
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const productSlug = searchParams.get('product');

        if (productSlug) {
            const product = products.find((p) => p.slug === productSlug);
            if (product) {
                setSelectedProduct(product);
                setProductModalOpen(true);
            }
        }
        // No dependencies here; we only want this to run on mount
    }, []);

    return (
        <div>
            <h1>Product Cart</h1>
            <ul>
                {products.map((product) => (
                    <li key={product.slug} style={{ marginBottom: '10px' }}>
                        <button
                            onClick={() => openProductModal(product)}
                            style={{ marginRight: '10px' }}
                        >
                            View {product.name}
                        </button>
                    </li>
                ))}
            </ul>

            {/* Product Modal */}
            {productModalOpen && selectedProduct && (
                <Modal isOpen={productModalOpen} onClose={closeProductModal}>
                    <h2>{selectedProduct.name}</h2>
                    <p>Details for: {selectedProduct.name}</p>
                    <button onClick={closeProductModal}>Close</button>
                </Modal>
            )}
        </div>
    );
};

export default ProductCart;
