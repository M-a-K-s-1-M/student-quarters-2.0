interface ISections {
    heading: string;
    content: string;
    imageUrls?: string[];
}

interface IAdministrationGroup {
    fullName: string;
    role: string;
    description?: string;
    photoUrl?: string;
    photoUrls?: string[];
}

interface IDormitoryImage {
    id?: string;
    imageUrl: string;
}

interface IPhotoGroups {
    dormitory?: string[],
    administration?: IAdministrationGroup[],
    dormitoryLife?: string[],
    dromitoryLife?: string[],
}

export interface IDormitory {
    id: string;
    createdAt?: string;
    updatedAt?: string;

    // Current normalized fields from DB
    name?: string;
    description?: string;
    price?: string | null;
    address?: string | null;
    phone?: string | null;
    website?: string;
    images?: IDormitoryImage[];

    // Source fields imported from dormitories.json
    sourceId?: string;
    sourceUrl?: string;
    sourceTitle?: string;
    sourceSections?: ISections[];
    sourceImageUrls?: string[];
    sourcePhotoGroups?: IPhotoGroups;
    sourceExternalLinks?: string[];
    sourceUpdatedAt?: string;

    // Legacy/compat fields used in old UI code
    url?: string;
    title?: string;
    sections?: ISections[];
    imageUrls?: string[];
    photoGroups?: IPhotoGroups;
    externalLinks?: string[];
}