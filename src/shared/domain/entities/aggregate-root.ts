import type { DomainEvent } from '../events/domain-event';
import { BaseEntity } from './base-entity';

export abstract class AggregateRoot<TId = string> extends BaseEntity<TId> {
  private readonly domainEvents: DomainEvent[] = [];

  protected addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }
}
