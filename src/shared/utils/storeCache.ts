import type { StateTree, StoreDefinition } from 'pinia'

const caches = new WeakSet()

/**
 * Добавляет в кэш новое семейство сторов
 * @param factory фабрика нового стора семейства, прнимающая имя стора
 * @returns Кэширующий хук, который создает стор c таким именем, если его еще нет и возвращает существующий если есть
 */
export function cache<SN extends string, ST extends StateTree, GT, AT>(
  factory: (name: string) => StoreDefinition<SN, ST, GT, AT>,
) {
  const cache: Map<string, ReturnType<typeof factory>> = new Map()
  caches.add(cache)

  // Делаем собственно хук
  const hook = (name: string) => {
    if (!cache.get(name)) {
      cache.set(name, factory(name))
    }
    // Важно! Поскольку кэш хранит хуки, нужно вызвать хук, чтобы все было удобно
    return (cache.get(name) as ReturnType<typeof factory>)()
  }

  // добавляем к нему вариант получения только существующего стора (полезно для взаимодействия между сторами)
  hook.existing = (name: string) => {
    // Важно! Поскольку кэш хранит хуки, нужно вызвать хук, чтобы все было удобно
    return cache.get(name) ? (cache.get(name) as ReturnType<typeof factory>)() : null
  }

  return hook
}
