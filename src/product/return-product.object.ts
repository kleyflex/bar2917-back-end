import { Prisma } from "@prisma/client";
import { returnCategoryObject } from "src/category/return-category.object";


export const productReturnObject: Prisma.ProductSelect = {
    id: true,
    name: true,
    slug: true,
    description: true,
    image: true,
    weight: true,
    isActive: true,
    createdAt: true,
    category: { select: returnCategoryObject },
    locations: {
        select: {
            price: true,
            isAvailable: true,
            location: {
                select: {
                    id: true,
                    name: true,
                    address: true
                }
            }
        }
    }
}
