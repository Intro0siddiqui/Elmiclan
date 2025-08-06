import { AbilityBuilder, createMongoAbility, MongoAbility, MongoQuery } from '@casl/ability';
import type { ExtractSubjectType, InferSubjects } from '@casl/ability';
import type { User, Rank } from './types';

export class Mission {
  constructor(public status: string) {}
}

export class UserSubject {
  constructor(public id: string) {}
}

type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';
type Subjects = InferSubjects<typeof Mission | typeof UserSubject | 'all'>;

export type AppAbility = MongoAbility<[Actions, Subjects], MongoQuery>;

export function defineRulesFor(rank: Rank, user: User) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (rank === 'Admin') {
    can('manage', 'all');
  } else {
    can('read', UserSubject, { id: { $eq: user.id } });
  }

  if (rank === 'Scout') {
    can('read', Mission);
    can('update', Mission, { status: { $eq: 'Active' } });
  }

  if (rank === 'Conquistador') {
    can('read', Mission);
    can('create', Mission);
  }

  return build({
    detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
  });
}