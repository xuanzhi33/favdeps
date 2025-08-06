import { existsSync } from 'node:fs'

export const packageManagers = [
  {
    name: "npm",
    add: "npm install"
  },
  {
    name: "pnpm",
    add: "pnpm add"
  },
  {
    name: "yarn",
    add: "yarn add"
  }
]

export function currentPackageManager() {
  if (existsSync("yarn.lock")) {
    return 2;
  } else if (existsSync("pnpm-lock.yaml")) {
    return 1;
  } else {
    return 0;
  }
}