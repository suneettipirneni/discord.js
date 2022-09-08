import type { APIUser, User } from 'discord.js';
import type { Observable } from 'rxjs';
import { distinct } from 'rxjs/operators';

export function distinctUsers<T extends { user: APIUser | User }>() {
	return (source$: Observable<T>) => source$.pipe(distinct(({ user: { id } }) => id));
}
