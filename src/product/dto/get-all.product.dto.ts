import { Type } from "class-transformer"
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator"

export enum EnumProductSort {
    HIGH_PRICE = 'high-price',
    LOW_PRICE = 'low-price',
    NEWEST = 'newest',
    OLDEST = 'oldest',
}

export class GetAllProductDto {
    @IsOptional()
    @IsEnum(EnumProductSort)
    sort?: EnumProductSort

    @IsOptional()
    @IsString()
    searchTerm?: string

    @Type(() => Number)
    @IsNumber()
    locationId: number

    // Пагинация опциональна: без perPage возвращаются все товары (обратная совместимость с каталогом)
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    perPage?: number
}
