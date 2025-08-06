<script setup lang="ts">
const props = defineProps<{
  list: string[];
}>();
const emit = defineEmits<{
  select: [string];
}>();
const page = ref(1);
const pageSize = ref(9);
const totalPage = computed(() => Math.ceil(props.list.length / pageSize.value));
const pagedList = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return props.list.slice(start, end);
});
const selectedIndex = ref(-1);
function goPrev() {
  if (page.value > 1) {
    page.value--;
  } else {
    page.value = totalPage.value;
  }
}
function goNext() {
  if (page.value < totalPage.value) {
    page.value++;
  } else {
    page.value = 1;
  }
}
onKeyData(["ArrowLeft"], () => {
  goPrev();
  selectedIndex.value = findIndex(0);
});

onKeyData(["ArrowRight"], () => {
  goNext();
  selectedIndex.value = findIndex(0);
});

onKeyData(["ArrowUp"], () => {
  selectedIndex.value = selectedIndex.value > 0 ? selectedIndex.value - 1 : 0;
  if (selectedIndex.value < (page.value - 1) * pageSize.value) {
    goPrev();
  } else if (selectedIndex.value >= page.value * pageSize.value) {
    goNext();
  }
});

onKeyData(["ArrowDown"], () => {
  selectedIndex.value =
    selectedIndex.value < props.list.length - 1
      ? selectedIndex.value + 1
      : props.list.length - 1;
  if (selectedIndex.value < (page.value - 1) * pageSize.value) {
    goPrev();
  } else if (selectedIndex.value >= page.value * pageSize.value) {
    goNext();
  }
});

function findIndex(indexInPage: number) {
  const index = (page.value - 1) * pageSize.value + indexInPage;
  return index;
}

onKeyData((e) => {
  if (/^[1-9]$/.test(e.input)) {
    const index = parseInt(e.input) - 1;
    if (index < pagedList.value.length) {
      selectedIndex.value = index;
    }
  }
});

watch(
  () => props.list,
  () => {
    page.value = 1;
    selectedIndex.value = 0;
  },
  {
    deep: true,
    immediate: true,
  }
);

const selectedPackage = computed(() => {
  return props.list[selectedIndex.value];
});

watch(
  selectedPackage,
  () => {
    emit("select", selectedPackage.value);
  },
  {immediate: true}
);
</script>

<template>
  <Box
    flexDirection="column"
    :width="50"
    borderStyle="single"
    :padding-x="1"
    title="Results"
    ><Box flexDirection="column" :flex-grow="1">
      <Box
        v-for="(item, index) in pagedList"
        :key="index"
        flex-direction="row"
        justify-content="space-between"
      >
        <Text
          >{{ index + 1 }} {{ selectedIndex === findIndex(index) ? "▶" : "|" }}
          {{ item }}</Text
        >
      </Box>
      <Text v-if="list.length === 0">No Results</Text>
    </Box>
    <Box justify-content="space-between">
      <Text>[Press ↑↓←→/1-9]</Text>
      <Text
        >Page: {{ page }} / {{ totalPage }}&nbsp;&nbsp;Total:
        {{ list.length }}</Text
      >
    </Box>
  </Box>
</template>
