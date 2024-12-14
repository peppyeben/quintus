// src/components/ui/Modal.tsx
import {
    Dialog,
    DialogContent,
    // DialogHeader,
    // DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/context/ModalContext";

export function Modal() {
    const { isOpen, closeModal, content } = useModal();

    return (
        <Dialog open={isOpen} onOpenChange={closeModal}>
            <DialogContent className="max-w-[20rem] w-full bg-[#0d0d0d] text-white shadow-lg border-none outline-none">{content}</DialogContent>
        </Dialog>
    );
}
