<script lang="ts" setup>
import { useTermId } from "@/composables/views/timetable-simulator/term-id"
import { useUsosStore } from "@/stores/usos"
import { computed, onMounted, ref } from "vue"

const usosStore = useUsosStore()
const loading = ref(false)

const termId = useTermId()

const items = computed(() => {
    if (usosStore.terms === null) {
        return []
    }

    return usosStore.terms.map((term) => ({
        title: term.name.pl,
        value: term.id,
    }))
})

async function loadTerms() {
    try {
        loading.value = true
        await usosStore.loadTerms()
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

onMounted(loadTerms)
</script>

<template>
    <v-card title="Semestr" :loading="loading">
        <template #text>
            <v-select v-model="termId" label="Semestr" :items="items" />
        </template>
    </v-card>
</template>
