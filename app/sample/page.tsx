'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import Modal from '@/components/modal';

const ProductModalPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<string | null>(null);
    const [shareLink, setShareLink] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Handle opening the modal based on the URL
    useEffect(() => {
        const productId = searchParams.get('productId');
        if (productId) {
            setIsModalOpen(true);
            setCurrentProduct(productId); // Set the current product ID
        }
    }, [searchParams]);

    // Open modal for a specific product
    const openModal = (productId: string) => {
        setIsModalOpen(true);
        setCurrentProduct(productId);
        const url = `${window.location.origin}${pathname}?productId=${productId}`;
        window.history.pushState({}, '', url); // Update the URL
    };

    // Close the modal and reset URL
    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentProduct(null);
        window.history.pushState({}, '', pathname); // Remove the query parameter
    };

    // Handle the Send button to generate a shareable link
    const generateShareLink = (productId: string) => {
        const url = `${window.location.origin}${pathname}?productId=${productId}`;
        setShareLink(url);
    };

    return (
        <div>
            <h1>Product Cart</h1>
            <ul>
                {/* Example Products */}
                {['123', '456', '789'].map((productId) => (
                    <li key={productId} style={{ marginBottom: '10px' }}>
                        <button onClick={() => openModal(productId)} style={{ marginRight: '10px' }}>
                            View Product {productId}
                        </button>
                        <button onClick={() => generateShareLink(productId)}>
                            Send
                        </button>
                    </li>
                ))}
            </ul>

            {/* Product Details Modal */}
            {currentProduct && (
                <Modal isOpen={isModalOpen} onClose={closeModal}>
                    <h2>Product Details</h2>
                    <p>Details for product ID: {currentProduct}</p>
                    <button onClick={closeModal}>Close</button>
                </Modal>
            )}

            {/* Share Link Popup */}
            {shareLink && (
                <Modal isOpen={!!shareLink} onClose={() => setShareLink(null)}>
                    <h2>Share Product Link</h2>
                    <p>Copy and share this link:</p>
                    <input className='text-black'
                        type="text"
                        value={shareLink}
                        readOnly
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                    <button onClick={() => navigator.clipboard.writeText(shareLink || '')}>
                        Copy to Clipboard
                    </button>
                    <button onClick={() => setShareLink(null)}>Close</button>
                </Modal>
            )}
        </div>
    );
};

export default ProductModalPage;
