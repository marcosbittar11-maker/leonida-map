#!/usr/bin/env bash
# Uso: scripts/perf/suite.sh <rótulo> <diretório-dist> [execuções]
label=$1; dir=$2; runs=${3:-5}
for browser in chromium webkit; do
  for profile in fast slow; do
    for set in "cold,warm,region,interact,offline" "vehicles" "rank"; do
      tag=${set//,/+}; tag=${tag:0:20}
      node scripts/perf/measure.mjs --dir "$dir" --browser $browser --profile $profile --scenario "$set" --runs $runs \
        --out "docs/performance/raw/$label-$browser-$profile-${tag}.json" > "docs/performance/raw/$label-$browser-$profile-${tag}.txt" 2>&1
      echo "feito: $label $browser $profile $tag"
    done
  done
done
