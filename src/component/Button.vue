<script setup lang="ts">
const log = ref("click!");
onMouseData(MouseEventType.down, (e) => {
    log.value = JSON.stringify(e);
});

</script>

<template>
<Box>
    <Text>
        {{ log }}
    </Text>
</Box>
</template>