<script lang="ts" setup>
import { useAppStore } from "@/stores/app"

const appStore = useAppStore()
</script>

<template>
    <v-navigation-drawer v-model="appStore.drawer">
        <v-list nav>
            <v-list-item prepend-icon="mdi-home" title="Strona główna" to="/" />

            <v-list-item
                prepend-icon="mdi-timetable"
                title="Symulator planu"
                to="/timetable-simulator"
            />
        </v-list>
    </v-navigation-drawer>
</template>
