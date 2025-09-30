import { nanoid } from 'nanoid'

import historicalCards from '../../historical_documents.json';
import conclusions from '../../conclusion_cards.json';

export interface Entity {
  id: string;
  [key: string]: any;
}

export interface EntityMethods {
  list(sort?: string, limit?: number, skip?: number, fields?: string[] | string): Promise<Entity[]>;
  get(id: string): Promise<Entity>;
  create(data: Record<string, any>): Promise<Entity>;
  update(id: string, data: Record<string, any>): Promise<Entity>;
  delete(id: string): Promise<void>;
  bulkCreate(data: Record<string, any>[]): Promise<Entity[]>;
}

export class EntityRepository implements EntityMethods {
  private entities: Entity[]

  constructor(data: Omit<Entity, 'id'>[]) {
    this.entities = data.map(entity => ({...entity, id: nanoid()}));
  }

  async get(id: string): Promise<Entity> {
    const entity = this.entities.find(e => e.id === id);

    if (!entity) {
      throw new Error(`Entity with id ${id} not found.`);
    }

    return {...entity};
  }

  async list(): Promise<Entity[]> {
    return this.entities.slice();
  }

  async create(data: Record<string, any>): Promise<Entity> {
    const id = nanoid();
    const entity = { id, ...data };

    this.entities = [...this.entities, entity]

    return { ...entity };
  }

  async update(id: string, data: Record<string, any>): Promise<Entity> {
    let updated: Entity;

    this.entities = this.entities.map(entity => {
      if (entity.id === id) {
        updated = { ...entity, ...data };
        return updated;
      }

      return entity;
    });
    
    if (!updated) {
      throw new Error(`Entity with id ${id} not found.`);
    }

    return {...updated};
  }

  async delete(id: string): Promise<void> {
    this.entities = this.entities.filter(entity => entity.id !== id);
  }

  async bulkCreate(data: Record<string, any>[]): Promise<Entity[]> {
    const entities = data.map(entity => ({...entity, id: nanoid()}))

    this.entities = [...this.entities, ...entities];

    return entities.map(entity => ({...entity}));
  }
}

const sourceTypeMap = {
  'Pamphlet': 'book',
  'Letter': 'letter',
  'Book': 'book',
  'Speech': 'letter',
  'Interview': 'letter',
  'Government Document': 'newspaper',
  'Minutes': 'letter',
  'Newspaper': 'newspaper',
  'Woodcut': 'letter',
  'Trial Testimony': 'letter',
  'Ships Log': 'letter',
  'Resolution': 'newspaper',
  'Diary': 'book',
  'Ledger': 'newspaper'
}

export const HistoricalCard = new EntityRepository((historicalCards as Record<string, any>[])
  .map(card => ({
    ...card,
    is_archive: true,
    source_type: card.source_type ? sourceTypeMap[card.source_type] || 'book' : 'book'
  }
)));

export const Conclusion = new EntityRepository(conclusions);

export const GameSession = new EntityRepository([]);