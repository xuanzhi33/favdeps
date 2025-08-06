import { existsSync } from 'node:fs'

export const packageManagers = [
  {
    name: "npm",
    add: "install"
  },
  {
    name: "pnpm",
    add: "add"
  },
  {
    name: "yarn",
    add: "add"
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