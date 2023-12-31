import { Request } from 'express';

export class Event {
  static NO_ID = -1;
  constructor(
    readonly id: number,
    readonly name: string,
    readonly campaign: string,
    readonly createdAt: Date,
    readonly dispatchedAt: Date | null
  ) {}

  static fromDTO(dto: EventDto) {
    return new Event(
      dto.id || this.NO_ID,
      dto.name,
      dto.campaign,
      dto.createdAt || new Date(),
      dto.dispatchedAt || null
    );
  }

  toJSON(): EventDto {
    return {
      id: this.id,
      campaign: this.campaign,
      name: this.name,
      createdAt: this.createdAt,
      dispatchedAt: this.dispatchedAt,
    };
  }
}

type EventDto = {
  id?: number;
  name: string;
  campaign: string;
  createdAt?: Date;
  dispatchedAt?: Date | null;
};
