interface ISections {
    heading: string;
    content: string;
}

interface IDormitoryImage {
    imageUrl: string;
}

export interface IDormitory {
    id: string;
    url?: string;
    title?: string;
    name?: string;
    sections?: ISections[];
    imageUrls?: string[];
    images?: IDormitoryImage[];
    externalLinks?: string[];
    updatedAt?: string;

}