<script lang="ts" setup>
import { execSync, spawn } from "node:child_process";
import List from "./component/List.vue";
import { currentPackageManager, packageManagers } from "./utils/packageManager";
import { sleep } from "./utils/sleep";

// All imports are automatic but if you want to import anything,
// remember to import from 'vue-termui':
// import { ref } from 'vue-termui'
const deps = ref<string[]>([]);
const loading = ref(true);
const running = ref(false);

async function getDeps() {
  try {
    loading.value = true;
    const res = await fetch(
      process.env.FAVDEPS_URL ||
      "https://raw.githubusercontent.com/xuanzhi33/favdeps/refs/heads/main/example/deps.txt"
    );
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    const text = await res.text();
    const rows = text
      .split("\n")
      .map((row) => row.trim())
      .filter((row) => row);
    deps.value = rows;
  } catch (error) {
    if (error instanceof Error) {
      showInfo("Error: " + error.message);
    }
  } finally {
    loading.value = false;
  }
}
const packageManager = ref(0);
const packageManagerOptions = computed(() => {
  return packageManagers[packageManager.value];
});


async function install(command: string) {
  if (running.value) {
    showInfo("Please wait for the last installation to complete.\nPress [\\] to see the logs.");
    return;
  }
  currentView.value = "shell";
  shellOutput.value+= `> ${packageManagerOptions.value.name} ${packageManagerOptions.value.add} ${command}\n`;
  running.value = true;
  const child = spawn(packageManagerOptions.value.name, [
    packageManagerOptions.value.add,
    ...command.split(" "),
  ]);
  child.stdout.on("data", (data) => {
    shellOutput.value += data.toString();
  });
  child.stderr.on("data", (data) => {
    shellOutput.value += data.toString();
  });
  child.on("exit", async () => {
    running.value = false;
    await sleep(300);
    currentView.value = "main";
  });

}

onMounted(async () => {
  getDeps();
  packageManager.value = currentPackageManager();
});
const input = ref("");
onKeyData((e) => {
  if (e.key === ",") {
    packageManager.value =
      packageManager.value === packageManagers.length - 1
        ? 0
        : packageManager.value + 1;
    return;
  }
  if (e.key === "Escape") {
    if (currentView.value !== 'main') {
      currentView.value = 'main';
    } else if (input.value.length > 0) {
      input.value = "";
    } else {
      process.exit();
    }
    return;
  }
  if (e.key === "/") {
    currentView.value = "shell";
    return;
  }

  if (e.key === "!") {
    getDeps();
    return;
  }

  if (e.key === "?") {
    showInfo(`Set the environment variable FAVDEPS_URL to change the source of the dependencies list.
The dependency list should be a text file, with each line representing a dependency. Because it will be concatenated with the installation command, you can add "-D" to specify it as a development dependency.
The usual practice is to upload this file to a GitHub repository and set the FAVDEPS_URL as the RAW link of this file.
Tips:
Press [!] to refresh the dependencies list
Press [/] to see the logs of the last installation (and [ESC] for back)`);
    return;
  }

  if (e.key === "Enter") {
    install(selectedPackage.value);
    input.value = "";
    return;
  }

  const letter = /^[a-zA-Z@_/-]+$/;
  if (e.key === "Backspace") {
    input.value = input.value.slice(0, -1);
  } else if (letter.test(e.input)) {
    input.value += e.input;
  }
});

const cursorShow = ref(true);
const selectedPackage = ref("");
const currentView = ref("main");
const infoText = ref("");
const shellOutput = ref("");

function showInfo(text: string) {
  infoText.value = text;
  currentView.value = "info";
}

useInterval(() => {
  cursorShow.value = !cursorShow.value;
}, 500);

const filteredDeps = computed(() => {
  return deps.value.filter((dep) => dep.includes(input.value));
});
</script>

<template>
  <Box
    title="FavDeps by xuanzhi33"
    :width="100"
    maxWidth="100%"
    :minHeight="14"
    flexDirection="row"
    borderStyle="round"
    v-if="currentView !== 'shell'"
  >
    <template v-if="currentView === 'main'"><Box :flexGrow="1" :marginX="1" flexDirection="column">
      <Box borderStyle="single" :paddingX="1" title="Package Name">
        <Text>
          {{
            input
              ? input + (cursorShow ? "▏" : "")
              : (cursorShow ? "▏" : " ") + "Enter keyword to search..."
          }}
        </Text>
      </Box>

      <Box
        borderStyle="single"
        flexDirection="column"
        :paddingX="1"
        title="Command"
      >
        <Text v-if="selectedPackage"
          >>
          {{ packageManagerOptions.name }}
          {{ packageManagerOptions.add }}
          {{ selectedPackage }}</Text
        >
        <Text v-if="selectedPackage">Press [Enter] to run immediately </Text>
        <Text>Using {{ packageManagerOptions.name }} [Press , to switch]</Text>

        <Text
          >Press [ESC] to {{ input.length > 0 ? "clear input" : "exit" }}</Text
        >
        <Text>Press [?] for more information</Text></Box
      >
    </Box>

    <Box :flexShrink="0" :marginRight="1">
      <List v-if="!loading"
        :list="filteredDeps"
        @select="
          (e) => {
            selectedPackage = e;
          }
        "
      />
      <Box v-else justifyContent="center" alignItems="center" :width="50">
        <Text>Loading...</Text>
      </Box>
    </Box></template>
    <template v-else-if="currentView === 'info'">
      <Box title="Info" flexDirection="column" borderStyle="single" :flexGrow="1" :marginY="0" :marginX="1" :paddingX="2">

        <Box :flexGrow="1"><Text>{{ infoText }}</Text></Box>
        
        <Box justifyContent="center"><Text>Press [ESC] to dismiss
        </Text></Box>
      </Box>
    </template>
  </Box>
  <Box v-else borderStyle="round" :title="`FavDeps [${running ? 'Installing...' : 'Log'}]`" width="100%" :minHeight="5" :paddingX="1">
    <Text>
      {{ shellOutput.split("\n").slice(-12).join("\n") }}{{ cursorShow && running ? "▉" : " " }}
    </Text>
  </Box>
</template>
