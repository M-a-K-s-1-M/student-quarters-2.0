'use client'

import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { DormitoryCard } from "../dormitory-card";
import { IDormitory } from "@/types";

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
        <ul className="flex flex-wrap gap-6 justify-center">
            {dormitories?.map(dormitory => (
                <DormitoryCard key={dormitory.id} dormitory={dormitory} />
            ))}
        </ul>
    )
}
