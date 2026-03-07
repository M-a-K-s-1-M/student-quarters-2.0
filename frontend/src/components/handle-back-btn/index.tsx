'use client'

import { Button } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function HandleBackBtn({ defaultLink }: { defaultLink?: string }) {

    const router = useRouter();

    const handleBack = () => {
        if (window.history.length > 1) {
            router.back();
            return;
        }

        router.push(defaultLink ? `/${defaultLink}` : '/');
    };

    return (
        <Button
            variant="faded"
            startContent={<ArrowLeft size={20} />}
            className="text-foreground font-medium text-base"
            onPress={handleBack}
            color="primary"
        >
            Назад
        </Button>
    )
}
