#!/usr/bin/env bash
# Uso: scripts/perf/ablation.sh <pasta-com-dist-A..D> [execuções]  (variantes cumulativas, ver PERFORMANCE.md)
base=$1; runs=${2:-5}
for v in A B C D; do
  for browser in chromium webkit; do
    for profile in slow fast; do
      node scripts/perf/measure.mjs --dir "$base/dist-$v" --browser $browser --profile $profile --scenario cold,warm --runs $runs \
        --out "docs/performance/raw/ablacao-$v-$browser-$profile.json" > "docs/performance/raw/ablacao-$v-$browser-$profile.txt" 2>&1
      echo "feito: $v $browser $profile"
    done
  done
done
