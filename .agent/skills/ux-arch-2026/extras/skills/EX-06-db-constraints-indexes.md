---
name: EX-06-db-constraints-indexes
description: "P1 — DB constraints + indexes : enums Prisma vs String, CHECK sur les dates, indexes sur les clés fréquemment requêtées."
---

# EX-06 — DB Constraints + Indexes

## Intent

Le schéma Prisma doit utiliser des enums pour tous les champs de statut métier, des types `DateTime` pour toutes les dates, et des indexes explicites sur les colonnes utilisées dans les clauses `WHERE`, `ORDER BY` et les jointures. Ce skill documente les règles et identifie les champs prioritaires dans le schéma actuel.

## Pourquoi

Un champ `String` pour stocker un statut (ex. `"OPEN"`) n'a pas de contrainte côté DB : n'importe quelle valeur invalide peut être stockée silencieusement. Sans index sur `clientId` dans `Booking`, une requête `findMany({ where: { clientId } })` fait un full scan de la table. Sans index sur `status` dans `ReliefMission`, les listes paginées de missions sont lentes. Ces problèmes coûtent en perf et en fiabilité.

## Règles

- **Enums** : tous les champs de statut métier utilisent des enums Prisma (pas `String`) — déjà le cas dans le schéma actuel, maintenir ce choix
- **Pas de String pour les dates** : utiliser `DateTime` (pas `String`) pour les champs de date/heure métier
- **Index sur FK** : toutes les colonnes de clé étrangère fréquemment utilisées dans les requêtes (`clientId`, `talentId`, `bookingId`, `reliefMissionId`, `serviceId`) doivent avoir un index
- **Index sur status** : les colonnes `status` sur `Booking` et `ReliefMission` sont filtrées fréquemment → index recommandé
- **Index composé** : pour les requêtes filtrées par plusieurs colonnes (`clientId + status`), un index composé est plus efficace
- **Unicité** : utiliser `@unique` pour les champs d'unicité métier (email, siret le cas échéant)
- **CHECK date** : si `startTime < endTime` est une contrainte métier, la valider en DB via une migration custom (`@@check`)

## Champs Prioritaires dans le Schéma Actuel

| Modèle | Champ | Index recommandé |
|--------|-------|-----------------|
| `Booking` | `clientId` | `@@index([clientId])` |
| `Booking` | `talentId` | `@@index([talentId])` |
| `Booking` | `status` | `@@index([status])` |
| `Booking` | `clientId + status` | `@@index([clientId, status])` |
| `ReliefMission` | `clientId` | `@@index([clientId])` |
| `ReliefMission` | `status` | `@@index([status])` |
| `Notification` | `userId` | `@@index([userId])` |

## Acceptance Criteria

- [ ] Aucun champ de statut métier ne stocke une `String` libre (tous sont des enums Prisma)
- [ ] Les champs `date`, `startTime`, `endTime` dans `ReliefMission` sont `DateTime` (pas `String`)
- [ ] Index sur `clientId`, `talentId`, `status` dans `Booking`
- [ ] Index sur `clientId`, `status` dans `ReliefMission`
- [ ] Index sur `userId` dans `Notification`
- [ ] Migration générée et commitée après chaque ajout d'index

## Snippets

```prisma
// apps/api/prisma/schema.prisma — indexes recommandés

model Booking {
  id              String        @id @default(cuid())
  clientId        String
  talentId        String
  status          BookingStatus @default(PENDING)
  reliefMissionId String?
  serviceId       String?
  
  @@index([clientId])
  @@index([talentId])
  @@index([status])
  @@index([clientId, status])
}

model ReliefMission {
  id       String              @id @default(cuid())
  clientId String
  status   ReliefMissionStatus @default(OPEN)
  // ⚠️ date/startTime/endTime devraient être DateTime, pas String
  date      DateTime
  startTime DateTime
  endTime   DateTime
  
  @@index([clientId])
  @@index([status])
}

model Notification {
  id     String @id @default(cuid())
  userId String
  
  @@index([userId])
}
```

```bash
# Générer et appliquer la migration d'index
cd apps/api
npx prisma migrate dev --name add_indexes_booking_mission
```

## Tests

### Unit (Prisma)

```typescript
// Vérifier qu'une requête filtrée utilise l'index (EXPLAIN ANALYZE)
// Pseudo-test via Prisma + $queryRaw
const result = await prisma.$queryRaw`
  EXPLAIN ANALYZE
  SELECT * FROM "Booking" WHERE "clientId" = 'test-id' AND "status" = 'PENDING'
`;
// Vérifier que le plan inclut "Index Scan" et non "Seq Scan"
```

### Schema Validation

```javascript
// Vérifier dans prisma/schema.prisma que les indexes existent
import { readFileSync } from "node:fs";
import assert from "node:assert";

const schema = readFileSync("apps/api/prisma/schema.prisma", "utf8");
assert.ok(schema.includes('@@index([clientId])'), "Missing index on clientId");
assert.ok(schema.includes('@@index([status])'), "Missing index on status");
```

## Métriques

| Métrique | Cible |
|----------|-------|
| Requêtes list avec Seq Scan en prod | 0 (vérifié via pg_stat_statements) |
| Temps de réponse p99 des list endpoints | < 300 ms |
| Champs statut sans enum | 0 |

## Rollout Plan

1. **Audit** : vérifier le schéma actuel — tous les champs de statut sont déjà des enums ✓
2. **Corriger** : si `date`, `startTime`, `endTime` sont `String`, migrer vers `DateTime`
3. **Ajouter** : les indexes listés ci-dessus dans `schema.prisma`
4. **Migrer** : `npx prisma migrate dev --name add_db_indexes`
5. **Commiter** : la migration SQL générée
6. **Valider** : `EXPLAIN ANALYZE` sur les requêtes clés en staging

> **Note** : La migration de `String` → `DateTime` pour les dates est une migration destructive si des données existent. Planifier une fenêtre de maintenance ou une migration en deux étapes (ajout colonne → migration data → suppression ancienne colonne).
