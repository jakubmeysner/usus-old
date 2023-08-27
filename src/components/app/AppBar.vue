<script lang="ts" setup>
import { useAppStore } from "@/stores/app"

const appStore = useAppStore()
</script>

<template>
    <v-app-bar>
        <v-app-bar-nav-icon @click="appStore.drawer = !appStore.drawer" />
        <v-app-bar-title>USUS</v-app-bar-title>

        <v-dialog max-width="400">
            <template #activator="{ props }">
                <v-btn icon="mdi-information" v-bind="props" />
            </template>

            <v-card title="USUS">
                <template #actions>
                    <v-btn
                        text="GitHub"
                        href="https://github.com/jakubmeysner/usus"
                        target="_blank"
                        rel="noopener noreferrer"
                    />
                </template>
            </v-card>
        </v-dialog>
    </v-app-bar>
</template>
