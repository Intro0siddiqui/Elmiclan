import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import type { AbilityClass, ExtractSubjectType, InferSubjects } from '@casl/ability';
import type { User, Rank } from './types';

type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';
type Subjects = InferSubjects<'Mission' | 'User' | 'all'>;

export type AppAbility = ReturnType<typeof createMongoAbility<[Actions, Subjects]>>;
export const AppAbility = createMongoAbility as AbilityClass<AppAbility>;

export function defineRulesFor(rank: Rank, user: User) {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (rank === 'Admin') {
    can('manage', 'all'); // Admins can do anything
  } else {
    can('read', 'User', { id: user.id }); // Users can read their own profile
  }

  if (rank === 'Scout') {
    can('read', 'Mission');
    can('update', 'Mission', { status: 'Active' }); // Scouts can update active missions
  }
  
  if (rank === 'Conquistador') {
    can('read', 'Mission');
    can('create', 'Mission');
  }


  return build({
    detectSubjectType: (item) =>
      item.constructor as ExtractSubjectType<Subjects>,
  });
}
