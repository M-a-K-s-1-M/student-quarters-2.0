'use client'

import { $api } from "@/config"
import { IDormitory } from "@/types"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"

export default function DormitoryPage() {
    const params = useParams<{ id: string }>()
    const dormitoryId = params.id

    const { data: dormitory } = useQuery<IDormitory>({
        queryKey: ['dormitory', dormitoryId],
        queryFn: async () => {
            const res = await $api.get(`/dormitories/${dormitoryId}`)
            return res.data
        }
    })

    console.log(dormitory);

    return (
        <section>
            <h1 className="text-3xl font-bold mb-6">Общежитие #{dormitoryId}</h1>
        </section>
    )
}
