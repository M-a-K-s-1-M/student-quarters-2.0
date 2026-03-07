'use client'

import { Card, CardFooter, Image } from "@heroui/react";
import { IDormitory } from "@/types"
import { MapPin } from "lucide-react";
import { StartsBlock } from "./ui/stars-block";
import { useRouter } from "next/navigation";


export function DormitoryCard({ dormitory }: { dormitory: IDormitory }) {
    const router = useRouter();

    const firstImage =
        dormitory.images?.find((image) => Boolean(image?.imageUrl))?.imageUrl ??
        dormitory.sourceImageUrls?.find((url) => Boolean(url)) ??
        dormitory.imageUrls?.find((url) => Boolean(url)) ??
        dormitory.sourcePhotoGroups?.dormitory?.[0] ??
        dormitory.photoGroups?.dormitory?.[0] ??
        'https://placehold.co/600x400?text=Dormitory';

    const dormitoryTitle = dormitory.sourceTitle ?? dormitory.title ?? dormitory.name ?? 'Общежитие';

    const dormitoryAddress = dormitory.address === 'ул' ? 'Адрес отсутствует' : dormitory.address ?? 'Адрес отсутствует';

    const dormitoryDescription =
        dormitory.description ??
        'Описание отсутствует';

    return (
        <Card
            isBlurred
            className="border-none backdrop-blur-2xl shadow-2xl hover:scale-105"
            isPressable
            radius="lg"
            onPress={() => router.push(`/dormitories/${dormitory.id}`)}
        >
            <div className="absolute top-3 right-5 z-10">
                <StartsBlock />
            </div>

            <Image
                alt={`Фото общежития ${dormitoryTitle}`}
                src={firstImage}
                className="object-cover z-0 h-100 min-w-80"
                isZoomed
            />

            <CardFooter className="absolute text-start z-10 block bottom-0 w-full bg-white/20 dark:bg-black/20 backdrop-blur-md px-7">
                <h2 className="text-xl font-semibold text-white mb-2">
                    {dormitoryTitle}
                </h2>

                <p className="text-base text-white flex gap-1 mb-3 items-start">
                    <MapPin className="block w-fit " size={22} />
                    {dormitoryAddress}
                </p>

                <p className="text-white text-base truncate mb-5">{dormitoryDescription}</p>

                <div className="flex items-center justify-between">
                    <p className="text-white font-semibold text-base">{dormitory.price ? `${dormitory.price} руб./мес.` : 'Цена не указана'}</p>
                    <p className="text-neutral-200 text-sm">122 отзывов</p>
                </div>
            </CardFooter>
        </Card>
    )
}
