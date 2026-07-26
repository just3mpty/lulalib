import type { RhythmAst } from "./ast"

export function parseRhythm(src: string): RhythmAst {
    const nodes: RhythmAst = []
    let i = 0
    while (i < src.length) {
      const char = src[i]!
      if (char === " ") {
        i++
        continue
      } else if (char === "_") {
        nodes.push({type: "hold"})
      } else if (char === "-" || char === "~") {
        nodes.push({type: "rest"})
      } else {
        let sustain
        if (src[i + 1] === "@") {
          let cursor = i + 2;
          let digits = "";

          while (cursor < src.length && src[cursor]! >= "0" && src[cursor]! <= "9") {
            digits += src[cursor]!
            cursor++
          }
          sustain = Number(digits)
          i = cursor - 1
        }
        nodes.push({type: "trigger", symbol: char, sustain})
      }
      i++
    }
    return nodes
  }