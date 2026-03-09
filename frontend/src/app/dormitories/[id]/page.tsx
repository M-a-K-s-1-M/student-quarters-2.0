'use client'

import { FavoriteDormitoryBtn } from "@/components"
import { $api } from "@/config"
import { IDormitory } from "@/types"
import { Card, Image } from "@heroui/react"
import { useQuery } from "@tanstack/react-query"
import { MapPin, Star } from "lucide-react"
import { useParams } from "next/navigation"

export default function DormitoryPage() {
    const params = useParams<{ id: string }>()
    const dormitoryId = params.id

    const { data: dormitory, isLoading } = useQuery<IDormitory>({
        queryKey: ['dormitory', dormitoryId],
        queryFn: async () => {
            const res = await $api.get(`/dormitories/${dormitoryId}`)
            return res.data
        }
    })

    // console.log(dormitory);

    return (
        <section className="w-full">
            <Card
                className="w-full 
                transition-height duration-300 ease-in-out
                overflow-hidden mb-8"
                shadow="lg"
                isDisabled={isLoading}
            >

                <div className="absolute top-0 right-0 p-2">
                    <FavoriteDormitoryBtn />
                </div>

                <img
                    src={dormitory?.images?.[0]?.imageUrl}
                    alt={dormitory?.name ?? 'Общежитие'}
                    className="w-full h-70 sm:h-85 md:h-100
                    object-cover transition-height duration-300 ease-in-out"
                />

                <div className="absolute bottom-0 left-0 p-6">
                    <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{dormitory?.name}</h1>

                    <p className="flex items-center gap-1 p-2 md:p-3 text-base sm:text-medium md:text-xl font-semibold text-white bg-white/20 dark:bg-black/20
                     backdrop-blur-md w-fit rounded-full"
                    >
                        <Star size={24} className="text-yellow-400" /> 4.8 <span className='font-light text-xs md:text-lg text-white/70'>(123 отзывов)</span>
                    </p>
                </div>
            </Card>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <div className='grid grid-cols-3 gap-5 mb-5'>
                        <div className="p-3 backdrop-blur-md bg-white/20 dark:bg-black/20 shadow-xl rounded-xl
                        border-1 border-white/20 border-solid">
                            <h2 className="flex gap-1 text-base text-black/50 text-bold"><MapPin size={22} /> Адрес</h2>

                            <p>{dormitory?.address !== 'ул' ? dormitory?.address : 'Адрес не указан'}</p>
                        </div>

                        <div className="p-3 backdrop-blur-md bg-white/20 dark:bg-black/20 shadow-xl rounded-xl
                        border-1 border-white/80 border-solid">
                            <h2>Цена</h2>
                        </div>

                        <div className="p-3 backdrop-blur-md bg-white/20 dark:bg-black/20 shadow-xl rounded-xl
                        border-1 border-white/80 border-solid">
                            <h2>Вместимость</h2>
                        </div>
                    </div>
                </div>

                <div>
                    sdf
                </div>
            </div>
        </section>
    )
}
