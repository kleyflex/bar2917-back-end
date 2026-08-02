import { Type } from 'class-transformer';
import { IsIn, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

class AmountPayment {
    @IsString()
    value: string

    @IsString()
    currency: string
}

class PaymentMetadata {
    @IsOptional()
    @IsString()
    orderId?: string
}

class ObjectPayment {
    @IsString()
    id: string

    @IsString()
    status: string

    @ValidateNested()
    @Type(() => AmountPayment)
    amount: AmountPayment

    @IsOptional()
    @IsObject()
    payment_method?: {
        type: string
        id: number
        saved: boolean
        title: string
        card: object
    }

    @IsOptional()
    @IsString()
    created_at?: string

    @IsOptional()
    @IsString()
    expires_at?: string

    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @ValidateNested()
    @Type(() => PaymentMetadata)
    metadata?: PaymentMetadata
}

export class PaymentStatusDto {
    @IsIn(['payment.succeeded', 'payment.waiting_for_capture', 'payment.canceled', 'refund.succeeded'])
    event:
    | 'payment.succeeded'
    | 'payment.waiting_for_capture'
    | 'payment.canceled'
    | 'refund.succeeded'

    @IsString()
    type: string

    @ValidateNested()
    @Type(() => ObjectPayment)
    object: ObjectPayment
}
