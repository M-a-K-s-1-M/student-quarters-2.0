'use client'

import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { DormitoryCard } from "../dormitory-card";
import { IDormitory } from "@/types";
import { ScrollShadow } from "@heroui/react";

export function DormitoriesList() {

    const { data: dormitories } = useQuery<IDormitory[]>({
        queryKey: ['dormitories'],
        queryFn: async () => {
            const response = await axios.get('http://localhost:5000/api/dormitories');
            return response.data;
        }
    })

    console.log(dormitories);

    return (

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {dormitories?.map(dormitory => (
                <DormitoryCard key={dormitory.id} dormitory={dormitory} dormitoryId={dormitory.id} />
            ))}
        </ul>
    )
}
