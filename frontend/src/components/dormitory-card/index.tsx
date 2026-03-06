'use client'

import { Card, CardFooter, Image, Button, CardHeader } from "@heroui/react";
import { IDormitory } from "@/types"


export function DormitoryCard({ dormitory }: { dormitory: IDormitory }) {
    const firstImage =
        dormitory.imageUrls?.find((url) => Boolean(url)) ??
        dormitory.images?.[0]?.imageUrl ??
        'https://placehold.co/600x400?text=Dormitory';

    const dormitoryTitle = dormitory.title ?? dormitory.name ?? 'Общежитие';

    return (
        <Card isFooterBlurred className="border-none" radius="lg">
            <Image
                alt=""
                src={dormitory.imageUrls?.[0] ?? firstImage}
                className="object-cover"
                height={300}
                width={300}
            />

            <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                <p className="text-tiny text-white/80">
                    {dormitoryTitle}
                </p>
                <Button
                    className="text-tiny text-white bg-black/20"
                    color="default"
                    radius="lg"
                    size="sm"
                    variant="flat"
                >
                    Подробнее
                </Button>
            </CardFooter>
        </Card>
    )
}
