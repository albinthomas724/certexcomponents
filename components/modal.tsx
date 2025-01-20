const Modal = ({
    isOpen,
    onClose,
    children,
}: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <button className="close-button" onClick={onClose}>
                    ✖
                </button>
                {children}
                <style jsx>{`
                    .modal-backdrop {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.5);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .modal {
                        position: relative;
                        background: black;
                        color: white;
                        padding: 20px;
                        border-radius: 5px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        max-width: 500px;
                        width: 100%;
                    }
                    .close-button {
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: none;
                        border: none;
                        font-size: 18px;
                        cursor: pointer;
                        color: white;
                    }
                    .close-button:hover {
                        color: gray;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default Modal;
