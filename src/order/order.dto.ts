import { Type } from "class-transformer";
import { IsArray, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";

export class OrderItemDto {
    @IsInt()
    @Min(1)
    quantity: number

    @IsNumber()
    productId: number
}

export class OrderDto {
    @IsString()
    address: string

    @IsOptional()
    @IsString()
    commentary: string

    @IsNumber()
    locationId: number

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => OrderItemDto)
    items: OrderItemDto[]

    @IsString()
    deliveryDate: string

    @IsString()
    deliveryTime: string
}
