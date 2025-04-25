import { classSpecs, getClassAndSpec } from "./classes";
import { PlayerType } from "./usePlayers";

type Player = {
  id: number;
  score: number;
  rolledSpec?: string;
};

type Group = Player[];
type Partition = Group[];

type ScoredPartition = {
  partition: Partition;
  variance: number;
};

// Generate all k-sized combinations of an array
function combinations<T>(arr: T[], k: number, start = 0): T[][] {
  if (k === 0) return [[]];
  const result: T[][] = [];
  for (let i = start; i <= arr.length - k; i++) {
    const head = arr[i];
    const tailCombos = combinations(arr, k - 1, i + 1);
    for (const tail of tailCombos) {
      result.push([head, ...tail]);
    }
  }
  return result;
}

// Return elements of `arr` not present in `itemsToRemove`
function difference<T extends { id: number }>(
  arr: T[],
  itemsToRemove: T[]
): T[] {
  const toRemove = new Set(itemsToRemove.map((x) => x.id));
  return arr.filter((x) => !toRemove.has(x.id));
}

// Create a canonical string representation of a partition to deduplicate
function canonicalize(partition: Partition): string {
  return partition
    .map((group) =>
      group
        .map((x) => x.id)
        .sort((a, b) => a - b)
        .join(",")
    )
    .sort()
    .join("|");
}

// Compute the total score of a group
function groupScore(group: Group): number {
  return group.reduce((sum, player) => sum + player.score, 0) / group.length;
}

// Compute variance of an array of numbers
function variance(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(
    values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length
  );
}

// Main function to generate all valid partitions and score them
function generateBalancedPartitions(players: Player[]): ScoredPartition[] {
  const memo = new Map<string, boolean>();
  const seen = new Set<string>();
  const results: Partition[] = [];

  function helper(remaining: Player[], current: Partition): void {
    if (remaining.length === 0) {
      const key = canonicalize(current);
      if (!seen.has(key)) {
        seen.add(key);
        results.push([...current]);
      }
      return;
    }

    const memoKey = remaining
      .map((p) => p.id)
      .sort((a, b) => a - b)
      .join(",");
    if (memo.has(memoKey)) return;
    memo.set(memoKey, true);

    for (const size of [4, 5]) {
      if (remaining.length >= size) {
        const groups = combinations(remaining, size);
        for (const group of groups) {
          const rest = difference(remaining, group);
          helper(rest, [...current, group]);
        }
      }
    }
  }

  helper(players, []);

  return results
    .map((partition) => {
      const scores = partition.map(groupScore);
      return {
        partition,
        variance: variance(scores),
        valid: valid(partition),
      };
    })
    .sort((a, b) => a.variance - b.variance);
}

function valid(partition: Partition): boolean {
  const correctSizes = partition.every((g) => g.length >= 4 && g.length <= 5);

  const correctRoles = partition.every((group) => {
    const roles = {
      dps: 0,
      healer: 0,
      tank: 0,
    };

    group.forEach((player) => {
      if (player.rolledSpec) {
        const [className, spec] = getClassAndSpec(player.rolledSpec);

        // @ts-expect-error: I'm not even bothering typing this.
        if (className in classSpecs && spec in classSpecs[className]) {
          // @ts-expect-error: I'm not even bothering typing this.
          const role = classSpecs[className][spec];
          if (role in roles) {
            // @ts-expect-error: I'm not even bothering typing this.
            roles[role]++;
          }
        }
      }
    });

    return roles.dps <= 3 && roles.healer <= 1 && roles.tank <= 1;
  });

  return correctSizes && correctRoles;
}

export function makeTeams(players: PlayerType[]) {
  return generateBalancedPartitions(players);
}
