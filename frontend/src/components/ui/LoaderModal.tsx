// src/components/ui/LoaderModal.tsx
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLoader } from "@/context/LoaderContext";

export function LoaderModal() {
    const { isLoading } = useLoader();

    return (
        <Dialog open={isLoading} modal={true}>
            <DialogContent
                className="max-w-[20rem] z-[100] w-full bg-transparent text-white shadow-lg border-none outline-none"
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
                showCloseButton={false}
            >
                <div className="flex items-center justify-center p-4">
                    <div className="loader"></div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
